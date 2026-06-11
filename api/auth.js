const VIDIO_API_KEY = 'CH1ZFsN4N/MIfAds1DL9mP151CNqIpWHqZGRr+LkvUyiq3FRPuP1Kt6aK+pG3nEC1FXt0ZAAJ5FKP8QU8CZ5/oOnzLxNND10Rm+tet/uqMtlFPMTc2yhz4IYyoRR1EiOiEIC3MckBPp+w1/0sDXRy+Ksnm1sOA+i8CqmbiBWOlU=';
const UA = 'Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36';

// Cache session in memory (berlaku selama instance Vercel hidup)
let cachedSession = null;
let sessionExpiry = 0;

export async function getSession() {
  const now = Date.now();

  // Pakai cache kalau masih valid
  if (cachedSession && now < sessionExpiry) {
    return cachedSession;
  }

  const email = process.env.VIDIO_EMAIL;
  const password = process.env.VIDIO_PASSWORD;

  if (!email || !password) {
    throw new Error('VIDIO_EMAIL dan VIDIO_PASSWORD belum diset di environment variables');
  }

  // Step 1: Ambil CSRF token + base cookies dari halaman desktop
  // (m.vidio.com sering redirect, pakai www agar lebih stabil)
  const initRes = await fetch('https://www.vidio.com/', {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
    redirect: 'follow',
  });

  const rawSetCookies = initRes.headers.getSetCookie?.() ?? [];
  const initCookies = parseCookies(rawSetCookies);
  const html = await initRes.text();

  // Cari CSRF token dari berbagai kemungkinan meta tag
  let csrfToken = '';
  const csrfPatterns = [
    /name=["']csrf-token["']\s+content=["']([^"']+)["']/,
    /content=["']([^"']+)["']\s+name=["']csrf-token["']/,
    /"csrf_token"\s*:\s*"([^"]+)"/,
    /csrf.token['"]\s*:\s*['"]([^'"]+)['"]/i,
  ];
  for (const pattern of csrfPatterns) {
    const m = html.match(pattern);
    if (m) { csrfToken = m[1]; break; }
  }

  // Step 2: Login via JSON endpoint
  const loginBody = JSON.stringify({ user: { email, password } });

  const loginRes = await fetch('https://www.vidio.com/users/sign_in.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'X-Api-Key': VIDIO_API_KEY,
      'X-API-Platform': 'web-mobile',
      'X-Requested-With': 'XMLHttpRequest',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      'Origin': 'https://www.vidio.com',
      'Referer': 'https://www.vidio.com/sign_in',
      'User-Agent': UA,
      'Cookie': serializeCookies(initCookies),
    },
    body: loginBody,
  });

  // Jika endpoint JSON gagal, coba endpoint alternatif
  if (!loginRes.ok) {
    const errText = await loginRes.text();
    console.error(`[auth] Login JSON gagal (${loginRes.status}):`, errText.slice(0, 300));

    // Fallback: coba endpoint lama (m.vidio.com)
    const fallbackRes = await fetch('https://m.vidio.com/users/sign_in.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': VIDIO_API_KEY,
        'X-API-Platform': 'web-mobile',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        'Origin': 'https://m.vidio.com',
        'Referer': 'https://m.vidio.com/sign_in',
        'User-Agent': UA,
        'Cookie': serializeCookies(initCookies),
      },
      body: loginBody,
    });

    if (!fallbackRes.ok) {
      const fbErr = await fallbackRes.text();
      throw new Error(`Login gagal (www: ${loginRes.status}, m: ${fallbackRes.status}): ${fbErr.slice(0, 200)}`);
    }

    const fbCookies = parseCookies(fallbackRes.headers.getSetCookie?.() ?? []);
    const allCookies = { ...initCookies, ...fbCookies };
    cachedSession = serializeCookies(allCookies);
    sessionExpiry = Date.now() + 55 * 60 * 1000;
    return cachedSession;
  }

  // Gabungkan cookies dari response login
  const loginCookies = parseCookies(loginRes.headers.getSetCookie?.() ?? []);
  const allCookies = { ...initCookies, ...loginCookies };

  // Pastikan ada session cookie (_vidio_session atau user_remember_token)
  const hasSession = Object.keys(allCookies).some(k =>
    k.includes('session') || k.includes('token') || k.includes('remember')
  );

  if (!hasSession) {
    // Coba parse dari body juga (beberapa response taruh token di body)
    try {
      const body = await loginRes.clone().json();
      if (body?.user?.authentication_token) {
        allCookies['authentication_token'] = body.user.authentication_token;
      }
    } catch (_) {}
  }

  cachedSession = serializeCookies(allCookies);
  sessionExpiry = Date.now() + 55 * 60 * 1000; // cache 55 menit

  return cachedSession;
}

// Force re-login (dipanggil jika stream endpoint return 401/403)
export function invalidateSession() {
  cachedSession = null;
  sessionExpiry = 0;
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
