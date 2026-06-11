// VisionPlus Live Proxy — Vercel Edge Function
// Endpoints:
//   /api/proxy?action=license&url=<encoded_multirights_url>  → return {mpdUrl, licenseUrl}
//   /api/proxy?url=<encoded_url>                             → proxy MPD/segment dengan CORS

const VISIONPLUS_API = 'https://www.visionplus.id/streamlocators/multirights/getPlayableUrlAndLicense';
const PROVISIONING  = 'eyJwcm92aXNpb25pbmciOlt7InN5c3RlbSI6InZlcmltYXRyaXgiLCJkYXRhIjpbeyJuYW1lIjoidnVpZCIsInZhbHVlIjoiN2M2Yzg5NWUtYmY0My00MmU3LWFiNjAtNWE5NDk4MTUxMGQ0In1dfV19';

// ─── IRIS Headers dari akun VisionPlus ─────────────────────────
// Ganti dengan nilai dari akun lu sendiri kalau token expire
const IRIS_HEADERS = {
  'Authorization':    process.env.VP_AUTH_TOKEN || '',
  'IRIS-DEVICE-CLASS': 'MOBILE',
  'IRIS-DEVICE-TYPE':  'ANDROID/CHROME',
  'IRIS-HW-DEVICE-ID': process.env.VP_HW_ID || '7c6c895e-bf43-42e7-ab60-5a94981510d4',
  'IRIS-APP-VERSION':  '11.4.13(0)_prd',
  'IRIS-LANGUAGE':     'IND',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { url, action } = req.query;
  if (!url) { res.status(400).json({ error: 'Missing url' }); return; }

  // ── ACTION: license — fetch MPD URL + license URL dari VisionPlus API
  if (action === 'license') {
    try {
      const targetUrl = decodeURIComponent(url); // multirights://... URL dari playlist

      const apiUrl = `${VISIONPLUS_API}?adsProfile=free&drm=WV&packaging=DASH&provisioningData=${PROVISIONING}&url=${encodeURIComponent(targetUrl)}`;
      const r = await fetch(apiUrl, { headers: IRIS_HEADERS });
      const data = await r.json();

      if (!data.allowed || !data.videos?.length) {
        res.status(403).json({ error: data.mes || 'Not allowed', raw: data });
        return;
      }

      const video = data.videos[0];
      const license = video.licenses?.find(l => l.system === 'com.widevine.alpha');

      res.status(200).json({
        mpdUrl:     video.url,
        licenseUrl: license?.url || null,
        system:     license?.system || null,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  // ── DEFAULT: proxy MPD/segment dengan CORS headers
  const targetUrl = decodeURIComponent(url);
  const allowed = ['cloudfront.net', 'visionplus.id', 'verimatrixcloud.net'];
  if (!allowed.some(d => targetUrl.includes(d))) {
    res.status(403).json({ error: 'Domain not allowed' });
    return;
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0 Mobile Safari/537.36',
      'Accept': '*/*',
      'Origin': 'https://www.visionplus.id',
      'Referer': 'https://www.visionplus.id/',
    };

    const upstream = await fetch(targetUrl, { headers });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || '';
    const isMpd  = targetUrl.endsWith('.mpd') || contentType.includes('dash+xml') || contentType.includes('xml');
    const isM3u8 = targetUrl.endsWith('.m3u8') || contentType.includes('mpegurl');

    if (isMpd || isM3u8) {
      let text = await upstream.text();
      const baseUrl  = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      const proxyBase = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/proxy?url=`;

      if (isMpd) {
        text = text.replace(/<BaseURL>(.*?)<\/BaseURL>/g, (_, u) => {
          const abs = u.startsWith('http') ? u : baseUrl + u;
          return `<BaseURL>${proxyBase}${encodeURIComponent(abs)}</BaseURL>`;
        });
        res.setHeader('Content-Type', 'application/dash+xml');
      } else {
        text = text.split('\n').map(line => {
          if (line.startsWith('#') || !line.trim()) return line;
          const abs = line.startsWith('http') ? line : baseUrl + line;
          return proxyBase + encodeURIComponent(abs);
        }).join('\n');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      }

      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).send(text);
    } else {
      const buf = await upstream.arrayBuffer();
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=30');
      res.status(200).send(Buffer.from(buf));
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
