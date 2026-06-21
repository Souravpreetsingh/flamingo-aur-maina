import json
import os
import hashlib
import hmac
import urllib.request
from datetime import datetime, timedelta
from urllib.parse import quote as url_quote


SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_REST = f"{SUPABASE_URL}/rest/v1" if SUPABASE_URL else ""

JWT_SECRET = os.getenv("SECRET_KEY", "lxstay-demo-secret-key")

CORS_HEADERS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS"),
    ("Access-Control-Allow-Headers", "Content-Type, Authorization"),
]

STATUS_TEXT = {200: "200 OK", 201: "201 Created", 400: "400 Bad Request", 401: "401 Unauthorized", 404: "404 Not Found", 500: "500 Internal Server Error"}


def respond(data, start_response, status=200):
    body = json.dumps(data, default=str).encode("utf-8")
    headers = [("Content-Type", "application/json; charset=utf-8"), ("Content-Length", str(len(body)))] + CORS_HEADERS
    start_response(STATUS_TEXT.get(status, f"{status} Unknown"), headers)
    return [body]


def read_body(environ):
    try:
        cl = int(environ.get("CONTENT_LENGTH", 0))
        return environ["wsgi.input"].read(cl).decode() if cl > 0 else "{}"
    except Exception:
        return "{}"


def get_headers(environ):
    h = {}
    for k, v in environ.items():
        if k.startswith("HTTP_"):
            h[k[5:].lower().replace("_", "-")] = v
    if "CONTENT_TYPE" in environ:
        h["content-type"] = environ["CONTENT_TYPE"]
    return h


def supabase_request(method, table, params=None, body=None):
    if not SUPABASE_REST:
        return None
    url = f"{SUPABASE_REST}/{table}"
    if params:
        url += "?" + "&".join(f"{k}={url_quote(str(v), safe='')}" for k, v in params.items())
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    if method == "POST" or method == "PATCH":
        req.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        return {"_error": True, "status": e.code, "body": body_text}
    except Exception as e:
        return {"_error": True, "status": 500, "body": str(e)}


def find_user_by_email(email):
    result = supabase_request("GET", "users", params={"select": "*", "email": f"eq.{email}"})
    if result and isinstance(result, list) and len(result) > 0:
        return result[0]
    return None


def find_user_by_id(uid):
    result = supabase_request("GET", "users", params={"select": "*", "id": f"eq.{uid}"})
    if result and isinstance(result, list) and len(result) > 0:
        return result[0]
    return None


def get_rooms_from_db():
    result = supabase_request("GET", "rooms", params={"select": "*", "order": "id.asc"})
    if result and isinstance(result, list):
        return result
    return None


def base64_decode(s):
    import base64
    s = s.replace("-", "+").replace("_", "/") + "=" * (4 - len(s) % 4 if len(s) % 4 else 0)
    return base64.b64decode(s).decode()


def make_token(user_id):
    import base64
    header = base64.urlsafe_b64encode(json.dumps({"alg":"HS256","typ":"JWT"}).encode()).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(json.dumps({"sub":str(user_id),"iat":int(datetime.now().timestamp()),"exp":int((datetime.now()+timedelta(hours=24)).timestamp())}).encode()).rstrip(b"=").decode()
    sig = base64.urlsafe_b64encode(hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    return f"{header}.{payload}.{sig}"


def get_token_user(headers):
    auth = headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        parts = auth[7:].split(".")
        payload = json.loads(base64_decode(parts[1]))
        return find_user_by_id(payload.get("sub"))
    except Exception:
        return None


def app(environ, start_response):
    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET")
    hdrs = get_headers(environ)
    body = read_body(environ)

    if method == "OPTIONS":
        return respond("ok", start_response)

    try:
        data = json.loads(body) if body.strip() else {}
    except json.JSONDecodeError:
        data = {}

    user = get_token_user(hdrs)

    if path == "/api/health":
        db_result = supabase_request("GET", "users", params={"select": "id", "limit": "1"}) if SUPABASE_REST else None
        db_ok = isinstance(db_result, list)
        return respond({"status": "healthy", "database": "connected" if db_ok else "disconnected"}, start_response)

    elif path == "/api/register":
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        full_name = data.get("full_name", "").strip()
        if not email or not password:
            return respond({"detail": "Email and password required"}, start_response, 400)
        if len(password) < 4:
            return respond({"detail": "Password too short"}, start_response, 400)
        existing = find_user_by_email(email)
        if existing:
            return respond({"detail": "Email already registered"}, start_response, 400)
        salt = os.urandom(16).hex()
        pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        insert = supabase_request("POST", "users", body=json.dumps({
            "full_name": full_name, "email": email, "phone": data.get("phone", ""),
            "pwd_hash": pwd_hash, "salt": salt
        }).encode())
        if not insert or isinstance(insert, dict) and insert.get("_error"):
            return respond({"detail": "Registration failed"}, start_response, 500)
        new_user = insert[0] if isinstance(insert, list) else insert
        uid = new_user.get("id")
        token = make_token(uid)
        return respond({"access_token": token, "user": {"id": uid, "full_name": full_name, "email": email, "phone": data.get("phone", "")}}, start_response)

    elif path == "/api/login":
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        u = find_user_by_email(email)
        if not u or hashlib.sha256((password + u["salt"]).encode()).hexdigest() != u["pwd_hash"]:
            return respond({"detail": "Invalid email or password"}, start_response, 401)
        token = make_token(u["id"])
        return respond({"access_token": token, "user": {"id": u["id"], "full_name": u["full_name"], "email": u["email"], "phone": u.get("phone", "")}}, start_response)

    elif path == "/api/profile":
        if not user:
            return respond({"detail": "Not authenticated"}, start_response, 401)
        return respond({"id": user["id"], "full_name": user["full_name"], "email": user["email"], "phone": user.get("phone", "")}, start_response)

    elif path == "/api/rooms":
        rooms = get_rooms_from_db()
        if rooms is None:
            return respond({"detail": "Database unavailable"}, start_response, 503)
        return respond(rooms, start_response)

    elif path == "/api/bookings":
        if method == "POST":
            if not user:
                return respond({"detail": "Not authenticated"}, start_response, 401)
            room_id = data.get("room_id")
            ci = data.get("check_in")
            co = data.get("check_out")
            if not room_id or not ci or not co:
                return respond({"detail": "room_id, check_in, check_out required"}, start_response, 400)
            if ci >= co:
                return respond({"detail": "Check-out must be after check-in"}, start_response, 400)
            insert = supabase_request("POST", "bookings", body=json.dumps({
                "user_id": user["id"], "room_id": room_id, "check_in": ci, "check_out": co
            }).encode())
            if not insert or isinstance(insert, dict) and insert.get("_error"):
                return respond({"detail": "Booking failed"}, start_response, 500)
            new_b = insert[0] if isinstance(insert, list) else insert
            return respond(new_b, start_response, 201)
        elif method == "GET":
            if not user:
                return respond({"detail": "Not authenticated"}, start_response, 401)
            result = supabase_request("GET", "bookings", params={
                "select": "*", "user_id": f"eq.{user['id']}", "order": "created_at.desc"
            })
            return respond(result if isinstance(result, list) else [], start_response)

    elif path.startswith("/api/bookings/"):
        if method == "DELETE":
            if not user:
                return respond({"detail": "Not authenticated"}, start_response, 401)
            parts = path.strip("/").split("/")
            bid = parts[-1] if parts[-1].isdigit() else None
            if not bid:
                return respond({"detail": "Invalid booking id"}, start_response, 400)
            # Verify ownership
            check = supabase_request("GET", "bookings", params={
                "select": "id", "id": f"eq.{bid}", "user_id": f"eq.{user['id']}"
            })
            if not check or len(check) == 0:
                return respond({"detail": "Booking not found"}, start_response, 404)
            supabase_request("DELETE", "bookings", params={"id": f"eq.{bid}"})
            return respond({"message": "Booking cancelled"}, start_response)

    return respond({"detail": "Not found", "path": path}, start_response, 404)
