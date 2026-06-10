export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        let targetUrl = null;
        const path = req.query.path;


const channelMap = {
    "antv": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/0a6c6b1534444ab4bd903af8761e6747/index.mpd",
    "gtv": "https://d2tjypxxy769fn.cloudfront.net/out/v1/b8b9b1d5f80f45649b4a3619291551ab/index.mpd",
    "idx_channel": "https://d2tjypxxy769fn.cloudfront.net/out/v1/db34a1b61f414d2181c29f1892bc8d0b/index.mpd",
    "inews": "https://d2tjypxxy769fn.cloudfront.net/out/v1/7b0404cd6a8a4a908123f10774854e46/index.mpd",
    "kompas_tv": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/dafcaf8b26064ae7b27702088240b535/index.mpd",
    "mdtv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/3aefa03d32954b678e5faab6daa04b58/index.mpd",
    "metro_tv": "https://d2tjypxxy769fn.cloudfront.net/out/v1/fd4360b1c12c4375848c8f085fd51d41/index.mpd",
    "mnctv": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/d6b026ad50f14b7f9af5ddd5450007d4/index.mpd",
    "rcti": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/997ce8767b604fae9fce05379b3b8b3a/index.mpd",
    "sctv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/9e9aba7068ca4c7f8a73381bef5f8742/index.mpd",
    "trans7": "https://d2tjypxxy769fn.cloudfront.net/out/v1/0fd7b7d368bc44bc9b4dece20acc3e33/index.mpd",
    "transtv": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/7a69cfc9e135493f87ac4efd63000429/index.mpd",
    "tvone": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/f3df48faafaf4198a65b9763140fce30/index.mpd",
    "bali_tv": "https://d2tjypxxy769fn.cloudfront.net/out/v1/44a2d1ab71a740babb233cf14832c59d/index.mpd",
    "bandung_tv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/f16b53f0d5ed459da208c459049c9bb0/index.mpd",
    "hanacaraka_tv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/17c724036c5f4615bd0b8093126b5c44/index.mpd",
    "jtv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/77641c37b4834a9db823ec5137774973/index.mpd",
    "bbc_news": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/7d38a4525dfa42b08a94c22c173061da/index.mpd",
    "bloomberg": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/3212c95b42154b6284671f28cc2c943c/index.mpd",
    "cgtn": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/c3e6d7241fbf404082087774d7221635/index.mpd",
    "channel_news_asia": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/7295b950a9b44dd2bf622a7d7d25dbd3/index.mpd",
    "cnbc_asia": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/e8d3f81aae4b46fbacf545140b86f2c4/index.mpd",
    "france24": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/498b57e974a843d28ea1a393603e5318/index.mpd",
    "nhk_world_japan": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/8decf3562fe943e88872ef868d6fb6a5/index.mpd",
    "nhk_world_premium": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/85b02e02587747058c1940af6aa3d0fa/index.mpd",
    "trt_world": "https://d2tjypxxy769fn.cloudfront.net/out/v1/be2bcc4b75e348e5b331fc5f99aa3daf/index.mpd",
    "abc_australia": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/6c075b570f99473fa6715bb399bc9571/index.mpd",
    "arirang": "https://d2tjypxxy769fn.cloudfront.net/out/v1/6f059cfe2653405aab54a7887f92ac39/index.mpd",
    "axn": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/456143d3b12140e1a872b25f067ddb62/index.mpd",
    "entertainment": "https://d2tjypxxy769fn.cloudfront.net/out/v1/a90cb773466446b08595007bab12b920/index.mpd",
    "hits": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/333a9658ed6a4424a92e319114fb7111/index.mpd",
    "kix": "https://d2tjypxxy769fn.cloudfront.net/out/v1/7a50d44c0a154dd29880c3728fb49a56/index.mpd",
    "one": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/9ec31bcce34848d69d4771270ff23ab9/index.mpd",
    "rock_entertainment": "https://d2tjypxxy769fn.cloudfront.net/out/v1/4cae4723d4d54a7fb71020bd7939a202/index.mpd",
    "tvn": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/6dc5412d26ea4e65961c825d866f2a34/index.mpd",
    "vision_prime": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/873c24d3946048f68e459250f1d2fd98/index.mpd",
    "anhui_tv": "https://d2tjypxxy769fn.cloudfront.net/out/v1/39a34211e80145678ce1616b52368f99/index.mpd",
    "dragon_tv": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/2c21b0f4792a42a09a7ed5fee3f010c0/index.mpd",
    "hunan_tv": "https://d2tjypxxy769fn.cloudfront.net/out/v1/63e4d9f383cb4ca59317c7be9407e228/index.mpd",
    "jiangsu_tv": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/ccc51c0317284496b6cde9f7bd670b80/index.mpd",
    "xing_kong_tv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/a1dc0cb4b4f14a3094088b16366bbeed/index.mpd",
    "celebrities_tv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/8cf72e61626f4361a45c57ce6f2fdad8/index.mpd",
    "food_travel": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/77d7eac1b90247ac9aa745bd2eb47fa8/index.mpd",
    "lifetime": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/1880fc1b32d3449196e80345f6cd5918/index.mpd",
    "bbc_earth": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/4e5b2a283adf462c8b6b55b2ef059fac/index.mpd",
    "cgtn_documentary": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/9757e131659a4ab8ba08d448c4a3779e/index.mpd",
    "crime_investigation": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/384f26c1c3b74ce09fa60bed24719b79/index.mpd",
    "global_trekker": "https://d2tjypxxy769fn.cloudfront.net/out/v1/99b07f39f4964b7cb9bfc092b51af734/index.mpd",
    "history": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/936ed6f98448469b924a0ce456586651/index.mpd",
    "love_nature": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/15500e8f0dc44058ba0431d39a8fed57/index.mpd",
    "outdoor_channel": "https://d2tjypxxy769fn.cloudfront.net/out/v1/c169ca1dcbe249c5bf233aabc3db4a4f/index.mpd",
    "animax": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/ab3ef0f0e4144c3c8b7e60f1873a3bcc/index.mpd",
    "cbeebies": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/2a5668fb3b9f4e34ab7c02cdc6ef56db/index.mpd",
    "dreamworks": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/7518da9041c4414d86f173daa719152e/index.mpd",
    "kids_tv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/9041826689ae4f9c9619576d411fa989/index.mpd",
    "mentari_tv": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/703a71abac3844748b1e68166242d4f3/index.mpd",
    "moonbug": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/198f7febb48c4c909d62977d88c195b0/index.mpd",
    "nick_jr": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/27163af9499b4bcca2da96677b158efe/index.mpd",
    "nickelodeon": "https://d2tjypxxy769fn.cloudfront.net/out/v1/3fe6d9eb97ed455c942eb8d3d1c2c2e8/index.mpd",
    "zoomoo": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/8554b3cb938e44038093df2d65080932/index.mpd",
    "celestial_classic_movies": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/6bdbe6ce7f034807aba5f09bed048b05/index.mpd",
    "celestial_movies_indonesia": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/fd25e662b7154c60a94f7c061573ba2d/index.mpd",
    "galaxy": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/751a0982779f4edd904205eb351e220d/index.mpd",
    "galaxy_premium": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/45c0752c6b6b4397b80243ac9fed96fd/index.mpd",
    "hits_movies": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/de93893d01e6446daaf052a7fec694fc/index.mpd",
    "imc": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/65432a4c12ca4a52abf473a0e41d7c7e/index.mpd",
    "rock_action": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/010bb28c19b64975b318d3b00f58b18b/index.mpd",
    "studio_universal": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/dc63bd198bc44193b570e0567ff5b22c/index.mpd",
    "thrill": "https://d2tjypxxy769fn.cloudfront.net/out/v1/3c619ecc120b46e999d1eaa627cc544f/index.mpd",
    "tvn_movies": "https://d2tjypxxy769fn.cloudfront.net/out/v1/096d5cf064294e7ea3a7f59ee2899669/index.mpd",
    "zee_bioskop": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/81cb1af2ea4d4842a94f1c83957b4cd2/index.mpd",
    "buddy_star": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/c70975aaa68d47f2a38799e6730a7816/index.mpd",
    "cineedge": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/47c895ca72544fcfa4221c499b555a10/index.mpd",
    "originals": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/e992e986a88346c18a5dcc4fbcdae6b9/index.mpd",
    "superrix": "https://d2tjypxxy769fn.cloudfront.net/out/v1/782400332c96440598260730a864bc6f/index.mpd",
    "uniques": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/bde0a6d8d3fd4d77ae5093ad2e6699dc/index.mpd",
    "music_tv": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/c20d75deb06f401aa89681a9e5054de7/index.mpd",
    "bein_sports_1": "https://d6m3sfa7e58z5.cloudfront.net/out/v1/3b0660e05eed4d769521eb0275aab3ab/index.mpd",
    "bein_sports_2": "https://d6m3sfa7e58z5.cloudfront.net/out/v1/cfca527d0f16403396a71b2d3d54c32f/index.mpd",
    "bein_sports_3": "https://d6m3sfa7e58z5.cloudfront.net/out/v1/a265695db5cb461095cbfefc02ad793b/index.mpd",
    "bein_sports_4": "https://d6m3sfa7e58z5.cloudfront.net/out/v1/2e55bc8199044c27b1dbb827af65a04f/index.mpd",
    "bein_sports_5": "https://d6m3sfa7e58z5.cloudfront.net/out/v1/fe4d00f07e2f43b789102b84b4d243a9/index.mpd",
    "fight_sports": "https://d2tjypxxy769fn.cloudfront.net/out/v1/73b7057c72da4615888a11b02a6cbb3c/index.mpd",
    "soccer_channel": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/63c0da12bb4d48afbaf053f51dff2353/index.mpd",
    "sportstars": "https://d2tjypxxy769fn.cloudfront.net/out/v1/89a6e4261cd7470f83e5869e90440cff/index.mpd",
    "sportstars_2": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/d2c68a3dfb644808b416bd90dcc92d5f/index.mpd",
    "sportstars_3": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/6f5596513af749c19d0bcdac013dda3c/index.mpd",
    "sportstars_4": "https://d2xz2v5wuvgur6.cloudfront.net/out/v1/2fcc58ccec8c45e9aa094fb980eb642d/index.mpd",
    "spotv": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/b4814ae93ca84dd3bb5b0aff76ca263f/index.mpd",
    "spotv_2": "https://d2tjypxxy769fn.cloudfront.net/out/v1/46d9cf39b9a84183b8d5022ac8f4bc41/index.mpd",
    "al_quran_al_kareem": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/099aba2d60b44679915cd56f303b975d/index.mpd",
    "muslim_tv": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/a8f14e34c687494fb1454b88742db085/index.mpd",
    "tv9_nu": "https://d3b0v7fggu5zwm.cloudfront.net/out/v1/9688c51b534d4165bf4b0b328e53b980/index.mpd",
    "tvmu": "https://d84q7nw4qf3j3.cloudfront.net/out/v1/980cfe26ff00479c97eb8057a1129c7f/index.mpd"
};

if (channelMap[path]) {
            targetUrl = channelMap[path];
        } else if (path && path.includes('cloudfront.net')) {
            targetUrl = `https://${path}`;
        } else if (req.query.url) {
            targetUrl = decodeURIComponent(req.query.url);
        }

        if (!targetUrl) {
            return res.status(400).send('Gunakan: /proxy/rcti atau /proxy/d84q7nw4qf3j3.cloudfront.net/...');
        }

        console.log('→ Proxying:', targetUrl);

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Vision+ TV) AppleWebKit/537.36',
                'Referer': 'https://www.visionplus.id/',
                'Origin': 'https://www.visionplus.id',
                'X-Requested-With': 'com.visionplus.app',
            },
            body: req.method === 'POST' ? req.body : null,
        });

        const buffer = await response.arrayBuffer();

        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/dash+xml');
        return res.status(response.status).send(Buffer.from(buffer));

    } catch (err) {
        console.error('Fetch Error:', err.message);
        return res.status(502).send('Proxy Error: ' + err.message);
    }
}
