import os
import json
import requests
from http.server import BaseHTTPRequestHandler

# Konfigurasi dari environment variables
VIDIO_USER_EMAIL = os.environ.get("VIDIO_USER_EMAIL", "")
VIDIO_X_USER_TOKEN = os.environ.get("VIDIO_X_USER_TOKEN", "")
VIDIO_X_API_KEY = os.environ.get("VIDIO_X_API_KEY", "")
VIDIO_COOKIES = os.environ.get("VIDIO_COOKIES", "")

HEADERS = {
    "Accept": "*/*",
    "Accept-Language": "id",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Origin": "https://m.vidio.com",
    "Referer": "https://m.vidio.com/",
    "Pragma": "no-cache",
    "X-Api-Key": VIDIO_X_API_KEY,
    "X-Api-Platform": "web-mobile",
    "X-User-Email": VIDIO_USER_EMAIL,
    "X-User-Token": VIDIO_X_USER_TOKEN,
    "X-Secure-Level": "2",
    "User-Agent": "Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "Android",
}


def get_stream_url(stream_id, stream_type="livestreamings"):
    """
    stream_type: 'livestreamings' untuk live, 'videos' untuk VOD
    """
    url = f"https://api.vidio.com/{stream_type}/{stream_id}/stream?initialize=true"

    if VIDIO_COOKIES:
        HEADERS["Cookie"] = VIDIO_COOKIES

    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # Ambil HLS URL dari response
        hls = data.get("data", {}).get("attributes", {}).get("hls")
        if hls:
            return hls, None

        return None, f"HLS not found in response: {json.dumps(data)[:300]}"

    except requests.exceptions.HTTPError as e:
        return None, f"HTTP Error {e.response.status_code}: {e.response.text[:300]}"
    except Exception as e:
        return None, str(e)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs

        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        # Ambil parameter
        stream_id = params.get("id", ["204"])[0]
        stream_type = params.get("type", ["livestreamings"])[0]

        # Validasi type
        if stream_type not in ["livestreamings", "videos"]:
            self._error(400, "Invalid type. Use 'livestreamings' or 'videos'")
            return

        hls_url, error = get_stream_url(stream_id, stream_type)

        if error:
            self._error(502, error)
            return

        # Redirect 302 ke HLS URL
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
