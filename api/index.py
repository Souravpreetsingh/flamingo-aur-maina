"""
Vercel Python Serverless Function - LuxeStay API
Handles all API routes without external database dependency.
"""

import json
import os
import hashlib
import hmac
import random
import string
from datetime import date, datetime, timedelta
from urllib.parse import urlparse, parse_qs

# ─── In-memory store (resets on cold start, fine for demo) ────────

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
NEXT_ID = {"user": 1, "booking": 1, "payment": 1}
JWT_SECRET = os.getenv("SECRET_KEY", "lxstay-demo-secret-key")


def json_response(data, status=200):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        "body": json.dumps(data, default=str),
    }


def parse_body(event):
    try:
        body = event.get("body", "{}")
        if isinstance(body, str):
            return json.loads(body)
        return body
    except json.JSONDecodeError:
        return {}


def get_token_user(event):
    auth = event.get("headers", {}).get("authorization", "") or event.get("headers", {}).get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    parts = token.split(".")
    if len(parts) != 3:
        return None
    try:
        payload = json.loads(base64_decode(parts[1]))
        user_id = payload.get("sub")
        for u in USERS:
            if str(u["id"]) == str(user_id):
                return u
    except Exception:
        pass
    return None


def base64_decode(s):
    s = s.replace("-", "+").replace("_", "/")
    s += "=" * (4 - len(s) % 4) if len(s) % 4 else ""
    import base64

    return base64.b64decode(s).decode()


def make_token(user_id):
    import base64

    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(
        json.dumps({"sub": str(user_id), "iat": int(datetime.now().timestamp()), "exp": int((datetime.now() + timedelta(hours=24)).timestamp())}).encode()
    ).rstrip(b"=").decode()
    sig = hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b"=").decode()
    return f"{header}.{payload}.{sig_b64}"


# ─── Route Handlers ────────────────────────────────────────────────


def handle_health(event):
    return json_response({"status": "healthy"})


def handle_register(event):
    data = parse_body(event)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()

    if not email or not password:
        return json_response({"detail": "Email and password required"}, 400)
    if len(password) < 4:
        return json_response({"detail": "Password must be at least 4 characters"}, 400)
    if any(u["email"] == email for u in USERS):
        return json_response({"detail": "Email already registered"}, 400)

    user_id = NEXT_ID["user"]
    NEXT_ID["user"] += 1
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    user = {"id": user_id, "full_name": full_name, "email": email, "phone": data.get("phone", ""), "pwd_hash": pwd_hash, "salt": salt}
    USERS.append(user)

    token = make_token(user_id)
    return json_response({
        "access_token": token,
        "user": {"id": user_id, "full_name": full_name, "email": email, "phone": data.get("phone", "")},
    })


def handle_login(event):
    data = parse_body(event)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = next((u for u in USERS if u["email"] == email), None)
    if not user:
        return json_response({"detail": "Invalid email or password"}, 401)

    pwd_hash = hashlib.sha256((password + user["salt"]).encode()).hexdigest()
    if pwd_hash != user["pwd_hash"]:
        return json_response({"detail": "Invalid email or password"}, 401)

    token = make_token(user["id"])
    return json_response({
        "access_token": token,
        "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"], "phone": user.get("phone", "")},
    })


def handle_profile(event):
    user = get_token_user(event)
    if not user:
        return json_response({"detail": "Not authenticated"}, 401)
    return json_response({"id": user["id"], "full_name": user["full_name"], "email": user["email"], "phone": user.get("phone", "")})


def handle_rooms(event):
    return json_response(ROOMS)


def handle_create_booking(event):
    user = get_token_user(event)
    if not user:
        return json_response({"detail": "Not authenticated"}, 401)

    data = parse_body(event)
    room_id = data.get("room_id")
    check_in = data.get("check_in")
    check_out = data.get("check_out")

    if not room_id or not check_in or not check_out:
        return json_response({"detail": "room_id, check_in, check_out required"}, 400)

    room = next((r for r in ROOMS if r["id"] == room_id), None)
    if not room:
        return json_response({"detail": "Room not found"}, 404)

    if check_in >= check_out:
        return json_response({"detail": "Check-out must be after check-in"}, 400)

    booking_id = NEXT_ID["booking"]
    NEXT_ID["booking"] += 1
    booking = {
        "id": booking_id,
        "user_id": user["id"],
        "room_id": room_id,
        "check_in": check_in,
        "check_out": check_out,
        "booking_status": "CONFIRMED",
    }
    BOOKINGS.append(booking)
    return json_response(booking, 201)


def handle_list_bookings(event):
    user = get_token_user(event)
    if not user:
        return json_response({"detail": "Not authenticated"}, 401)
    user_bookings = [b for b in BOOKINGS if b["user_id"] == user["id"]]
    return json_response(user_bookings)


def handle_cancel_booking(event, booking_id):
    user = get_token_user(event)
    if not user:
        return json_response({"detail": "Not authenticated"}, 401)
    booking = next((b for b in BOOKINGS if b["id"] == booking_id and b["user_id"] == user["id"]), None)
    if not booking:
        return json_response({"detail": "Booking not found"}, 404)
    BOOKINGS.remove(booking)
    return json_response({"message": "Booking cancelled"})


# ─── Main Router ───────────────────────────────────────────────────


# Vercel expects a WSGI callable named `app`
def app(environ, start_response):
    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET")

    # Read body
    try:
        content_length = int(environ.get("CONTENT_LENGTH", 0))
        body = environ["wsgi.input"].read(content_length).decode() if content_length > 0 else "{}"
    except Exception:
        body = "{}"

    # Build event
    headers = {}
    for key, val in environ.items():
        if key.startswith("HTTP_"):
            header_name = key[5:].replace("_", "-").lower()
            headers[header_name] = val
    content_type = environ.get("CONTENT_TYPE", "")
    if content_type:
        headers["content-type"] = content_type

    event = {"path": path, "httpMethod": method, "headers": headers, "body": body, "queryStringParameters": {}}

    # Parse query string
    qs = environ.get("QUERY_STRING", "")
    if qs:
        event["queryStringParameters"] = {k: v[0] if isinstance(v, list) else v for k, v in parse_qs(qs).items()}

    # CORS preflight
    if method == "OPTIONS":
        resp = {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, "body": ""}
    else:
        # Route dispatch
        if path == "/health" or path == "/api/health":
            resp = handle_health(event)
        elif path == "/register" or path == "/api/register":
            resp = handle_register(event)
        elif path == "/login" or path == "/api/login":
            resp = handle_login(event)
        elif path == "/profile" or path == "/api/profile":
            resp = handle_profile(event)
        elif path == "/rooms" or path == "/api/rooms":
            resp = handle_rooms(event)
        elif path == "/bookings" or path == "/api/bookings":
            if method == "POST":
                resp = handle_create_booking(event)
            elif method == "GET":
                resp = handle_list_bookings(event)
            else:
                resp = json_response({"detail": "Method not allowed"}, 405)
        elif path.startswith("/bookings/") or path.startswith("/api/bookings/"):
            parts = path.strip("/").split("/")
            booking_id_str = parts[-1] if parts[-1].isdigit() else None
            if booking_id_str and method == "DELETE":
                resp = handle_cancel_booking(event, int(booking_id_str))
            else:
                resp = json_response({"detail": "Not found"}, 404)
        else:
            resp = json_response({"detail": "Not found"}, 404)

    # WSGI response
    status = f"{resp.get('statusCode', 200)} {'OK' if resp.get('statusCode', 200) < 400 else 'Error'}"
    response_headers = [(k, v) for k, v in resp.get("headers", {}).items()]
    start_response(status, response_headers)
    return [resp.get("body", "").encode()]
