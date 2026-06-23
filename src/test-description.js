import dotenv from 'dotenv';
import BansosAIScraper from './scraper.js';

dotenv.config();

async function testDescription() {
  console.log('🔍 Test: Verifikasi Description Capture\n');
  
  const scraper = new BansosAIScraper(
    process.env.WEBSITE_URL || 'https://appverse.id/bansos-ai'
  );
  
  console.log('Melakukan scraping...\n');
  const result = await scraper.scrape();
  
  if (result.success && result.items.length > 0) {
    console.log(`✅ Ditemukan ${result.items.length} items\n`);
    console.log('=' .repeat(80));
    
    // Tampilkan 5 item pertama dengan detail lengkap
    const itemsToShow = result.items.slice(0, 5);
    
    itemsToShow.forEach((item, index) => {
      console.log(`\n[${index + 1}] ${item.title}`);
      console.log(`    Link: ${item.link}`);
      console.log(`    Hot: ${item.isHot ? '🔥 Yes' : 'No'}`);
      console.log(`    Date: ${item.dateText || 'N/A'}`);
      console.log(`    Views: ${item.views || 0}`);
      console.log(`    Image: ${item.image ? 'Yes' : 'No'}`);
      console.log(`    Description: ${item.description || '❌ TIDAK ADA'}`);
      console.log('    ---');
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Statistik
    const withDesc = result.items.filter(item => item.description).length;
    const withoutDesc = result.items.length - withDesc;
    
    console.log(`\n📊 Statistik Description:`);
    console.log(`   - Dengan description: ${withDesc} (${Math.round(withDesc/result.items.length*100)}%)`);
    console.log(`   - Tanpa description: ${withoutDesc} (${Math.round(withoutDesc/result.items.length*100)}%)`);
    
  } else {
    console.log('❌ Scraping gagal atau tidak ada item');
  }
}

testDescription().catch(console.error);
