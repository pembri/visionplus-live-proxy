import json
import requests
from http.server import BaseHTTPRequestHandler

HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip",
    "Origin": "https://www.vidio.com",
    "Referer": "https://www.vidio.com/",
    "User-Agent": "Vidio/6.43.9-8ec34856ef (Linux;Android 11) ExoPlayerLib/2.19.1",
}


def get_stream_url(stream_id, stream_type="livestreamings"):
    url = f"https://api.vidio.com/{stream_type}/{stream_id}/stream?initialize=true"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        attrs = data.get("data", {}).get("attributes", {})
        hls = attrs.get("hls")
        if hls:
            return hls, None

        return None, f"HLS not found: {json.dumps(data)[:500]}"

    except requests.exceptions.HTTPError as e:
        return None, f"HTTP {e.response.status_code}: {e.response.text[:500]}"
    except Exception as e:
        return None, str(e)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs

        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        stream_id = params.get("id", ["204"])[0]
        stream_type = params.get("type", ["livestreamings"])[0]

        if stream_type not in ["livestreamings", "videos"]:
            self._error(400, "Invalid type")
            return

        hls_url, error = get_stream_url(stream_id, stream_type)

        if error:
            self._error(502, error)
            return

        self.send_response(302)
        self.send_header("Location", hls_url)
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def _error(self, code, message):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())

    def log_message(self, format, *args):
        pass
