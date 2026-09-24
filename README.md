# Discord Bansos AI Monitor Bot

Bot Discord untuk memantau konten terbaru dari **multiple sources** dan mengirim notifikasi otomatis setiap ada konten baru.

**Website yang dimonitor:**
- 🔹 [AppVerse Bansos AI](https://appverse.id/bansos-ai) - Kurasi tools AI murah/gratis
- 🔹 [Bansos.dev](https://bansos.dev/list/) - Direktori bantuan sosial developer Indonesia

## 🚀 Fitur

- ✅ **Multi-source monitoring**: AppVerse, Bansos.dev, Google News RSS, Reddit RSS, dan Threads API (opsional)
- ✅ **Recent referral search**: Hanya hasil bertanggal maksimal 7 hari yang menyebut Claude/Anthropic dan referral/invite/gift/trial
- ✅ **Auto-monitoring**: Cek konten baru setiap 1 jam (bisa dikustomisasi)
- ✅ **Notifikasi Discord**: Kirim notifikasi otomatis dengan embed yang menarik
- ✅ **Source differentiation**: Format embed berbeda per sumber
- ✅ **Smart tracking**: Tidak akan mengirim notifikasi duplikat
- ✅ **Storage persistent**: Menyimpan data konten yang sudah dipost
- ✅ **Cleanup otomatis**: Hapus data lama untuk menjaga ukuran file
- ✅ **Rich embed**: Tampilkan gambar, tanggal, views, tags, dan deskripsi

## 📋 Prerequisites

- Node.js v18 atau lebih baru
- Akun Discord dan bot token
- Channel Discord untuk notifikasi

## 🔧 Instalasi

### 1. Clone atau Download Project

```bash
# Jika menggunakan git
git clone <repository-url>
cd discord-bansos-monitor-bot

# Atau extract file zip ke folder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Discord Bot

#### a. Buat Discord Bot
1. Kunjungi [Discord Developer Portal](https://discord.com/developers/applications)
2. Klik **"New Application"**
3. Beri nama aplikasi, misal: "Bansos AI Monitor"
4. Pergi ke tab **"Bot"**
5. Klik **"Add Bot"**
6. Copy **Bot Token** (simpan dengan aman!)

#### b. Setup Bot Permissions
1. Di tab **"Bot"**, scroll ke bawah ke **"Privileged Gateway Intents"**
2. Aktifkan: **MESSAGE CONTENT INTENT** (optional, tidak wajib untuk bot ini)
3. Di tab **"OAuth2"** > **"URL Generator"**:
   - Pilih scope: `bot`
   - Pilih permissions:
     - ✅ Send Messages
     - ✅ Embed Links
     - ✅ Attach Files
     - ✅ Read Message History
4. Copy URL dan buka di browser untuk invite bot ke server Anda

#### c. Dapatkan Channel ID
1. Buka Discord
2. Pergi ke **User Settings** > **Advanced**
3. Aktifkan **Developer Mode**
4. Klik kanan channel yang ingin digunakan untuk notifikasi
5. Pilih **"Copy ID"**

### 4. Konfigurasi Environment Variables

```bash
# Copy file example
cp .env.example .env

# Edit file .env
nano .env
# atau gunakan text editor favorit Anda
```

Isi file `.env` dengan data Anda:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
CRON_SCHEDULE=0 * * * *
WEBSITE_URL=https://appverse.id/bansos-ai
```

## 🎮 Cara Menggunakan

### Jalankan Bot

```bash
npm start
```

### Mode Development (auto-restart saat ada perubahan)

```bash
npm run dev
```

### Output yang Diharapkan

```
============================================================
🤖 Bansos AI Monitor Bot - Starting...
============================================================
[Monitor] Konfigurasi:
  - Websites:
    • https://appverse.id/bansos-ai (AppVerseScraper)
    • https://bansos.dev/list/ (BansosDevScraper)
  - Cron Schedule: 0 * * * *
  - Channel ID: 1234567890123456789

[Monitor] Menginisialisasi Discord bot...
[Discord] Bot logged in as BansosAIMonitor#1234
[Monitor] Testing Discord connection...
[Discord] Test message sent successfully

✅ Bot berhasil diinisialisasi!

[Monitor] Menjalankan pengecekan awal...
============================================================
[Monitor] Pengecekan dimulai: 10/8/2026 10:48:00
============================================================
[Monitor] Scraping dari AppVerseScraper...
[AppVerseScraper] Fetching data from: https://appverse.id/bansos-ai
[AppVerseScraper] Found 54 valid items (after filtering Obsolete)
[Monitor] AppVerseScraper berhasil scrape 54 items
[Monitor] Scraping dari BansosDevScraper...
[BansosDevScraper] Fetching data from: https://bansos.dev/list/
[BansosDevScraper] Found 15 items
[Monitor] BansosDevScraper berhasil scrape 15 items
[Monitor] Total 69 items dari semua sumber
[Monitor] Ditemukan 8 konten baru
[Monitor] Mengirim notifikasi ke Discord...
[Discord] Notification sent: Bansos Qoder 3.8 Max (appverse)
[Discord] Notification sent: AI Router by Nara (bansos.dev)
[Discord] Notification sent: FreeModel Invite Referral (bansos.dev)
...
[Monitor] ✅ Berhasil mengirim 8 notifikasi
[Monitor] Pengecekan selesai dalam 4.23s
============================================================

[Monitor] Memulai cron job...
[Monitor] Schedule: 0 * * * *
✅ Cron job berhasil dimulai!

✅ Bot berjalan! Tekan Ctrl+C untuk menghentikan
```

## 🌐 Multi-Website Monitoring

Bot sekarang memonitor **2 sumber** sekaligus untuk memberikan coverage maksimal:

### 📊 Sumber Data

#### 1. AppVerse Bansos AI
- **URL**: https://appverse.id/bansos-ai
- **Fokus**: Kurasi tools AI murah dan gratis
- **Update**: Frequent updates, community-driven
- **Data yang tersedia**:
  - Title & description
  - Image thumbnails
  - Tanggal publikasi (format Indonesia)
  - View count
  - "Hot" label untuk trending items
  - Link ke tutorial lengkap

#### 2. Bansos.dev
- **URL**: https://bansos.dev/list/
- **Fokus**: Direktori bantuan sosial developer Indonesia
- **Update**: Curated directory
- **Data yang tersedia**:
  - Title & description
  - Provider information
  - Tags/categories (AI, Cloud, Free Tier, etc.)
  - "Featured" label untuk highlight
  - Status (AKTIF/OBSOLETE)
  - Validity period
  - Link ke detail claim

### 🎯 Perbedaan Format Notifikasi

Bot akan mengirim **Discord embed berbeda** untuk setiap sumber:

**AppVerse Items:**
- 🟦 Warna biru (#5865F2)
- Menampilkan: thumbnail, tanggal, views
- Badge "🔥 HOT" jika trending
- Footer: "Source: AppVerse Bansos AI"

**Bansos.dev Items:**
- 🟩 Warna hijau (#10b981)
- Menampilkan: provider, tags, validity
- Badge "⭐ FEATURED" jika highlighted
- Footer: "Source: Bansos.dev"

### 📈 Coverage

Dengan monitoring multi-sumber, bot dapat mendeteksi:
- **~50-80 items** dari AppVerse (AI tools, credits, API)
- **~15-20 items** dari Bansos.dev (cloud services, hosting, domains)
- **Total ~70-100 programs** dipantau setiap jam

### 🔄 Smart Deduplication

Bot menggunakan **ID tracking** untuk menghindari notifikasi duplikat:
- Setiap item punya unique ID berdasarkan URL
- Items dari sources berbeda ditrack terpisah
- History disimpan di `data/posted.json`

### 🚀 Menambah Sumber Baru

Arsitektur bot dirancang modular. Untuk menambah website baru:

1. Buat scraper baru di `src/scrapers/`
2. Extend dari `BaseScraper` class
3. Implement method `scrape()` 
4. Tambahkan ke array `scrapers` di `src/index.js`

Contoh:
```javascript
import NewSiteScraper from './scrapers/newsite-scraper.js';

this.scrapers = [
  new AppVerseScraper('https://appverse.id/bansos-ai'),
  new BansosDevScraper('https://bansos.dev/list/'),
  new NewSiteScraper('https://newsite.com/api') // ← Tambahkan di sini
];
```

## 🔎 Pencarian referral publik

Bot mencari hasil publik lewat Google News RSS dan Reddit RSS. Hasil hanya
lolos bila judul/deskripsi menyebut `Claude` atau `Anthropic` sekaligus salah
satu kata `referral`, `invite`, `gift`, `trial`, atau `free pro`. Item tanpa
tanggal valid, lebih lama dari 7 hari, atau bertanggal masa depan akan dibuang.
Threads API memakai query `RECENT` dan hanya aktif jika `THREADS_ACCESS_TOKEN`
diset. Token membutuhkan permission `threads_basic` dan `threads_keyword_search`;
pencarian post publik memerlukan approval Meta untuk permission pencarian.
Tanpa approval, hasil Threads mungkin terbatas ke post akun pemilik token.
Link dikirim untuk dibuka dan diklaim manual; bot tidak membuat akun atau
mengklaim trial. Sumber publik bisa tidak lengkap, berubah format, atau
membatasi akses; kegagalan satu sumber tidak menghentikan sumber lain.

Tes filter lokal tanpa Discord atau akses internet:

```bash
npm run test:rss
```

Set `THREADS_ACCESS_TOKEN` di `.env` untuk mengaktifkan pencarian Threads.
Jangan commit token tersebut.

## ⚙️ Konfigurasi

### Cron Schedule

Format cron: `minute hour day month dayOfWeek`

Contoh schedule:

```env
# Setiap 1 jam di menit ke-0
CRON_SCHEDULE=0 * * * *

# Setiap 30 menit
CRON_SCHEDULE=*/30 * * * *

# Setiap 6 jam
CRON_SCHEDULE=0 */6 * * *

# Setiap hari jam 9 pagi
CRON_SCHEDULE=0 9 * * *

# Setiap hari jam 9 pagi dan 9 malam
CRON_SCHEDULE=0 9,21 * * *
```

Gunakan [Crontab Guru](https://crontab.guru/) untuk membantu membuat cron expression.

## 📁 Struktur Project

```
discord-bansos-monitor-bot/
├── src/
│   ├── scrapers/
│   │   ├── base-scraper.js      # Base class untuk semua scraper
│   │   ├── appverse-scraper.js  # Scraper untuk AppVerse
│   │   └── bansosdev-scraper.js # Scraper untuk Bansos.dev
│   ├── index.js                  # File utama, orchestrator
│   ├── storage.js                # Storage manager untuk tracking
│   └── discord-client.js         # Discord notifier
├── data/
│   └── posted.json               # Database sederhana (auto-generated)
├── .env                          # Environment variables (jangan di-commit!)
├── .env.example                  # Template environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Bot tidak bisa login

**Error**: `An invalid token was provided`

**Solusi**:
- Pastikan `DISCORD_TOKEN` di `.env` sudah benar
- Jangan ada spasi atau quotes di sekitar token
- Generate ulang token di Discord Developer Portal jika perlu

### Bot tidak bisa kirim message

**Error**: `Missing Permissions` atau `Unknown Channel`

**Solusi**:
- Pastikan bot sudah di-invite ke server
- Pastikan bot punya permission: Send Messages, Embed Links
- Pastikan `DISCORD_CHANNEL_ID` sudah benar
- Pastikan bot bisa akses channel tersebut (check channel permissions)

### Scraper tidak menemukan konten

**Error**: `Found 0 items`

**Solusi**:
- Website mungkin mengubah struktur HTML
- Perlu update selector di `src/scraper.js`
- Check apakah website memblok bot (User-Agent)
- Coba akses manual untuk memastikan website tidak down

### Notifikasi duplikat

**Solusi**:
- Hapus file `data/posted.json` untuk reset tracking
- Atau edit manual file tersebut untuk remove entries tertentu

## 🔒 Keamanan

- **Jangan commit** file `.env` ke repository
- **Jangan share** Discord bot token
- **Simpan** bot token dengan aman
- **Regenerate** token jika tercurigai bocor

## 📝 Tips

1. **Testing**: Gunakan cron schedule yang lebih sering saat testing (misal setiap 5 menit)
2. **Monitoring**: Check logs secara berkala untuk memastikan bot berjalan normal
3. **Storage**: File `data/posted.json` akan otomatis dibersihkan untuk data >30 hari
4. **Rate Limit**: Bot sudah include delay 2 detik antar notifikasi untuk avoid rate limit

## 🚀 Deploy ke Server

### Menggunakan PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot dengan PM2
pm2 start src/index.js --name bansos-monitor

# Set auto-start on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs bansos-monitor

# Stop bot
pm2 stop bansos-monitor

# Restart bot
pm2 restart bansos-monitor
```

### Menggunakan systemd (Linux)

Buat file `/etc/systemd/system/bansos-monitor.service`:

```ini
[Unit]
Description=Discord Bansos AI Monitor Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/discord-bansos-monitor-bot
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Kemudian:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bansos-monitor
sudo systemctl start bansos-monitor
sudo systemctl status bansos-monitor
```

## 📊 Statistik

Bot menyimpan statistik sederhana yang bisa dilihat di console saat startup:

- Total konten yang sudah dipost
- Waktu pengecekan terakhir
- Timestamp post pertama dan terbaru

## 🤝 Contributing

Jika ingin berkontribusi atau ada bug report, silakan buat issue atau pull request.

## 📄 License

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

## 👨‍💻 Author

Dibuat dengan ❤️ untuk komunitas builder Indonesia

---

**Selamat menggunakan bot! Semoga bermanfaat untuk tracking bansos AI terbaru! 🚀**
