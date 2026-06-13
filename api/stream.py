import re
import requests
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler

HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "identity",
    "Origin": "https://www.vidio.com",
    "Referer": "https://www.vidio.com/",
    "User-Agent": "Vidio/6.43.9-8ec34856ef (Linux;Android 11) ExoPlayerLib/2.19.1",
}

BASE_URL = "https://visionplus-live-proxy.vercel.app"


def rewrite_m3u8(content, base_url):
    lines = content.splitlines()
    result = []
    for line in lines:
        line = line.strip()
        if line.startswith("#"):
            if 'URI="' in line:
                def replace_uri(m):
                    uri = m.group(1)
                    abs_uri = requests.compat.urljoin(base_url, uri)
                    return f'URI="{BASE_URL}/seg?url={requests.utils.quote(abs_uri, safe="")}"'
                line = re.sub(r'URI="([^"]+)"', replace_uri, line)
            result.append(line)
        elif line == "":
            result.append(line)
        else:
            abs_url = requests.compat.urljoin(base_url, line)
            result.append(f"{BASE_URL}/seg?url={requests.utils.quote(abs_url, safe='')}")
    return "\n".join(result)


def get_akamai_url(stream_id, stream_type="hls"):
    nextgenz_url = f"https://nextgenz.my.id/event/pidio/play.m3u8?id={stream_id}&type={stream_type}"
    resp = requests.get(nextgenz_url, headers=HEADERS, allow_redirects=False, timeout=10)
    location = resp.headers.get("Location")
    if not location:
        raise Exception(f"No redirect: {resp.status_code}")
    return location


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        # /stream-hls/204/master.m3u8
        m = re.match(r"^/stream-([^/]+)/([^/]+)/master\.m3u8$", path)
        if m:
            stream_type = m.group(1)
            stream_id = m.group(2)
            self._handle_stream(stream_id, stream_type)
            return

        # /seg?url=...
        if path == "/seg":
            self._handle_seg(params)
            return

        self._error(404, "Not found")

    def _handle_stream(self, stream_id, stream_type):
        try:
            akamai_url = get_akamai_url(stream_id, stream_type)
            resp = requests.get(akamai_url, headers=HEADERS, timeout=10)
            resp.raise_for_status()
            content = rewrite_m3u8(resp.text, akamai_url)

            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.apple.mpegurl")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(content.encode())
        except Exception as e:
            self._error(502, str(e))

    def _handle_seg(self, params):
        url = params.get("url", [None])[0]
        if not url:
            self._error(400, "Missing url")
            return
        try:
            resp = requests.get(url, headers=HEADERS, stream=True, timeout=15)
            resp.raise_for_status()
            content_type = resp.headers.get("Content-Type", "application/octet-stream")

            if "mpegurl" in content_type or url.split("?")[0].endswith(".m3u8"):
                content = resp.text
                rewritten = rewrite_m3u8(content, url)
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.apple.mpegurl")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(rewritten.encode())
            else:
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                for chunk in resp.iter_content(chunk_size=8192):
                    self.wfile.write(chunk)
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
