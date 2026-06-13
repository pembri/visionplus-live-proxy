import requests
from http.server import BaseHTTPRequestHandler

HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip",
    "Origin": "https://www.vidio.com",
    "Referer": "https://www.vidio.com/",
    "User-Agent": "Vidio/6.43.9-8ec34856ef (Linux;Android 11) ExoPlayerLib/2.19.1",
}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs

        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        stream_id = params.get("id", ["204"])[0]
        stream_type = params.get("type", ["hls"])[0]

        # Forward ke nextgenz
        nextgenz_url = f"https://nextgenz.my.id/event/pidio/play.m3u8?id={stream_id}&type={stream_type}"

        try:
            resp = requests.get(nextgenz_url, headers=HEADERS, allow_redirects=False, timeout=10)
            location = resp.headers.get("Location")

            if location:
                self.send_response(302)
                self.send_header("Location", location)
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
            else:
                self._error(502, f"No redirect from nextgenz: {resp.status_code}")

        except Exception as e:
            self._error(502, str(e))

    def _error(self, code, message):
        import json
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())

    def log_message(self, format, *args):
        pass
