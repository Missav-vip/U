const express = require('express');
const axios = require('axios');
const app = express();

// API key dari LiveProxies
const apiKey = 'rmaZZM3I0oadc9cajkS9PJuAKd9E2kJo'; // Ganti dengan API Key Anda
const proxyUrl = 'https://api.liveproxies.io/proxies';  // URL API LiveProxies

// Fungsi untuk mendapatkan proxy dari LiveProxies
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

// Endpoint untuk mendapatkan data dari proxy
app.get('/get-proxy', async (req, res) => {
  const proxy = await getProxy();
  if (proxy) {
    res.json(proxy);  // Kirim proxy ke frontend
  } else {
    res.status(500).json({ error: 'Could not fetch proxy' });
  }
});

// Serve static files (HTML, JS, CSS)
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
