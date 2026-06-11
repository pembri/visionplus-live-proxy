const VIDIO_API_KEY = 'CH1ZFsN4N/MIfAds1DL9mP151CNqIpWHqZGRr+LkvUyiq3FRPuP1Kt6aK+pG3nEC1FXt0ZAAJ5FKP8QU8CZ5/oOnzLxNND10Rm+tet/uqMtlFPMTc2yhz4IYyoRR1EiOiEIC3MckBPp+w1/0sDXRy+Ksnm1sOA+i8CqmbiBWOlU=';
const UA = 'Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36';

// Cache session in memory (berlaku selama instance Vercel hidup)
let cachedSession = null;
let sessionExpiry = 0;

export async function getSession() {
  const now = Date.now();

  // Pakai cache kalau masih valid (1 jam)
  if (cachedSession && now < sessionExpiry) {
    return cachedSession;
  }

  const email = process.env.VIDIO_EMAIL;
  const password = process.env.VIDIO_PASSWORD;

  if (!email || !password) {
    throw new Error('VIDIO_EMAIL dan VIDIO_PASSWORD belum diset di environment variables');
  }

  // Step 1: Ambil CSRF token + base cookies
  const initRes = await fetch('https://m.vidio.com/', {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html',
      'Accept-Language': 'id',
    },
    redirect: 'follow',
  });

  const initCookies = parseCookies(initRes.headers.getSetCookie?.() || []);
  const html = await initRes.text();

  // Ambil CSRF token dari meta tag
  const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';

  // Step 2: Login
  const loginRes = await fetch('https://www.vidio.com/users/sign_in.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': VIDIO_API_KEY,
      'X-API-Platform': 'web-mobile',
      'X-CSRF-Token': csrfToken,
      'Origin': 'https://m.vidio.com',
      'Referer': 'https://m.vidio.com/',
      'User-Agent': UA,
      'Accept': 'application/json',
      'Cookie': serializeCookies(initCookies),
    },
    body: JSON.stringify({
      user: { email, password }
    }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    throw new Error(`Login gagal (${loginRes.status}): ${err}`);
  }

  // Gabungkan semua cookies dari response login
  const loginCookies = parseCookies(loginRes.headers.getSetCookie?.() || []);
  const allCookies = { ...initCookies, ...loginCookies };

  cachedSession = serializeCookies(allCookies);
  sessionExpiry = now + 55 * 60 * 1000; // cache 55 menit

  return cachedSession;
}

function parseCookies(setCookieHeaders) {
  const cookies = {};
  for (const header of setCookieHeaders) {
    const parts = header.split(';')[0].trim();
    const idx = parts.indexOf('=');
    if (idx > 0) {
      const key = parts.slice(0, idx).trim();
      const val = parts.slice(idx + 1).trim();
      cookies[key] = val;
    }
  }
  return cookies;
}

function serializeCookies(obj) {
  return Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('; ');
}
