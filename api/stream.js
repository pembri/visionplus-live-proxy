const VIDIO_API_KEY = 'CH1ZFsN4N/MIfAds1DL9mP151CNqIpWHqZGRr+LkvUyiq3FRPuP1Kt6aK+pG3nEC1FXt0ZAAJ5FKP8QU8CZ5/oOnzLxNND10Rm+tet/uqMtlFPMTc2yhz4IYyoRR1EiOiEIC3MckBPp+w1/0sDXRy+Ksnm1sOA+i8CqmbiBWOlU=';
const VIDIO_COOKIE = 'ahoy_visitor=cae3dba2-0874-4c9a-824c-257d787304b7; country_id=ID; ahoy_visit=701bd0eb-d02a-437c-a92e-636f28047d2c; _vidio_session=xMtYBl3l7rqy%2BrEsD07VzwcM1hdiNEreRh8sl66f82mLkJz6hhTRs0B4ByfA%2FzulcN%2F9xuaeMHKCJA1nQ%2F%2Fhl%2F2Fzu4ybAwxzo%2BRnnKalOcrjYprXJqVBEXiI20dNNaqgYGOET3OHIPGcfH%2FbrOnBZTDoiuTPFpYeMK1NOGMPk05nTXSmfKlb%2BWOWrBUi%2FDrGBCYmm0k9R9RbN5QhFkCs9l%2Bn3o2mfvNkq2dM1HUk20%2BOJJDppug2YJkieKUOV%2F2FnNBkkeY8GgQXC0EYWYTNUCkFea3cfpkM9iYFnubeRnrIMZkFzsrrwCGekwuvTdmbvRvqMdB6QDki0ku%2Bl4I%2FFjH5fV3T%2BvqgglM9fl1T4d1RfqLDmOXV%2FBCT5TgalZUnsD8kyv26QWzjlmmF22UllAKBEB%2Fe9zyNVzRrSb0qonutGy%2BjA4Bv3ztyUKlb2fYG%2FitahPiHzLvEEJKmeZPwDpWWk%2BWBwBN1v2MWdrl9wexR4%2FHh%2FFefXGrLlEjvPgPHxXTVdTGHF9MqD3L0Tk5cLv9GUodu%2F2QbCoPImV%2Bo1leRZZqZClaV3NDGm8Y0LToEgatT%2B4UNZhv5u1TtR%2FFSZ%2FyKzf6JOaMBeRku7jQcqjymKNsCUlpEq9DG%2FvCQfgQcVlk3Db1YFnKXLP1tGojtcoBN0t6isig1mOKr41R3AV1d5zrbRNFbVdVajOrKRFKUqboeXT2%2BXn5Nz1nM6t70cBHmBCEqkYBtr9VkAlGj705BlMmb2KNRWDMC7gT39YYaJuvp4W4LEoB1vDqhMsnRUY%2FmWZb0l0l2bGJEEeqQRHV45%2BBbph7s1fRdHH4n9wDsL--PxlcgX%2FBxe6NZulIf--M8fC4UQcMSTn4OtxuUyzjg%3D%3D';
const VIDIO_SIGNATURE = 'd9c0be3221781d79bf5442b154c02dfaf52a7a982dc1d252e0f51cdf6dae2b9a';
const VIDIO_CLIENT = '1781198284.499';

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
        'X-Client': VIDIO_CLIENT,
        'X-Signature': VIDIO_SIGNATURE,
        'Origin': 'https://m.vidio.com',
        'Referer': 'https://m.vidio.com/',
        'Accept': 'application/vnd.api+json',
        'Accept-Language': 'id',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Cookie': VIDIO_COOKIE,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Infinix X6880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36',
        'sec-ch-ua': '"Chromium";v="148", "Android WebView";v="148", "Not/A)Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
      }
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({ 
        error: 'Gagal ambil stream dari Vidio', 
        status: response.status,
        detail: body
      });
    }

    const data = await response.json();
    const hlsUrl = data?.data?.attributes?.hls;

    if (!hlsUrl) {
      return res.status(404).json({ error: 'HLS URL tidak ditemukan', raw: data });
    }

    // Redirect langsung ke HLS URL
    res.redirect(302, hlsUrl);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
