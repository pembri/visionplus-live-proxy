const VIDIO_API_KEY = 'CH1ZFsN4N/MIfAds1DL9mP151CNqIpWHqZGRr+LkvUyiq3FRPuP1Kt6aK+pG3nEC1FXt0ZAAJ5FKP8QU8CZ5/oOnzLxNND10Rm+tet/uqMtlFPMTc2yhz4IYyoRR1EiOiEIC3MckBPp+w1/0sDXRy+Ksnm1sOA+i8CqmbiBWOlU=';
const VIDIO_COOKIE = 'ahoy_visitor=cae3dba2-0874-4c9a-824c-257d787304b7; country_id=ID; ahoy_visit=701bd0eb-d02a-437c-a92e-636f28047d2c; _vidio_session=zsE0zLoS75qknl703P5DMu8%2BCWuyzDltEeWHhpmUB%2BHitdAFN%2Fsv4BCEPugvZhs9wCKt8QZYW6r%2FBDbyikUkakaDVxagmPg4cLoCqAdAh27uAKKgnRc1IBMhQPzX7z7%2BALc7J3ZnSjwo5wUvkBnT2ryhmx1v%2FXDhAowHm9SSL3AlBIjD4dxMKrQFjMVHQ3G3T%2BTw%2FZCpWlSH1rCurkS90Y%2Bh2IkUnOwLdXqH55Mk%2BwkBVi1DhyFUKvtKY%2BReabS%2BaFlibHHZ%2FSGs73q%2FxqCLOEudEkhtq%2BTl1EPVwkfzRzgJq7SM%2B%2F9xAe5NSEzm01ndzgggYjkLtBEgEwYSqQ6Npb8wbgifZOY8e4m%2FXO8HwJdbauNgamWCOHHu5RhLWNRvunDkbr4cObbUBArqns9LqGWDcL7FGB2rtdB1mF0zMVw%2B336MCKFkFf9WJXGAYfknYHO3qmpx78rwJ6%2FnNL4j0cSl%2BbjDLrDzYryTRkVID25UksF1ueeOroj3QYlQccuE6GjufumabzrASvg7oTAkGpz%2FzOJ7tWmfM3Av2jSEN0yV8BPOJp01%2FmwA8ZY5crNm4QmkZDDZDafjAVndetdAY5tWaGOTIQB37SFcnUExQQBZaErbRxq0qft9YZp1hvGtE%2Fa1Li7NIMzsUZU5NRoIB6dTOWvKR2SAL3%2BAIWbZJzqmXi561PVu0InKcD3swTvsokrK1O19q2fHS28WzxodbRNujfQ0cFAZpnsvlG4U0SrDE%2FIef9n30ARrGozoUcQJZuEr7DhpDebXVdlMd5gonSS2jpsaO3c6Z4mph6%2BG24IJM437f9a6WXIk--W3%2FfR11c20fJR0%2Fb--DSsB9o9VtpyhiHxxvxNc%2Bw%3D%3D';

export default async function handler(req, res) {
  const channelId = req.query.id || '875';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const response = await fetch(`https://api.vidio.com/livestreamings/${channelId}/stream?initialize=true`, {
      headers: {
        'Host': 'api.vidio.com',
        'X-Api-Key': VIDIO_API_KEY,
        'X-API-Platform': 'web-mobile',
        'X-Secure-Level': '2',
        'Origin': 'https://m.vidio.com',
        'Referer': 'https://m.vidio.com/',
        'Accept': '*/*',
        'Accept-Language': 'id',
        'Cookie': VIDIO_COOKIE,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Gagal ambil stream dari Vidio', status: response.status });
    }

    const data = await response.json();
    const hlsUrl = data?.data?.attributes?.hls;

    if (!hlsUrl) {
      return res.status(404).json({ error: 'HLS URL tidak ditemukan' });
    }

    // Redirect langsung ke HLS URL
    res.redirect(302, hlsUrl);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
