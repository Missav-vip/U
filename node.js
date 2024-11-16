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

// Fungsi utama untuk memutar playlist secara otomatis dengan Puppeteer
async function runYouTubePlaylist() {
    const proxy = await getProxy();
    
    const browser = await puppeteer.launch({
        headless: true, // Tidak menampilkan GUI browser
        args: [
            `--proxy-server=${proxy.host}:${proxy.port}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();

    // Set up browser untuk tidak terdeteksi
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 720 }); // Ukuran layar standar

    // Buka halaman YouTube playlist
    await page.goto('https://youtube.com/playlist?list=PLmeMnjLK2plF0KqeYKG7OjsA5FEGODMh0', {
        waitUntil: 'domcontentloaded',
    });

    // Mulai video secara otomatis dan acak playlist
    await page.click('button[aria-label="Play"]'); // Menekan tombol play jika tersedia
    console.log('Video dimulai secara otomatis.');

    // Fungsi untuk mengulang playlist setelah selesai
    page.on('framenavigated', async () => {
        console.log('Memastikan video diulang jika selesai');
        await page.reload({ waitUntil: 'domcontentloaded' });
    });

    // Menunggu hingga video selesai diputar dan terus ulang
    setInterval(async () => {
        // Cek jika video selesai dan refresh halaman
        await page.reload({ waitUntil: 'domcontentloaded' });
    }, 3600000); // Setiap 1 jam, untuk memastikan video berulang tanpa henti

    // Tetap menjalankan Puppeteer tanpa hentikan
    console.log('Puppeteer berjalan tanpa henti');
}

runYouTubePlaylist();
