# 🚀 Quick Start Guide

## Setup Cepat (5 Menit)

### 1. Install Dependencies
```bash
npm install
```

### 2. Buat Discord Bot
1. Buka https://discord.com/developers/applications
2. Klik "New Application" → beri nama "Bansos Monitor"
3. Tab "Bot" → "Add Bot" → Copy token
4. Tab "OAuth2" → "URL Generator":
   - Scope: `bot`
   - Permissions: Send Messages, Embed Links, Attach Files
5. Copy URL dan invite bot ke server Discord Anda

### 3. Get Channel ID
1. Discord Settings → Advanced → Enable "Developer Mode"
2. Klik kanan channel → "Copy ID"

### 4. Konfigurasi
Edit file `.env`:
```env
DISCORD_TOKEN=paste_token_disini
DISCORD_CHANNEL_ID=paste_channel_id_disini
```

### 5. Test Setup
```bash
npm test
```

Pastikan semua test ✅ (hijau)

### 6. Jalankan Bot
```bash
npm start
```

Bot akan:
- ✅ Login ke Discord
- ✅ Kirim test message ke channel
- ✅ Cek konten baru dan kirim notifikasi
- ✅ Setup cron job untuk cek setiap 1 jam
- ✅ Terus berjalan sampai dihentikan (Ctrl+C)

## Troubleshooting Cepat

### Bot tidak bisa login
- Cek token di .env sudah benar
- Tidak ada spasi atau quotes di sekitar token
- Token belum expired

### Bot tidak kirim message
- Pastikan bot sudah di-invite ke server
- Channel ID sudah benar
- Bot punya permission "Send Messages" dan "Embed Links"
- Bot bisa akses channel tersebut

### Scraper tidak menemukan konten
- Website mungkin down, coba lagi nanti
- Struktur HTML berubah, perlu update selector

## Command Berguna

```bash
# Jalankan bot
npm start

# Development mode (auto-restart)
npm run dev

# Test setup
npm test

# Deploy dengan PM2
pm2 start src/index.js --name bansos-monitor
pm2 logs bansos-monitor
pm2 stop bansos-monitor
```

## Customisasi Schedule

Edit `CRON_SCHEDULE` di `.env`:

```env
# Setiap 30 menit
CRON_SCHEDULE=*/30 * * * *

# Setiap 2 jam
CRON_SCHEDULE=0 */2 * * *

# Setiap hari jam 9 pagi
CRON_SCHEDULE=0 9 * * *
```

Gunakan https://crontab.guru untuk bantuan cron expression.

## File Penting

- `.env` - Konfigurasi (JANGAN DI-COMMIT!)
- `data/posted.json` - Database tracking (auto-generated)
- `src/index.js` - File utama bot
- `README.md` - Dokumentasi lengkap

## Support

Jika ada masalah, cek:
1. Logs di console saat bot berjalan
2. README.md untuk dokumentasi lengkap
3. Test dengan `npm test` untuk diagnosa

---

**Selamat! Bot Anda siap memantau konten baru Bansos AI! 🎉**
