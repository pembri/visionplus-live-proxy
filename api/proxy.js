export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { url } = req.query;
  if (!url) { res.status(400).json({ error: 'Missing url param' }); return; }

  let targetUrl;
  try { targetUrl = decodeURIComponent(url); } 
  catch { res.status(400).json({ error: 'Invalid url' }); return; }

  // Whitelist domain
  const allowed = ['cloudfront.net', 'visionplus.id', 'mivo.com', 'vidio.com', 'indihome.co.id'];
  const isAllowed = allowed.some(d => targetUrl.includes(d));
  if (!isAllowed) { res.status(403).json({ error: 'Domain not allowed' }); return; }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0 Mobile Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'id-ID,id;q=0.9',
      'Origin': 'https://www.visionplus.id',
      'Referer': 'https://www.visionplus.id/',
    };

    const upstream = await fetch(targetUrl, { headers });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || '';
    const isMpd = targetUrl.endsWith('.mpd') || contentType.includes('dash+xml') || contentType.includes('xml');
    const isM3u8 = targetUrl.endsWith('.m3u8') || contentType.includes('mpegurl');

    if (isMpd || isM3u8) {
      // Rewrite manifest — ganti URL segment jadi lewat proxy ini
      let text = await upstream.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      const proxyBase = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/proxy?url=`;

      if (isMpd) {
        // Rewrite relative URL di MPD: BaseURL, initialization, media
        text = text.replace(/<BaseURL>(.*?)<\/BaseURL>/g, (match, u) => {
          const abs = u.startsWith('http') ? u : baseUrl + u;
          return `<BaseURL>${proxyBase}${encodeURIComponent(abs)}</BaseURL>`;
        });
        // Rewrite initialization dan media attribute di SegmentTemplate
        text = text.replace(/(initialization|media)="([^"]+)"/g, (match, attr, u) => {
          if (u.startsWith('http')) {
            return `${attr}="${proxyBase}${encodeURIComponent(u)}"`;
          }
          // Relative — biarkan, akan di-resolve Shaka dari BaseURL
          return match;
        });
        res.setHeader('Content-Type', 'application/dash+xml');
      } else {
        // M3U8 rewrite
        text = text.split('\n').map(line => {
          if (line.startsWith('#') || line.trim() === '') return line;
          const abs = line.startsWith('http') ? line : baseUrl + line;
          return proxyBase + encodeURIComponent(abs);
        }).join('\n');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      }

      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).send(text);
    } else {
      // Binary segment — pipe langsung
      const buffer = await upstream.arrayBuffer();
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.status(200).send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
}
