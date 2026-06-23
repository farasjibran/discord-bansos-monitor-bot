import dotenv from 'dotenv';
import BansosAIScraper from './scraper.js';
import Storage from './storage.js';

dotenv.config();

/**
 * Test script untuk verifikasi setup
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 BANSOS AI MONITOR - TEST SCRIPT');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Cek environment variables
  console.log('📋 Test 1: Environment Variables');
  const requiredEnvVars = ['DISCORD_TOKEN', 'DISCORD_CHANNEL_ID'];
  let envOk = true;

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value.includes('your_')) {
      console.log(`  ❌ ${envVar}: Belum dikonfigurasi`);
      envOk = false;
    } else {
      console.log(`  ✅ ${envVar}: Terkonfigurasi`);
    }
  }

  if (!envOk) {
    console.log('\n⚠️  Silakan edit file .env terlebih dahulu!');
    console.log('   Lihat README.md untuk panduan setup.\n');
    return;
  }

  console.log();

  // Test 2: Test scraper
  console.log('📋 Test 2: Web Scraper');
  try {
    const scraper = new BansosAIScraper(
      process.env.WEBSITE_URL || 'https://appverse.id/bansos-ai'
    );
    
    console.log('  🔄 Melakukan scraping...');
    const result = await scraper.scrape();

    if (result.success && result.items.length > 0) {
      console.log(`  ✅ Scraper berhasil! Ditemukan ${result.items.length} items`);
      console.log('\n  📝 Sample item pertama:');
      const firstItem = result.items[0];
      console.log(`     - Title: ${firstItem.title}`);
      console.log(`     - Link: ${firstItem.link}`);
      console.log(`     - Hot: ${firstItem.isHot ? 'Ya' : 'Tidak'}`);
    } else {
      console.log(`  ⚠️  Scraper tidak menemukan item (${result.items.length} items)`);
      console.log('     Website mungkin mengubah struktur atau sedang down');
    }
  } catch (error) {
    console.log(`  ❌ Scraper error: ${error.message}`);
  }

  console.log();

  // Test 3: Test storage
  console.log('📋 Test 3: Storage System');
  try {
    const storage = new Storage();
    const stats = storage.getStats();
    
    console.log(`  ✅ Storage berhasil diinisialisasi`);
    console.log(`     - Total posted: ${stats.totalPosted}`);
    console.log(`     - Last check: ${stats.lastCheck || 'Belum ada'}`);
  } catch (error) {
    console.log(`  ❌ Storage error: ${error.message}`);
  }

  console.log();

  // Test 4: Cek Discord token format
  console.log('📋 Test 4: Discord Token Format');
  const token = process.env.DISCORD_TOKEN;
  
  // Discord token biasanya format: [REDACTED FOR SECURITY]
  const tokenParts = token.split('.');
  if (tokenParts.length === 3) {
    console.log('  ✅ Token format valid (3 parts)');
  } else {
    console.log('  ⚠️  Token format mungkin tidak valid');
    console.log('     Discord token biasanya terdiri dari 3 bagian dipisah titik');
  }

  console.log();

  // Test 5: Cek Channel ID format
  console.log('📋 Test 5: Discord Channel ID Format');
  const channelId = process.env.DISCORD_CHANNEL_ID;
  
  if (/^\d{17,19}$/.test(channelId)) {
    console.log('  ✅ Channel ID format valid');
  } else {
    console.log('  ⚠️  Channel ID format mungkin tidak valid');
    console.log('     Channel ID harus berupa angka 17-19 digit');
  }

  console.log();
  console.log('='.repeat(60));
  console.log('🎉 Testing selesai!');
  console.log('='.repeat(60));
  console.log();
  console.log('Langkah selanjutnya:');
  console.log('  1. Pastikan semua test ✅ (hijau)');
  console.log('  2. Jalankan bot: npm start');
  console.log('  3. Cek Discord channel untuk notifikasi test');
  console.log();
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
