# Discord Bansos AI Monitor Bot

Bot Discord untuk memantau konten terbaru di [AppVerse Bansos AI](https://appverse.id/bansos-ai) dan mengirim notifikasi otomatis setiap ada konten baru.

## 🚀 Fitur

- ✅ **Auto-monitoring**: Cek konten baru setiap 1 jam (bisa dikustomisasi)
- ✅ **Notifikasi Discord**: Kirim notifikasi otomatis dengan embed yang menarik
- ✅ **Smart tracking**: Tidak akan mengirim notifikasi duplikat
- ✅ **Storage persistent**: Menyimpan data konten yang sudah dipost
- ✅ **Cleanup otomatis**: Hapus data lama untuk menjaga ukuran file
- ✅ **Hot label detection**: Highlight konten dengan label "Hot"
- ✅ **Rich embed**: Tampilkan gambar, tanggal, views, dan deskripsi

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
  - Website: https://appverse.id/bansos-ai
  - Cron Schedule: 0 * * * *
  - Channel ID: 1234567890123456789

[Monitor] Menginisialisasi Discord bot...
[Discord] Bot logged in as BansosAIMonitor#1234
[Monitor] Testing Discord connection...
[Discord] Test message sent successfully

✅ Bot berhasil diinisialisasi!

[Monitor] Menjalankan pengecekan awal...
============================================================
[Monitor] Pengecekan dimulai: 23/6/2026 23:36:00
============================================================
[Scraper] Fetching data from: https://appverse.id/bansos-ai
[Scraper] Found 4 items
[Monitor] Berhasil scrape 4 items
[Monitor] Ditemukan 4 konten baru
[Monitor] Mengirim notifikasi ke Discord...
[Discord] Notification sent: Tutorial Claim FreeModel.dev
[Discord] Notification sent: Tutorial Claim OpenCode 15 USD
...
[Monitor] ✅ Berhasil mengirim 4 notifikasi
[Monitor] Pengecekan selesai dalam 3.45s
============================================================

[Monitor] Memulai cron job...
[Monitor] Schedule: 0 * * * *
✅ Cron job berhasil dimulai!

✅ Bot berjalan! Tekan Ctrl+C untuk menghentikan
```

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
│   ├── index.js           # File utama, orchestrator
│   ├── scraper.js         # Web scraper untuk ambil data
│   ├── storage.js         # Storage manager untuk tracking
│   └── discord-client.js  # Discord notifier
├── data/
│   └── posted.json        # Database sederhana (auto-generated)
├── .env                   # Environment variables (jangan di-commit!)
├── .env.example           # Template environment variables
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
