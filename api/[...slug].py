import json
import os
import hashlib
import hmac
from datetime import datetime, timedelta
from urllib.parse import parse_qs


USERS = []
ROOMS = [
    {"id": 1, "room_name": "Oceanfront Suite", "description": "Suite with private balcony and ocean view, king bed, marble bathroom.", "price": 9999, "capacity": 2, "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427", "room_type": "Suite"},
    {"id": 2, "room_name": "Penthouse Loft", "description": "Modern penthouse with panoramic city views, full kitchen, jacuzzi.", "price": 18999, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", "room_type": "Penthouse"},
    {"id": 3, "room_name": "Garden Villa", "description": "Private garden villa, pet-friendly, indoor-outdoor living.", "price": 11999, "capacity": 3, "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", "room_type": "Villa"},
    {"id": 4, "room_name": "Royal Suite", "description": "Pinnacle of luxury with separate living, dining, butler service, grand terrace.", "price": 25999, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd", "room_type": "Suite"},
    {"id": 5, "room_name": "Cozy Studio", "description": "Compact studio for solo travelers with workspace and kitchenette.", "price": 4499, "capacity": 1, "image_url": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9", "room_type": "Studio"},
    {"id": 6, "room_name": "Family Suite", "description": "Two-bedroom suite with kids play area, full kitchen, living room.", "price": 15499, "capacity": 6, "image_url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a", "room_type": "Suite"},
]
BOOKINGS = []
NEXT_ID = {"user": 1, "booking": 1}
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


def get_token_user(headers):
    auth = headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        parts = auth[7:].split(".")
        payload = json.loads(base64_decode(parts[1]))
        for u in USERS:
            if str(u["id"]) == str(payload.get("sub")):
                return u
    except Exception:
        pass
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


def app(environ, start_response):
    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET")
    headers = get_headers(environ)
    body = read_body(environ)

    if method == "OPTIONS":
        return respond("ok", start_response)

    try:
        data = json.loads(body) if body.strip() else {}
    except json.JSONDecodeError:
        data = {}

    user = get_token_user(headers)

    if path == "/api/health":
        return respond({"status": "healthy"}, start_response)

    elif path == "/api/register":
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        full_name = data.get("full_name", "").strip()
        if not email or not password:
            return respond({"detail": "Email and password required"}, start_response, 400)
        if len(password) < 4:
            return respond({"detail": "Password too short"}, start_response, 400)
        if any(u["email"] == email for u in USERS):
            return respond({"detail": "Email already registered"}, start_response, 400)
        uid = NEXT_ID["user"]; NEXT_ID["user"] += 1
        salt = os.urandom(16).hex()
        pwd = hashlib.sha256((password + salt).encode()).hexdigest()
        USERS.append({"id": uid, "full_name": full_name, "email": email, "phone": data.get("phone", ""), "pwd": pwd, "salt": salt})
        token = make_token(uid)
        return respond({"access_token": token, "user": {"id": uid, "full_name": full_name, "email": email, "phone": data.get("phone", "")}}, start_response)

    elif path == "/api/login":
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        u = next((x for x in USERS if x["email"] == email), None)
        if not u or hashlib.sha256((password + u["salt"]).encode()).hexdigest() != u["pwd"]:
            return respond({"detail": "Invalid email or password"}, start_response, 401)
        token = make_token(u["id"])
        return respond({"access_token": token, "user": {"id": u["id"], "full_name": u["full_name"], "email": u["email"], "phone": u.get("phone", "")}}, start_response)

    elif path == "/api/profile":
        if not user:
            return respond({"detail": "Not authenticated"}, start_response, 401)
        return respond({"id": user["id"], "full_name": user["full_name"], "email": user["email"], "phone": user.get("phone", "")}, start_response)

    elif path == "/api/rooms":
        return respond(ROOMS, start_response)

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
            bid = NEXT_ID["booking"]; NEXT_ID["booking"] += 1
            b = {"id": bid, "user_id": user["id"], "room_id": room_id, "check_in": ci, "check_out": co, "booking_status": "CONFIRMED"}
            BOOKINGS.append(b)
            return respond(b, start_response, 201)
        elif method == "GET":
            if not user:
                return respond({"detail": "Not authenticated"}, start_response, 401)
            return respond([b for b in BOOKINGS if b["user_id"] == user["id"]], start_response)

    elif path.startswith("/api/bookings/"):
        if method == "DELETE":
            if not user:
                return respond({"detail": "Not authenticated"}, start_response, 401)
            parts = path.strip("/").split("/")
            bid = int(parts[-1]) if parts[-1].isdigit() else None
            b = next((x for x in BOOKINGS if x["id"] == bid and x["user_id"] == user["id"]), None)
            if not b:
                return respond({"detail": "Booking not found"}, start_response, 404)
            BOOKINGS.remove(b)
            return respond({"message": "Booking cancelled"}, start_response)

    return respond({"detail": "Not found", "path": path}, start_response, 404)
