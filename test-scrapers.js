import AppVerseScraper from './src/scrapers/appverse-scraper.js';
import BansosDevScraper from './src/scrapers/bansosdev-scraper.js';

/**
 * Test script untuk memeriksa kedua scraper tanpa perlu Discord
 */
async function testScrapers() {
  console.log('='.repeat(70));
  console.log('🧪 Testing Multi-Website Scrapers');
  console.log('='.repeat(70));

  const scrapers = [
    new AppVerseScraper('https://appverse.id/bansos-ai'),
    new BansosDevScraper('https://bansos.dev/list/')
  ];

  const allItems = [];

  for (const scraper of scrapers) {
    console.log(`\n[Test] Testing ${scraper.name}...`);
    console.log(`[Test] URL: ${scraper.url}`);
    console.log('-'.repeat(70));

    try {
      const result = await scraper.scrape();

      if (!result.success) {
        console.error(`❌ ${scraper.name} FAILED: ${result.error}`);
        continue;
      }

      console.log(`✅ ${scraper.name} SUCCESS`);
      console.log(`   - Items found: ${result.items.length}`);
      console.log(`   - Source: ${result.source}`);

      if (result.items.length > 0) {
        // Show sample data
        const sample = result.items[0];
        console.log(`\n   📋 Sample Item:`);
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - Title: ${sample.title}`);
        console.log(`   - Link: ${sample.link}`);
        console.log(`   - Source: ${sample.source}`);
        
        if (sample.description) {
          const shortDesc = sample.description.substring(0, 80) + '...';
          console.log(`   - Description: ${shortDesc}`);
        }

        if (sample.tags) {
          console.log(`   - Tags: ${sample.tags.join(', ')}`);
        }

        if (sample.provider) {
          console.log(`   - Provider: ${sample.provider}`);
        }

        if (sample.isFeatured !== undefined) {
          console.log(`   - Featured: ${sample.isFeatured}`);
        }

        if (sample.isHot !== undefined) {
          console.log(`   - Hot: ${sample.isHot}`);
        }

        if (sample.views !== undefined) {
          console.log(`   - Views: ${sample.views}`);
        }

        // Show top 5 items
        console.log(`\n   📊 Top 5 Items:`);
        result.items.slice(0, 5).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
        });
      }

      allItems.push(...result.items);

    } catch (error) {
      console.error(`❌ ${scraper.name} ERROR:`, error.message);
      console.error(error.stack);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total items from all sources: ${allItems.length}`);
  
  // Group by source
  const bySource = allItems.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {});

  console.log('\nItems by source:');
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count} items`);
  });

  console.log('\n✅ Test completed successfully!');
  console.log('='.repeat(70));
}

// Run test
testScrapers().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
