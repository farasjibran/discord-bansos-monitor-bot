# Discord Bansos AI Monitor Bot

Bot Discord yang memantau AppVerse Bansos AI, Bansos.dev, dan pencarian publik untuk referral Claude/Anthropic. Konten baru dikirim sebagai Discord embed dan dicatat agar tidak dikirim ulang.

## Sumber yang dipantau

- **AppVerse Bansos AI** — tools AI, kredit, dan penawaran; item berlabel obsolete dilewati.
- **Bansos.dev** — direktori bantuan untuk developer; item aktif maupun obsolete dapat muncul.
- **Google News RSS dan Reddit RSS** — pencarian referral Claude/Anthropic.
- **Threads** — pencarian opsional melalui Threads Keyword Search API jika `THREADS_ACCESS_TOKEN` tersedia.

Hasil pencarian publik harus menyebut Claude/Anthropic dan istilah referral, invite, gift, trial, atau free pro. Hasil tanpa tanggal valid, lebih tua dari tujuh hari, atau bertanggal masa depan dilewati. Sumber publik bersifat best-effort; kegagalan satu sumber tidak menghentikan sumber lain. Bot hanya mengirim tautan untuk klaim manual—tidak membuat akun atau mengklaim trial.

## Persyaratan

- Node.js 18 atau lebih baru
- Discord bot token dan ID channel

## Instalasi dan konfigurasi

```bash
npm install
cp .env.example .env
```

Isi `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
CRON_SCHEDULE=0 * * * *
THREADS_ACCESS_TOKEN=
```

Buat bot di [Discord Developer Portal](https://discord.com/developers/applications), undang ke server, dan beri izin **View Channel**, **Send Messages**, serta **Embed Links** pada channel tujuan. Salin token bot dan channel ID ke `.env`. `MESSAGE CONTENT INTENT` tidak diperlukan.

`THREADS_ACCESS_TOKEN` opsional. Pencarian Threads memerlukan permission `threads_basic` dan `threads_keyword_search`; pencarian post publik mungkin membutuhkan approval Meta. Jangan commit token.

## Menjalankan

```bash
npm start       # mulai bot; langsung cek sekali, lalu mengikuti cron
npm run dev     # mode watch
npm run test:rss # tes filter RSS/Atom/Threads lokal tanpa Discord atau jaringan
```

Default `CRON_SCHEDULE` adalah `0 * * * *` (setiap jam). Format cron: `minute hour day month dayOfWeek`. Contoh: `*/30 * * * *` untuk setiap 30 menit.

`npm run clear` menghapus seluruh riwayat konten yang sudah dikirim dari `data/posted.json`; jalankan hanya jika memang ingin mengirim ulang semua item yang ditemukan.

> **Catatan:** Script `npm test`, `npm run check`, dan `npm run init` masih merujuk ke `src/scraper.js`, yang tidak tersedia di project saat ini. Gunakan `npm run test:rss` untuk tes lokal yang tersedia.

## Penyimpanan

Storage dibuat otomatis di `data/posted.json`. Deduplikasi memakai ID dan URL yang dinormalisasi. Item hanya ditandai setelah notifikasi Discord berhasil dikirim; kegagalan pengiriman akan dicoba kembali pada pengecekan berikutnya. Data posting yang lebih lama dari 180 hari dibersihkan otomatis.

## Struktur project

```text
discord-bansos-monitor-bot/
├── src/
│   ├── scrapers/
│   │   ├── base-scraper.js
│   │   ├── appverse-scraper.js
│   │   ├── bansosdev-scraper.js
│   │   ├── public-search-rss.js
│   │   └── test-public-search-rss.js
│   ├── index.js
│   ├── discord-client.js
│   ├── storage.js
│   ├── clear-storage.js
│   └── ...                 # skrip legacy/test tambahan
├── data/                   # dibuat otomatis
├── .env.example
└── package.json
```

## Pemecahan masalah

- **Bot gagal login:** periksa `DISCORD_TOKEN` dan pastikan token masih aktif.
- **Channel tidak ditemukan atau pengiriman gagal:** periksa `DISCORD_CHANNEL_ID`, akses bot ke channel, dan izin kirim pesan/embed.
- **Scraper menghasilkan nol item:** situs bisa berubah, tidak tersedia, atau sedang membatasi akses. Periksa log sumber terkait.
- **Item dikirim ulang:** riwayat ada di `data/posted.json`; jangan hapus file kecuali ingin reset deduplikasi.

Jangan commit `.env` atau membagikan token bot maupun token Threads.
