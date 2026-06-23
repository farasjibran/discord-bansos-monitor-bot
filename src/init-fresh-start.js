#!/usr/bin/env node

/**
 * Fresh Start Initialization Script
 * Run this ONCE after deploying to mark older items as "already posted"
 * Only 3 latest items will be posted on first bot run
 */

import BansosAIScraper from './scraper.js';
import Storage from './storage.js';

async function initFreshStart() {
  console.log('='.repeat(60));
  console.log('🔄 FRESH START INITIALIZATION');
  console.log('='.repeat(60));
  console.log();
  
  try {
    // 1. Scrape website
    console.log('1️⃣ Scraping website...');
    const scraper = new BansosAIScraper(
      process.env.WEBSITE_URL || 'https://appverse.id/bansos-ai'
    );
    
    const result = await scraper.scrape();
    
    if (!result.success || result.items.length === 0) {
      throw new Error('Scraping failed or no items found');
    }
    
    console.log(`   ✅ Found ${result.items.length} items (sorted by date)`);
    console.log();
    
    // 2. Split items
    const allItems = result.items;
    const latest3 = allItems.slice(0, 3);  // 3 terbaru
    const older = allItems.slice(3);       // Sisanya
    
    console.log('2️⃣ Splitting items:');
    console.log(`   - ${latest3.length} latest items (WILL BE POSTED)`);
    console.log(`   - ${older.length} older items (will be marked as posted)`);
    console.log();
    
    // 3. Show what will be posted
    console.log('3️⃣ Items that WILL BE POSTED on first run:');
    latest3.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.title}`);
      console.log(`      📅 ${item.dateText}`);
    });
    console.log();
    
    // 4. Initialize storage with older items marked as posted
    console.log('4️⃣ Initializing storage...');
    const storage = new Storage();
    
    // Mark older items as posted
    older.forEach(item => {
      storage.markAsPosted(item);
    });
    
    // Update last check
    storage.updateLastCheck();
    
    console.log(`   ✅ ${older.length} items marked as posted`);
    console.log();
    
    // 5. Summary
    console.log('='.repeat(60));
    console.log('✅ FRESH START INITIALIZED!');
    console.log('='.repeat(60));
    console.log();
    console.log('📊 Summary:');
    console.log(`   - Total items on website: ${allItems.length}`);
    console.log(`   - Items marked as posted: ${older.length}`);
    console.log(`   - Items ready to post: ${latest3.length}`);
    console.log();
    console.log('🚀 Next: Run bot with "npm start"');
    console.log('   Bot will post only 3 latest items!');
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initFreshStart();
