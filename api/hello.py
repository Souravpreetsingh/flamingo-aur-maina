import json


def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "application/json")])
    return [json.dumps({"path": environ.get("PATH_INFO", ""), "method": environ.get("REQUEST_METHOD", "")}).encode()]
