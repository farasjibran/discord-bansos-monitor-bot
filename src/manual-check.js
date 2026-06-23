#!/usr/bin/env node

/**
 * Manual check script - untuk trigger pengecekan manual tanpa menunggu cron
 */

import dotenv from 'dotenv';
import BansosAIScraper from './scraper.js';
import Storage from './storage.js';
import DiscordNotifier from './discord-client.js';

dotenv.config();

async function manualCheck() {
  console.log('='.repeat(60));
  console.log('🔍 MANUAL CHECK - Bansos AI Monitor');
  console.log('='.repeat(60));
  console.log();

  // Validasi config
  if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CHANNEL_ID) {
    console.error('❌ Error: DISCORD_TOKEN atau DISCORD_CHANNEL_ID belum dikonfigurasi');
    console.error('   Silakan edit file .env terlebih dahulu');
    process.exit(1);
  }

  try {
    // Initialize components
    console.log('[Manual Check] Initializing...');
    const scraper = new BansosAIScraper(
      process.env.WEBSITE_URL || 'https://appverse.id/bansos-ai'
    );
    const storage = new Storage();
    const discord = new DiscordNotifier(
      process.env.DISCORD_TOKEN,
      process.env.DISCORD_CHANNEL_ID
    );

    // Initialize Discord
    await discord.init();

    // Scrape website
    console.log('[Manual Check] Scraping website...');
    const result = await scraper.scrape();

    if (!result.success) {
      throw new Error(`Scraping failed: ${result.error}`);
    }

    console.log(`[Manual Check] Found ${result.items.length} items`);

    // Filter item baru
    const newItems = result.items.filter(item => !storage.isPosted(item.id));
    console.log(`[Manual Check] ${newItems.length} new items`);

    if (newItems.length > 0) {
      // Kirim notifikasi
      console.log('[Manual Check] Sending notifications...');
      const sendResults = await discord.sendBulkNotifications(newItems);

      // Mark as posted
      newItems.forEach(item => storage.markAsPosted(item));

      console.log(`[Manual Check] ✅ Sent ${sendResults.success} notifications`);
      if (sendResults.failed > 0) {
        console.log(`[Manual Check] ⚠️  ${sendResults.failed} failed`);
      }
    } else {
      console.log('[Manual Check] No new content');
    }

    // Update last check
    storage.updateLastCheck();

    // Show stats
    const stats = storage.getStats();
    console.log();
    console.log('📊 Statistics:');
    console.log(`  - Total posted: ${stats.totalPosted}`);
    console.log(`  - Last check: ${new Date(stats.lastCheck).toLocaleString('id-ID')}`);

    // Cleanup
    await discord.destroy();

    console.log();
    console.log('='.repeat(60));
    console.log('✅ Manual check completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('[Manual Check] Error:', error.message);
    process.exit(1);
  }
}

manualCheck();
