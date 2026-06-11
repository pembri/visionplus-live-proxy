import { getSession, invalidateSession } from './auth.js';

const VIDIO_API_KEY = 'CH1ZFsN4N/MIfAds1DL9mP151CNqIpWHqZGRr+LkvUyiq3FRPuP1Kt6aK+pG3nEC1FXt0ZAAJ5FKP8QU8CZ5/oOnzLxNND10Rm+tet/uqMtlFPMTc2yhz4IYyoRR1EiOiEIC3MckBPp+w1/0sDXRy+Ksnm1sOA+i8CqmbiBWOlU=';
const UA = 'Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36';

async function fetchStream(channelId, cookie) {
  return fetch(
    `https://api.vidio.com/livestreamings/${channelId}/stream?initialize=true`,
    {
      headers: {
        'Host': 'api.vidio.com',
        'X-Api-Key': VIDIO_API_KEY,
        'X-API-Platform': 'web-mobile',
        'X-Secure-Level': '2',
        'Origin': 'https://www.vidio.com',
        'Referer': 'https://www.vidio.com/',
        'Accept': 'application/vnd.api+json',
        'Accept-Language': 'id-ID,id;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Cookie': cookie,
        'User-Agent': UA,
      }
    }
  );
}

export default async function handler(req, res) {
  const channelId = req.query.id || '875';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ambil session (login jika belum / expired)
    let cookie = await getSession();
    let response = await fetchStream(channelId, cookie);

    // Jika 401/403, session mungkin expired → invalidate & retry sekali
    if (response.status === 401 || response.status === 403) {
      console.warn(`[stream] Session rejected (${response.status}), re-logging in...`);
      invalidateSession();
      cookie = await getSession();
      response = await fetchStream(channelId, cookie);
    }

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        error: 'Gagal ambil stream dari Vidio',
        status: response.status,
        detail: body.slice(0, 500),
      });
    }

    const data = await response.json();

    // Coba berbagai path HLS yang mungkin ada di response
    const hlsUrl =
      data?.data?.attributes?.hls ||
      data?.data?.attributes?.hls_url ||
      data?.livestreaming?.hls ||
      data?.hls;

    if (!hlsUrl) {
      return res.status(404).json({
        error: 'HLS URL tidak ditemukan di response',
        available_keys: data?.data?.attributes ? Object.keys(data.data.attributes) : [],
      });
    }

    // Redirect ke HLS URL
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, hlsUrl);

  } catch (err) {
    console.error('[stream] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
