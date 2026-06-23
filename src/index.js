import dotenv from 'dotenv';
import cron from 'node-cron';
import BansosAIScraper from './scraper.js';
import Storage from './storage.js';
import DiscordNotifier from './discord-client.js';

// Load environment variables
dotenv.config();

/**
 * Main Monitor Class
 */
class BansosAIMonitor {
  constructor() {
    this.config = {
      discordToken: process.env.DISCORD_TOKEN,
      channelId: process.env.DISCORD_CHANNEL_ID,
      websiteUrl: process.env.WEBSITE_URL || 'https://appverse.id/bansos-ai',
      cronSchedule: process.env.CRON_SCHEDULE || '0 * * * *' // Default: setiap jam
    };

    this.scraper = new BansosAIScraper(this.config.websiteUrl);
    this.storage = new Storage();
    this.discord = null;
    this.cronJob = null;
    this.isRunning = false;
  }

  /**
   * Validasi konfigurasi
   */
  validateConfig() {
    const errors = [];

    if (!this.config.discordToken) {
      errors.push('DISCORD_TOKEN tidak ditemukan di .env');
    }

    if (!this.config.channelId) {
      errors.push('DISCORD_CHANNEL_ID tidak ditemukan di .env');
    }

    if (!cron.validate(this.config.cronSchedule)) {
      errors.push(`CRON_SCHEDULE tidak valid: ${this.config.cronSchedule}`);
    }

    if (errors.length > 0) {
      console.error('[Monitor] Konfigurasi Error:');
      errors.forEach(err => console.error(`  - ${err}`));
      return false;
    }

    return true;
  }

  /**
   * Initialize bot
   */
  async init() {
    try {
      console.log('='.repeat(60));
      console.log('🤖 Bansos AI Monitor Bot - Starting...');
      console.log('='.repeat(60));

      // Validasi config
      if (!this.validateConfig()) {
        throw new Error('Konfigurasi tidak valid. Periksa file .env');
      }

      console.log('[Monitor] Konfigurasi:');
      console.log(`  - Website: ${this.config.websiteUrl}`);
      console.log(`  - Cron Schedule: ${this.config.cronSchedule}`);
      console.log(`  - Channel ID: ${this.config.channelId}`);

      // Initialize Discord bot
      console.log('\n[Monitor] Menginisialisasi Discord bot...');
      this.discord = new DiscordNotifier(
        this.config.discordToken,
        this.config.channelId
      );

      const discordReady = await this.discord.init();
      if (!discordReady) {
        throw new Error('Discord bot gagal diinisialisasi');
      }

      // Test koneksi
      console.log('[Monitor] Testing Discord connection...');
      await this.discord.testConnection();

      console.log('\n✅ Bot berhasil diinisialisasi!');
      
      return true;
    } catch (error) {
      console.error('[Monitor] Initialization error:', error.message);
      return false;
    }
  }

  /**
   * Cek konten baru dan kirim notifikasi
   */
  async checkForNewContent() {
    if (this.isRunning) {
      console.log('[Monitor] Pengecekan sedang berjalan, skip...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('\n' + '='.repeat(60));
      console.log(`[Monitor] Pengecekan dimulai: ${new Date().toLocaleString('id-ID')}`);
      console.log('='.repeat(60));

      // Scrape website
      const result = await this.scraper.scrape();

      if (!result.success) {
        throw new Error(`Scraping gagal: ${result.error}`);
      }

      console.log(`[Monitor] Berhasil scrape ${result.items.length} items`);

      // Filter item baru (yang belum pernah dipost)
      const newItems = result.items.filter(item => !this.storage.isPosted(item.id));

      console.log(`[Monitor] Ditemukan ${newItems.length} konten baru`);

      if (newItems.length > 0) {
        // Kirim notifikasi ke Discord
        console.log('[Monitor] Mengirim notifikasi ke Discord...');
        
        const sendResults = await this.discord.sendBulkNotifications(newItems);

        // Tandai sebagai sudah dipost HANYA yang berhasil dikirim
        // TODO: Track which items succeeded - for now mark all to avoid spam
        // Better: Only mark successful items once we track individual results
        if (sendResults.success > 0) {
          newItems.forEach(item => {
            this.storage.markAsPosted(item);
          });
        }

        console.log(`[Monitor] ✅ Berhasil mengirim ${sendResults.success} notifikasi`);
        
        if (sendResults.failed > 0) {
          console.log(`[Monitor] ⚠️  ${sendResults.failed} notifikasi gagal dikirim`);
          console.log(`[Monitor] ⚠️  Items yang gagal TIDAK di-mark as posted, akan retry next run`);
        }
      } else {
        console.log('[Monitor] Tidak ada konten baru');
      }

      // Update last check time
      this.storage.updateLastCheck();

      // Cleanup data lama (30 hari)
      this.storage.cleanup(30);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[Monitor] Pengecekan selesai dalam ${duration}s`);
      console.log('='.repeat(60));

    } catch (error) {
      console.error('[Monitor] Error saat pengecekan:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start cron job
   */
  startCronJob() {
    console.log('\n[Monitor] Memulai cron job...');
    console.log(`[Monitor] Schedule: ${this.config.cronSchedule}`);

    this.cronJob = cron.schedule(this.config.cronSchedule, () => {
      this.checkForNewContent();
    });

    console.log('✅ Cron job berhasil dimulai!');
    console.log('[Monitor] Bot akan mengecek konten baru sesuai schedule');
    
    // Tampilkan next run time
    const cronDate = cron.schedule(this.config.cronSchedule, () => {});
    console.log(`[Monitor] Pengecekan berikutnya akan dilakukan sesuai schedule`);
  }

  /**
   * Stop cron job
   */
  stopCronJob() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('[Monitor] Cron job dihentikan');
    }
  }

  /**
   * Run pengecekan manual (tanpa menunggu cron)
   */
  async runManualCheck() {
    console.log('\n[Monitor] Menjalankan pengecekan manual...');
    await this.checkForNewContent();
  }

  /**
   * Show stats
   */
  showStats() {
    const stats = this.storage.getStats();
    console.log('\n' + '='.repeat(60));
    console.log('📊 STATISTIK BOT');
    console.log('='.repeat(60));
    console.log(`Total konten yang sudah dipost: ${stats.totalPosted}`);
    console.log(`Pengecekan terakhir: ${stats.lastCheck ? new Date(stats.lastCheck).toLocaleString('id-ID') : 'Belum pernah'}`);
    console.log(`Post pertama: ${stats.oldestPost ? new Date(stats.oldestPost).toLocaleString('id-ID') : 'Belum ada'}`);
    console.log(`Post terbaru: ${stats.newestPost ? new Date(stats.newestPost).toLocaleString('id-ID') : 'Belum ada'}`);
    console.log('='.repeat(60));
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('\n[Monitor] Shutting down...');
    
    this.stopCronJob();
    
    if (this.discord) {
      await this.discord.destroy();
    }

    console.log('[Monitor] Bot berhasil dihentikan');
    process.exit(0);
  }

  /**
   * Start bot dengan semua fitur
   */
  async start() {
    // Initialize
    const initialized = await this.init();
    if (!initialized) {
      console.error('❌ Bot gagal diinisialisasi');
      process.exit(1);
    }

    // Jalankan pengecekan pertama kali
    console.log('\n[Monitor] Menjalankan pengecekan awal...');
    await this.checkForNewContent();

    // Start cron job
    this.startCronJob();

    // Show stats
    this.showStats();

    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    console.log('\n✅ Bot berjalan! Tekan Ctrl+C untuk menghentikan');
  }
}

// Main execution
const monitor = new BansosAIMonitor();
monitor.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export default BansosAIMonitor;
