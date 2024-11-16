const puppeteer = require('puppeteer');
const axios = require('axios');

// API key dari LiveProxies
const apiKey = 'rmaZZM3I0oadc9cajkS9PJuAKd9E2kJo'; // Ganti dengan API Key Anda
const proxyUrl = 'https://api.liveproxies.io/proxies';  // URL API LiveProxies

// Fungsi untuk mendapatkan proxy secara dinamis
async function getProxy() {
    try {
        const response = await axios.get(proxyUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.data[0]; // Ambil proxy pertama dari daftar
    } catch (error) {
        console.error('Error fetching proxy:', error);
        return null;
    }
}

// Fungsi untuk mendapatkan URL video acak dari playlist
async function getRandomVideoUrl(playlistId) {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const response = await axios.get(url);
    const videoUrls = response.data.match(/"videoId":"(.*?)"/g);
    const randomIndex = Math.floor(Math.random() * videoUrls.length);
    const videoId = videoUrls[randomIndex].replace(/"videoId":"(.*?)"/, '$1');
    return `https://www.youtube.com/watch?v=${videoId}`;
}

// Fungsi untuk memulai ulang dengan proxy baru jika dibutuhkan
async function restartWithNewProxy(browser) {
    console.log("Mengganti proxy...");
    await browser.close();
    const newProxy = await getProxy();
    if (newProxy) {
        await runYouTubePlaylist(newProxy);
    }
}

// Fungsi utama untuk memutar playlist secara otomatis dengan Puppeteer
async function runYouTubePlaylist(proxy) {
    const browser = await puppeteer.launch({
        headless: true, // Tidak menampilkan GUI browser
        args: [
            `--proxy-server=${proxy.host}:${proxy.port}`, // **Bagian ini terkait proxy**
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();

    // **Pengaturan browser untuk menghindari deteksi**
    const userAgentList = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; rv:56.0) Gecko/20100101 Firefox/56.0'
    ];
    const randomUserAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];

    await page.setUserAgent(randomUserAgent);
    await page.setViewport({ width: 1280, height: 720 });

    // **Menambahkan headers untuk menghindari deteksi lebih lanjut**
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Referer': 'https://youtube.com',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
    });

    // **Memutar video playlist**
    await page.goto('https://youtube.com/playlist?list=PLmeMnjLK2plF0KqeYKG7OjsA5FEGODMh0', {
        waitUntil: 'domcontentloaded',
    });

    // **Fungsi untuk memutar video acak**
    const playRandomVideo = async () => {
        const videoUrl = await getRandomVideoUrl('PLmeMnjLK2plF0KqeYKG7OjsA5FEGODMh0');
        console.log('Memutar video acak:', videoUrl);

        await page.goto(videoUrl, { waitUntil: 'domcontentloaded' });

        const playButton = await page.$('button[aria-label="Play"]');
        if (playButton) {
            await playButton.click();
            console.log('Video diputar secara otomatis');
        }

        // **Jeda acak sebelum memutar video berikutnya**
        const delay = Math.random() * 5000 + 5000;
        console.log(`Menunggu ${delay / 1000} detik sebelum melanjutkan ke video berikutnya`);
        await page.waitForTimeout(delay);
    };

    // **Fungsi untuk menjaga video tetap berjalan tanpa henti**
    const keepVideoPlaying = async () => {
        setInterval(async () => {
            console.log('Memastikan video tetap berjalan...');
            const videoUrl = await getRandomVideoUrl('PLmeMnjLK2plF0KqeYKG7OjsA5FEGODMh0');
            await page.goto(videoUrl, { waitUntil: 'domcontentloaded' });
        }, 5000);
    };

    // **Memutar video acak dari playlist**
    await playRandomVideo();
    keepVideoPlaying();

    // **Mengulang playlist setelah selesai**
    page.on('framenavigated', async () => {
        console.log('Memastikan video diulang jika selesai');
        await page.reload({ waitUntil: 'domcontentloaded' });
    });

    // **Rotasi Proxy setiap 5 menit**
    setInterval(async () => {
        console.log('Rotasi Proxy...');
        const newProxy = await getProxy();
        if (newProxy) {
            await restartWithNewProxy(browser);
        }
    }, 300000);
}

// **Jalankan fungsi utama**
(async () => {
    const proxy = await getProxy();
    if (proxy) {
        await runYouTubePlaylist(proxy);
    } else {
        console.error('Tidak ada proxy yang tersedia!');
    }
})();
