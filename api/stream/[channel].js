const channels = require("../../channels.json");

const SPOOF_HEADERS = {
  "Referer": "https://www.visionplus.id/",
  "User-Agent": "OTT Navigator/1.7.4.1 (Linux;Android 15; 1j0jmqi) ExoPlayerLib/2.15.1",
  "Accept": "*/*",
  "Accept-Encoding": "identity", // Penting: hindari gzip agar Vercel tidak salah decode
  "Connection": "Keep-Alive",
};

function rewriteMpd(mpdText, originBase, proxySegmentBase) {
  // Rewrite atribut media, initialization, href
  let result = mpdText.replace(
    /(media|initialization|href)="([^"]+)"/g,
    (match, attr, val) => {
      let absoluteUrl;
      if (val.startsWith("http://") || val.startsWith("https://")) {
        absoluteUrl = val;
      } else {
        absoluteUrl = originBase + val;
      }
      return `${attr}="${proxySegmentBase}?__url=${encodeURIComponent(absoluteUrl)}"`;
    }
  );

  // Rewrite BaseURL jika ada
  result = result.replace(
    /<BaseURL>([^<]+)<\/BaseURL>/g,
    (match, url) => {
      const absoluteUrl = url.startsWith("http") ? url : originBase + url;
      return `<BaseURL>${proxySegmentBase}?__url=${encodeURIComponent(absoluteUrl)}</BaseURL>`;
    }
  );

  return result;
}

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return res.status(200).end();
  }

  const { channel } = req.query;
  const rawUrl = req.query.__url;

  // Mode 1: proxy segment/init via ?__url=...
  if (rawUrl) {
    const targetUrl = decodeURIComponent(rawUrl);

    // Validasi domain hanya boleh cloudfront.net
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return res.status(400).end("Invalid URL");
    }
    if (!parsedUrl.hostname.endsWith(".cloudfront.net")) {
      return res.status(403).end("Forbidden");
    }

    try {
      const upstream = await fetch(targetUrl, {
        headers: SPOOF_HEADERS,
      });

      if (!upstream.ok) {
        return res.status(upstream.status).end(`Segment error: ${upstream.status} ${upstream.statusText}`);
      }

      const contentType = upstream.headers.get("content-type") || "application/octet-stream";
      const buffer = Buffer.from(await upstream.arrayBuffer());

      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=4");
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
    const upstream = await fetch(originUrl, {
      headers: SPOOF_HEADERS,
    });

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .end(`Manifest error: ${upstream.status} ${upstream.statusText} — URL: ${originUrl}`);
    }

    const mpdText = await upstream.text();

    // Base URL origin untuk resolve relative segment path
    const originBase = originUrl.substring(0, originUrl.lastIndexOf("/") + 1);

    // Base URL proxy untuk rewrite segment
    const host = req.headers.host;
    const proxySegmentBase = `https://${host}/api/stream/${channel}`;

    const rewritten = rewriteMpd(mpdText, originBase, proxySegmentBase);

    res.setHeader("Content-Type", "application/dash+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store");
    return res.status(200).send(rewritten);
  } catch (err) {
    return res.status(500).json({ error: "Gagal mengambil manifest", detail: err.message });
  }
}
