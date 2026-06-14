const channels = require("../../channels.json");

// Header yang diperlukan agar CloudFront mau merespons
const SPOOF_HEADERS = {
  "Referer": "https://www.visionplus.id/",
  "User-Agent": "OTT Navigator/1.7.4.1 (Linux;Android 15; 1j0jmqi) ExoPlayerLib/2.15.1",
  "Accept-Encoding": "gzip",
  "Connection": "Keep-Alive",
};

// Rewrite URL segment di dalam MPD agar semua request lewat proxy
function rewriteMpd(mpdText, originBase, proxyBase) {
  return mpdText.replace(
    /(media|initialization|href)="([^"]+)"/g,
    (match, attr, val) => {
      let absoluteUrl;
      if (val.startsWith("http://") || val.startsWith("https://")) {
        absoluteUrl = val;
      } else {
        absoluteUrl = originBase + val;
      }
      return `${attr}="${proxyBase}?__url=${encodeURIComponent(absoluteUrl)}"`;
    }
  );
}

export const config = {
  api: {
    responseLimit: false, // Penting: supaya bisa stream binary segment besar
  },
};

export default async function handler(req, res) {
  const { channel } = req.query;

  // Mode 1: proxy segment/init via ?__url=...
  const rawUrl = req.query.__url;
  if (rawUrl) {
    const targetUrl = decodeURIComponent(rawUrl);
    try {
      const upstream = await fetch(targetUrl, { headers: SPOOF_HEADERS });
      if (!upstream.ok) {
        return res.status(upstream.status).end(`Upstream error: ${upstream.statusText}`);
      }
      const contentType = upstream.headers.get("content-type") || "application/octet-stream";
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=5");
      return res.status(200).send(buffer);
    } catch (err) {
      return res.status(500).end(`Segment proxy error: ${err.message}`);
    }
  }

  // Mode 2: ambil manifest MPD channel
  const originUrl = channels[channel];
  if (!originUrl) {
    return res.status(404).json({ error: `Channel '${channel}' tidak ditemukan` });
  }

  try {
    const upstream = await fetch(originUrl, { headers: SPOOF_HEADERS });
    if (!upstream.ok) {
      return res.status(upstream.status).end(`Upstream error: ${upstream.statusText}`);
    }

    const mpdText = await upstream.text();

    // Base URL asal untuk resolve relative path segment
    const originBase = originUrl.substring(0, originUrl.lastIndexOf("/") + 1);

    // Base URL proxy untuk rewrite
    const host = req.headers.host;
    const proxyBase = `https://${host}/api/stream/${channel}`;

    const rewritten = rewriteMpd(mpdText, originBase, proxyBase);

    res.setHeader("Content-Type", "application/dash+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(200).send(rewritten);
  } catch (err) {
    return res.status(500).json({ error: "Gagal mengambil manifest", detail: err.message });
  }
}
