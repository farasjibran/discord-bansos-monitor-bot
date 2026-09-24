# Monitor Referral Claude Terbaru

**Branch:** `feat/claude-referral-monitor`
**Tanggal:** 2026-09-24
**Command:** `prompt`
**Tiket:** —

## Ringkasan

Menambahkan pencarian referral Claude dari Google News RSS, Reddit RSS, dan Threads Keyword Search API opsional ke Discord monitor. Hasil harus relevan, memiliki tanggal valid, dan berumur maksimal tujuh hari; klaim tetap dilakukan manual.

## Konteks

- **Requirement:** Temukan post publik baru tentang Claude referral/gift/trial dan kirim notifikasi Discord.
- **Acceptance Criteria:** Deduplikasi memakai storage existing; hasil lama, masa depan, atau tidak relevan dilewati; tidak ada pendaftaran atau klaim otomatis.

## Perubahan

| File | Status | Keterangan |
|------|--------|-----------|
| `src/scrapers/public-search-rss.js` | NEW | Ambil Google News/Reddit RSS dan Threads API; filter relevansi, tanggal, dan URL. |
| `src/test-public-search-rss.js` | NEW | Tes filter RSS dan Atom tanpa jaringan. |
| `src/index.js` | UPDATE | Daftarkan scraper RSS pada monitor existing. |
| `src/discord-client.js` | UPDATE | Tampilkan tanggal publikasi dan nama sumber di embed. |
| `package.json` | UPDATE | Tambah command `npm run test:rss`. |
| `.env.example` | UPDATE | Tambah `THREADS_ACCESS_TOKEN` opsional. |
| `README.md` | UPDATE | Dokumentasikan sumber, batas umur, dan syarat permission Threads. |

## Detail Teknis

- **Arsitektur:** Scraper memakai Axios/Cheerio existing untuk RSS dan Threads `GET /v1.0/keyword_search` dengan `search_type=RECENT`; item masuk ke alur deduplikasi/Discord existing. Threads membuat tiga pencarian per polling saat token tersedia.
- **DB Changes:** Tidak ada.
- **API Changes:** Threads Graph API Keyword Search, hanya dipanggil bila token tersedia.
- **Dependencies:** Tidak ada.

## Testing

- **Test Results:** `npm run test:rss` lulus; `node --check` seluruh file JavaScript terkait lulus; `git diff --check` lulus.
- **Edge Cases:** Item lama, tanggal masa depan, konten tak relevan, link non-HTTP(S), dan Atom RSS.
- **Manual Test:** Jalankan bot dengan konfigurasi Discord valid dan pastikan embed menampilkan sumber serta tanggal.

## Deployment

- **Migration:** Tidak ada.
- **Environment Variables:** `THREADS_ACCESS_TOKEN` opsional; butuh `threads_basic` dan `threads_keyword_search`. Public search perlu approval Meta untuk `threads_keyword_search`.
- **Config Changes:** Tidak ada.

## Catatan

Google News/Reddit hanya sumber publik best-effort; feed dapat berubah atau menolak akses. Tanpa approval `threads_keyword_search`, Threads dapat membatasi hasil ke post pemilik token. Item harus diklaim manual melalui tautannya.
