import dotenv from 'dotenv';
import BansosAIScraper from './scraper.js';
import DiscordNotifier from './discord-client.js';

dotenv.config();

async function previewDiscordMessage() {
  console.log('🔍 Preview: Pesan Discord dengan Description\n');
  
  const scraper = new BansosAIScraper(
    process.env.WEBSITE_URL || 'https://appverse.id/bansos-ai'
  );
  
  console.log('Melakukan scraping...\n');
  const result = await scraper.scrape();
  
  if (result.success && result.items.length > 0) {
    console.log(`✅ Ditemukan ${result.items.length} items\n`);
    console.log('=' .repeat(80));
    console.log('PREVIEW: Bagaimana pesan akan tampil di Discord');
    console.log('=' .repeat(80));
    
    // Simulasi format embed Discord untuk 3 item pertama
    const itemsToShow = result.items.slice(0, 3);
    
    itemsToShow.forEach((item, index) => {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📨 EMBED MESSAGE #${index + 1}`);
      console.log(`${'─'.repeat(80)}`);
      console.log(`🔗 TITLE: ${item.title}`);
      console.log(`🌐 LINK: ${item.link}`);
      console.log(`🎨 COLOR: ${item.isHot ? '🔥 Orange (Hot)' : '🔵 Blue (Normal)'}`);
      
      // Description dengan truncate jika > 300 char (sesuai dengan discord-client.js)
      if (item.description) {
        const maxLength = 300;
        const desc = item.description.length > maxLength 
          ? item.description.substring(0, maxLength) + '...'
          : item.description;
        console.log(`📝 DESCRIPTION:\n   ${desc}`);
      } else {
        console.log(`📝 DESCRIPTION: (tidak ada)`);
      }
      
      // Fields
      console.log(`\n📊 FIELDS:`);
      if (item.dateText) {
        console.log(`   📅 Tanggal: ${item.dateText}`);
      }
      if (item.views > 0) {
        console.log(`   👁️  Views: ${item.views.toLocaleString('id-ID')}`);
      }
      if (item.isHot) {
        console.log(`   🔥 Status: HOT!`);
      }
      
      if (item.image) {
        console.log(`\n🖼️  IMAGE: ${item.image}`);
      }
      
      console.log(`\n⏰ TIMESTAMP: ${new Date().toLocaleString('id-ID')}`);
      console.log(`💬 FOOTER: AppVerse Bansos AI Monitor`);
    });
    
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`\n✨ Description berhasil di-scrape dan akan muncul di Discord embed!`);
    console.log(`📊 Total items dengan description: ${result.items.filter(i => i.description).length}/${result.items.length}`);
    
  } else {
    console.log('❌ Scraping gagal atau tidak ada item');
  }
}

previewDiscordMessage().catch(console.error);
