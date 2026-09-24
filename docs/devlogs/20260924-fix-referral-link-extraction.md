# Fix: Ekstraksi Link Referral Claude Langsung

**Branch:** `main`
**Tanggal:** 2026-09-24
**Command:** `bug`
**Tiket:** —

## Ringkasan

Notifikasi public search sebelumnya mengirim post yang hanya *membicarakan* referral Claude (termasuk post tidak relevan dan "mencari referral"), bukan link referral-nya. Sekarang scraper mengekstrak link `https://claude.ai/referral/<kode>` langsung dari isi post; item tanpa link referral dibuang, dan notifikasi Discord memakai link referral sebagai tautan utama.

## Perubahan

| File | Status | Keterangan |
|------|--------|-----------|
| `src/scrapers/public-search-rss.js` | UPDATE | Ekstraksi link referral (`extractReferralUrls`), item tanpa link dibuang, `id`/`link` = URL referral, `postLink` = post sumber, deskripsi dibersihkan dari HTML, query Google News diganti syntax OR (query multi-kata lama = AND dan selalu 0 hasil), tambah feed Reddit `"claude.ai/referral"`. |
| `src/discord-client.js` | UPDATE | Embed public-search menampilkan field `🎁 Link Referral` dan `Post Sumber`. |
| `src/test-public-search-rss.js` | UPDATE | Fixture pakai link referral asli; kasus kode dengan `-`, HTML strip, post "mencari referral" ke-drop. |
| `README.md` | UPDATE | Dokumentasi perilaku baru. |

## Akar Masalah

1. Filter hanya cek kata "claude/referral/gift/..." di judul+deskripsi → post pacaran dan post "mencari referral" lolos.
2. Query Google News `"Claude referral gift invite trial"` diperlakukan AND → feed selalu kosong, jadi hanya Reddit yang menghasilkan data.
3. Deskripsi Reddit RSS dikirim mentah (HTML `<!-- SC_OFF --><div class="md">...`) ke embed.

## Testing

- `npm run test:rss` lulus; `node --check` lulus.
- Live smoke test: feed Reddit menghasilkan `https://claude.ai/referral/gZZ-9vPSCC` (kode dengan tanda `-` terekstrak penuh) dan `https://claude.ai/referral/scJrEtQS9A`.
- Google News fetch berhasil, item tanpa link referral ter-filter (artikel berita jarang memuat link referral langsung).
- HTTP 429 Reddit saat pengujian beruntun bersifat sementara; cron per jam aman.

## Catatan

Threads tetap opsional (`THREADS_ACCESS_TOKEN`). Deduplikasi kini per link referral, jadi post berbeda dengan link referral sama hanya dikirim sekali.
