import requests
from http.server import BaseHTTPRequestHandler

HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "identity",
    "Origin": "https://www.vidio.com",
    "Referer": "https://www.vidio.com/",
    "User-Agent": "Vidio/6.43.9-8ec34856ef (Linux;Android 11) ExoPlayerLib/2.19.1",
}


def get_m3u8_content(stream_id, stream_type="hls"):
    nextgenz_url = f"https://nextgenz.my.id/event/pidio/play.m3u8?id={stream_id}&type={stream_type}"

    # Step 1: ambil redirect URL dari nextgenz
    resp = requests.get(nextgenz_url, headers=HEADERS, allow_redirects=False, timeout=10)
    location = resp.headers.get("Location")
    if not location:
        raise Exception(f"No redirect from nextgenz: {resp.status_code}")

    # Step 2: fetch konten m3u8 dari Akamai
    m3u8_resp = requests.get(location, headers={
        "User-Agent": HEADERS["User-Agent"],
        "Referer": "https://www.vidio.com/",
    }, timeout=10)
    m3u8_resp.raise_for_status()

    return m3u8_resp.text, location


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs

        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        stream_id = params.get("id", ["204"])[0]
        stream_type = params.get("type", ["hls"])[0]

        try:
            content, base_url = get_m3u8_content(stream_id, stream_type)

            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.apple.mpegurl")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(content.encode())

        except Exception as e:
            import json
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, format, *args):
        pass
