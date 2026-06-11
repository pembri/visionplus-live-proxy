import { getSession } from './auth.js';

const VIDIO_API_KEY = 'CH1ZFsN4N/MIfAds1DL9mP151CNqIpWHqZGRr+LkvUyiq3FRPuP1Kt6aK+pG3nEC1FXt0ZAAJ5FKP8QU8CZ5/oOnzLxNND10Rm+tet/uqMtlFPMTc2yhz4IYyoRR1EiOiEIC3MckBPp+w1/0sDXRy+Ksnm1sOA+i8CqmbiBWOlU=';
const UA = 'Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36';

export default async function handler(req, res) {
  const channelId = req.query.id || '875';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // Ambil session otomatis (login jika belum / expired)
    const cookie = await getSession();

    const response = await fetch(
      `https://api.vidio.com/livestreamings/${channelId}/stream?initialize=true`,
      {
        headers: {
          'Host': 'api.vidio.com',
          'X-Api-Key': VIDIO_API_KEY,
          'X-API-Platform': 'web-mobile',
          'X-Secure-Level': '2',
          'Origin': 'https://m.vidio.com',
          'Referer': 'https://m.vidio.com/',
          'Accept': 'application/vnd.api+json',
          'Accept-Language': 'id',
          'Cache-Control': 'no-cache',
          'Cookie': cookie,
          'User-Agent': UA,
        }
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        error: 'Gagal ambil stream dari Vidio',
        status: response.status,
        detail: body,
      });
    }

    const data = await response.json();
    const hlsUrl = data?.data?.attributes?.hls;

    if (!hlsUrl) {
      return res.status(404).json({ error: 'HLS URL tidak ditemukan', raw: data });
    }

    res.redirect(302, hlsUrl);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
