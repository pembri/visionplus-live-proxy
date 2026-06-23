import json
import os
import requests
from http.server import BaseHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(BASE_DIR, "channels.json")) as f:
    CHANNELS = json.load(f)

HEADERS = {
    "Referer": "https://www.visionplus.id/",
    "User-Agent": "Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
    "Accept": "application/dash+xml,video/*,audio/*",
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Origin": "https://www.visionplus.id",
    "Connection": "keep-alive",
}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.lstrip("/").split("?")[0]
        parts = path.split("/")

        if len(parts) != 3 or parts[0] != "stream-dash" or parts[2] != "master.mpd":
            self._error(400, "Bad request")
            return

        slug = parts[1]
        if slug not in CHANNELS:
            self._error(404, f"Channel not found: {slug}")
            return

        origin_url = CHANNELS[slug]

        try:
            resp = requests.get(origin_url, headers=HEADERS, timeout=15)
            resp.raise_for_status()

            self.send_response(200)
            self.send_header("Content-Type", "application/dash+xml")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(resp.content)

        except Exception as e:
            self._error(502, f"Error: {str(e)}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.end_headers()

    def _error(self, code, msg):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(str(msg).encode())

    def log_message(self, format, *args):
        pass
