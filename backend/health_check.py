"""
LuxeStay Health & Availability Verification System
Run: python health_check.py [--frontend] [--backend] [--database] [--auth] [--payments] [--all]
"""

import json
import os
import sys
import time
import argparse
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5501")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:sourav977@localhost:5432/luxestay_db")
TEST_EMAIL = f"health_test_{int(time.time())}@example.com"
TEST_PASSWORD = "test1234"

PASS = "PASS"
WARN = "WARN"
FAIL = "FAIL"

results = []
issues = []
response_times = {}


def record(component, check, status, detail="", response_time=None):
    results.append({
        "component": component,
        "check": check,
        "status": status,
        "detail": detail,
        "response_time_ms": round(response_time, 2) if response_time else None,
    })
    if response_time is not None:
        response_times[check] = round(response_time, 2)


def add_issue(severity, component, description, remediation=""):
    issues.append({
        "severity": severity,
        "component": component,
        "description": description,
        "remediation": remediation,
    })


def http_get(url, token=None, timeout=10, parse_json=True):
    start = time.time()
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        req = Request(url, headers=headers)
        resp = urlopen(req, timeout=timeout)
        elapsed = (time.time() - start) * 1000
        body = resp.read().decode()
        if parse_json:
            return resp.status, json.loads(body), elapsed
        return resp.status, body, elapsed
    except HTTPError as e:
        elapsed = (time.time() - start) * 1000
        try:
            body = e.read().decode()
            data = json.loads(body) if parse_json else body
        except Exception:
            data = {}
        return e.code, data, elapsed
    except URLError as e:
        elapsed = (time.time() - start) * 1000
        return 0, {"error": str(e.reason)}, elapsed
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        return 0, {"error": str(e)}, elapsed


def http_post(url, body, token=None, timeout=10, method="POST"):
    start = time.time()
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        encoded = json.dumps(body).encode()
        req = Request(url, data=encoded if method == "POST" else None, headers=headers, method=method)
        resp = urlopen(req, timeout=timeout)
        elapsed = (time.time() - start) * 1000
        return resp.status, json.loads(resp.read().decode()), elapsed
    except HTTPError as e:
        elapsed = (time.time() - start) * 1000
        try:
            err_data = json.loads(e.read().decode())
        except Exception:
            err_data = {}
        return e.code, err_data, elapsed
    except URLError as e:
        elapsed = (time.time() - start) * 1000
        return 0, {"error": str(e.reason)}, elapsed
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        return 0, {"error": str(e)}, elapsed


def check_env_vars():
    required = {
        "DATABASE_URL": os.getenv("DATABASE_URL"),
        "SECRET_KEY": os.getenv("SECRET_KEY"),
    }
    for name, val in required.items():
        if not val:
            record("Environment", name, FAIL, f"Missing: {name}")
            add_issue("CRITICAL", "Environment", f"Missing env var: {name}", f"Set {name} in .env file")
        elif val in ("change-me", "changethis"):
            record("Environment", name, WARN, f"Default: {name}")
            add_issue("HIGH", "Environment", f"Default value for {name}", "Change to a secure value in production")
        else:
            record("Environment", name, PASS, "Present")


def check_frontend():
    status, body, elapsed = http_get(FRONTEND_URL, parse_json=False)
    if status == 200 and len(body) > 100:
        record("Frontend", "HTTP 200", PASS, f"Frontend reachable at {FRONTEND_URL}", elapsed)
    else:
        record("Frontend", "HTTP 200", FAIL, f"Not reachable: status {status}", elapsed)
        add_issue("CRITICAL", "Frontend", f"Frontend not serving on {FRONTEND_URL}", "Start Live Server or http.server on port 5501")


def check_backend_health():
    status, data, elapsed = http_get(f"{BASE_URL}/health")
    if status == 200 and data.get("status") == "healthy":
        record("Backend", "Health Endpoint", PASS, "Healthy", elapsed)
    else:
        record("Backend", "Health Endpoint", FAIL, f"Status {status}: {data}", elapsed)
        add_issue("CRITICAL", "Backend", "Health endpoint not responding", "Check uvicorn process and logs")


def check_backend_routes():
    routes = [
        ("/register", "Register endpoint"),
        ("/login", "Login endpoint"),
        ("/rooms", "Rooms endpoint"),
    ]
    for path, name in routes:
        if path in ("/register", "/login"):
            status, data, elapsed = http_post(f"{BASE_URL}{path}", {"email": "dummy@test.com", "password": "dummy"})
        else:
            status, data, elapsed = http_get(f"{BASE_URL}{path}")
        if status in (200, 201, 400, 401, 422):
            record("Backend", name, PASS, f"Route {path} responds", elapsed)
        else:
            record("Backend", name, FAIL, f"Route {path} returned {status}", elapsed)
            add_issue("CRITICAL", "Backend", f"Route {path} not responding", "Check FastAPI application and logs")


def check_database():
    try:
        import asyncio
        from sqlalchemy import text
        from database import engine

        async def test_db():
            start = time.time()
            try:
                async with engine.connect() as conn:
                    result = await conn.execute(text("SELECT 1"))
                    row = result.fetchone()
                    elapsed = (time.time() - start) * 1000
                    if row and row[0] == 1:
                        record("Database", "Connection", PASS, "PostgreSQL connected", elapsed)
                    else:
                        record("Database", "Connection", FAIL, "Unexpected query result")
                        add_issue("CRITICAL", "Database", "Query returned unexpected result", "Check database state")
            except Exception as e:
                elapsed = (time.time() - start) * 1000
                record("Database", "Connection", FAIL, str(e)[:80], elapsed)
                add_issue("CRITICAL", "Database", f"Cannot connect: {e}", "Check DATABASE_URL and PostgreSQL service")

        asyncio.run(test_db())
    except Exception as e:
        record("Database", "Connection", FAIL, f"Import error: {e}")


def check_auth_flow():
    status, data, elapsed = http_post(
        f"{BASE_URL}/register",
        {"full_name": "Health Test", "email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    if status == 200 and "access_token" in data:
        record("Auth", "Register", PASS, "User registered successfully", elapsed)
        token = data["access_token"]
    elif status == 400 and "already" in str(data).lower():
        record("Auth", "Register", PASS, "User already exists", elapsed)
        token = None
    else:
        record("Auth", "Register", FAIL, f"Register failed: {data}", elapsed)
        add_issue("CRITICAL", "Auth", "User registration failed", "Check /register endpoint and database")
        return

    if not token:
        status, data, elapsed = http_post(
            f"{BASE_URL}/login",
            {"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        if status == 200 and "access_token" in data:
            token = data["access_token"]
            record("Auth", "Login", PASS, "Login successful", elapsed)
        else:
            record("Auth", "Login", FAIL, f"Login failed: {data}", elapsed)
            add_issue("HIGH", "Auth", "Login failed", "Check /login endpoint and password hash")
            return
    else:
        record("Auth", "Login", PASS, "Already logged in from register", 0)

    status, data, elapsed = http_get(f"{BASE_URL}/profile", token=token)
    if status == 200 and "email" in data:
        record("Auth", "Profile", PASS, "Profile accessible with JWT", elapsed)
    else:
        record("Auth", "Profile", FAIL, f"Profile failed: {data}", elapsed)
        add_issue("HIGH", "Auth", "JWT-protected profile endpoint failed", "Check get_current_user dependency")

    return token


def check_rooms(token=None):
    status, data, elapsed = http_get(f"{BASE_URL}/rooms")
    if status == 200 and isinstance(data, list):
        record("Rooms", "List Rooms", PASS, f"Returned {len(data)} rooms", elapsed)
    else:
        record("Rooms", "List Rooms", FAIL, f"Failed: {data}", elapsed)
        add_issue("HIGH", "Rooms", "Rooms endpoint not returning data", "Check seed data and /rooms endpoint")


def check_bookings(token):
    if not token:
        record("Bookings", "Create", WARN, "Skipped - no auth token")
        return

    status, rooms, elapsed = http_get(f"{BASE_URL}/rooms")
    if status != 200 or not rooms:
        record("Bookings", "Create", WARN, "Skipped - no rooms available")
        return

    room = rooms[0]
    status, data, elapsed = http_post(
        f"{BASE_URL}/bookings",
        {"room_id": room["id"], "check_in": "2026-07-01", "check_out": "2026-07-03"},
        token=token,
    )
    if status == 201 and data.get("booking_status") == "CONFIRMED":
        record("Bookings", "Create", PASS, f"Booking created: #{data['id']}", elapsed)
        booking_id = data["id"]
    else:
        record("Bookings", "Create", WARN if status == 400 else FAIL, f"Response: {status}", elapsed)
        return

    status, data, elapsed = http_get(f"{BASE_URL}/bookings", token=token)
    if status == 200 and isinstance(data, list):
        record("Bookings", "List", PASS, f"Found {len(data)} bookings", elapsed)
    else:
        record("Bookings", "List", FAIL, f"Failed: {data}", elapsed)

    status, data, elapsed = http_post(
        f"{BASE_URL}/bookings/{booking_id}",
        {},
        token=token,
        method="DELETE",
    )
    if status == 200 and "cancelled" in str(data).lower():
        record("Bookings", "Cancel", PASS, "Booking cancelled", elapsed)
    else:
        record("Bookings", "Cancel", WARN, f"Cancel response: {data}", elapsed)


def check_payments(token):
    if not token:
        record("Payments", "Endpoints", WARN, "Skipped - no auth token")
        return

    status, data, elapsed = http_post(
        f"{BASE_URL}/bookings",
        {"room_id": 1, "check_in": "2026-08-01", "check_out": "2026-08-03"},
        token=token,
    )
    if status != 201:
        record("Payments", "Payment Flow", WARN, "Skipped - could not create booking")
        return

    booking_id = data["id"]
    status, data, elapsed = http_post(
        f"{BASE_URL}/payments/create-order",
        {"booking_id": booking_id, "amount": 1000},
        token=token,
    )
    if status == 200 and "razorpay_order_id" in data:
        record("Payments", "Create Order", PASS, "Razorpay order created", elapsed)
    elif status == 500 and "configured" in str(data):
        record("Payments", "Create Order", WARN, "Razorpay not configured (expected in dev)", elapsed)
    else:
        record("Payments", "Create Order", WARN, f"Response status: {status}", elapsed)


def check_response_times():
    for check, ms in response_times.items():
        if ms > 5000:
            add_issue("HIGH", "Performance", f"Very slow: {check} took {ms:.0f}ms", "Review endpoint logic and database queries")
        elif ms > 2000:
            add_issue("MEDIUM", "Performance", f"Slow response: {check} took {ms:.0f}ms", "Check endpoint logic, database pool size")
        elif ms > 500:
            add_issue("LOW", "Performance", f"Elevated response time: {check} took {ms:.0f}ms", "Review endpoint performance")


def generate_report():
    components = {}
    for r in results:
        c = r["component"]
        if c not in components:
            components[c] = PASS
        if r["status"] == FAIL:
            components[c] = FAIL
        elif r["status"] == WARN and components[c] != FAIL:
            components[c] = WARN

    status_order = {PASS: 0, WARN: 1, FAIL: 2}
    overall = max(components.values(), key=lambda s: status_order.get(s, 0)) if components else PASS

    return {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "environment": os.getenv("APP_ENV", "development"),
        "status_summary": components,
        "overall_status": overall,
        "issues": sorted(issues, key=lambda i: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].index(i["severity"])),
        "checks": results,
        "response_times_ms": response_times,
    }


def print_report(report):
    sev_color = {"CRITICAL": "\033[91m", "HIGH": "\033[93m", "MEDIUM": "\033[94m", "LOW": "\033[90m"}
    status_color = {PASS: "\033[92m", WARN: "\033[93m", FAIL: "\033[91m"}
    reset = "\033[0m"

    print("\n" + "=" * 60)
    print("  LUXESTAY HEALTH CHECK REPORT")
    print("=" * 60)
    print(f"  Timestamp:   {report['timestamp']}")
    print(f"  Environment: {report['environment']}")
    print(f"  API Base:    {BASE_URL}")
    print(f"  Frontend:    {FRONTEND_URL}")
    print()

    print("  " + "-" * 56)
    print("  STATUS SUMMARY")
    print("  " + "-" * 56)
    for comp, status in sorted(report["status_summary"].items()):
        color = status_color.get(status, reset)
        print(f"    {comp:20s}  {color}{status}{reset}")
    print()

    overall = report["overall_status"]
    ocolor = status_color.get(overall, reset)
    print(f"  OVERALL SYSTEM HEALTH:  {ocolor}{overall}{reset}")
    print()

    if report["issues"]:
        print("  " + "-" * 56)
        print("  DETECTED ISSUES")
        print("  " + "-" * 56)
        for issue in report["issues"]:
            color = sev_color.get(issue["severity"], reset)
            print(f"  [{color}{issue['severity']}{reset}]")
            print(f"    Component:    {issue['component']}")
            print(f"    Description:  {issue['description']}")
            if issue["remediation"]:
                print(f"    Remediation:  {issue['remediation']}")
            print()
    else:
        print("  No issues detected.\n")

    print("  " + "-" * 56)
    print("  DETAILED CHECKS")
    print("  " + "-" * 56)
    for r in results:
        color = status_color.get(r["status"], reset)
        rt = f" [{r['response_time_ms']}ms]" if r["response_time_ms"] else ""
        print(f"  {color}{r['status']:5s}{reset}  {r['component']:15s}  {r['check']:25s}  {r['detail'][:60]}{rt}")

    print("\n" + "=" * 60)
    print()


def main():
    parser = argparse.ArgumentParser(description="LuxeStay Health Check")
    parser.add_argument("--frontend", action="store_true", help="Check frontend")
    parser.add_argument("--backend", action="store_true", help="Check backend")
    parser.add_argument("--database", action="store_true", help="Check database")
    parser.add_argument("--auth", action="store_true", help="Check auth flow")
    parser.add_argument("--payments", action="store_true", help="Check payments")
    parser.add_argument("--all", action="store_true", help="Run all checks (default)")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    parser.add_argument("--output", type=str, help="Write report to file")
    parser.add_argument("--quick", action="store_true", help="Skip DB connect, just check HTTP endpoints")
    args = parser.parse_args()

    run_all = args.all or not (args.frontend or args.backend or args.database or args.auth or args.payments)

    if not args.json:
        print("Health checks running...")

    check_env_vars()

    if run_all or args.frontend:
        check_frontend()
    if run_all or args.backend:
        check_backend_health()
        check_backend_routes()
    if (run_all or args.database) and not args.quick:
        check_database()
    if run_all or args.auth:
        token = check_auth_flow()
    else:
        token = None
    if run_all or args.backend:
        check_rooms(token)
        check_bookings(token)
    if run_all or args.payments:
        check_payments(token)

    check_response_times()

    report = generate_report()

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print_report(report)

    if args.output:
        with open(args.output, "w") as f:
            json.dump(report, f, indent=2)
        print(f"Report written to {args.output}")

    status_code = 0 if report["overall_status"] == PASS else 1 if report["overall_status"] == WARN else 2
    sys.exit(status_code)


if __name__ == "__main__":
    main()
