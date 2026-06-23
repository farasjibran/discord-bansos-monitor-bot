import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage manager untuk menyimpan data konten yang sudah dipost
 */
class Storage {
  constructor(filePath = null) {
    this.filePath = filePath || path.join(__dirname, '../data/posted.json');
    this.data = { posted: [], lastCheck: null };
    this.init();
  }

  /**
   * Inisialisasi storage, buat file jika belum ada
   */
  init() {
    try {
      // Pastikan directory ada
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Load data jika file sudah ada
      if (fs.existsSync(this.filePath)) {
        this.load();
      } else {
        // Buat file baru
        this.save();
      }

      console.log('[Storage] Initialized at:', this.filePath);
    } catch (error) {
      console.error('[Storage] Initialization error:', error.message);
    }
  }

  /**
   * Load data dari file
   */
  load() {
    try {
      const rawData = fs.readFileSync(this.filePath, 'utf8');
      this.data = JSON.parse(rawData);
      console.log(`[Storage] Loaded ${this.data.posted.length} posted items`);
    } catch (error) {
      console.error('[Storage] Load error:', error.message);
      this.data = { posted: [], lastCheck: null };
    }
  }

  /**
   * Save data ke file
   */
  save() {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.data, null, 2),
        'utf8'
      );
      console.log('[Storage] Data saved');
    } catch (error) {
      console.error('[Storage] Save error:', error.message);
    }
  }

  /**
   * Cek apakah item sudah pernah dipost
   * @param {string} itemId 
   * @returns {boolean}
   */
  isPosted(itemId) {
    return this.data.posted.some(item => item.id === itemId);
  }

  /**
   * Tandai item sebagai sudah dipost
   * @param {object} item 
   */
  markAsPosted(item) {
    if (!this.isPosted(item.id)) {
      this.data.posted.push({
        id: item.id,
        title: item.title,
        postedAt: new Date().toISOString()
      });
      this.save();
      console.log(`[Storage] Marked as posted: ${item.title}`);
    }
  }

  /**
   * Update waktu pengecekan terakhir
   */
  updateLastCheck() {
    this.data.lastCheck = new Date().toISOString();
    this.save();
  }

  /**
   * Get waktu pengecekan terakhir
   * @returns {string|null}
   */
  getLastCheck() {
    return this.data.lastCheck;
  }

  /**
   * Get semua item yang sudah dipost
   * @returns {Array}
   */
  getPostedItems() {
    return this.data.posted;
  }

  /**
   * Cleanup: hapus data lama (opsional, untuk menjaga ukuran file)
   * @param {number} daysOld - Hapus data lebih lama dari X hari
   */
  cleanup(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialCount = this.data.posted.length;
    this.data.posted = this.data.posted.filter(item => {
      const postedDate = new Date(item.postedAt);
      return postedDate >= cutoffDate;
    });

    const removedCount = initialCount - this.data.posted.length;
    if (removedCount > 0) {
      this.save();
      console.log(`[Storage] Cleaned up ${removedCount} old items`);
    }
  }

  /**
   * Reset semua data (untuk testing)
   */
  reset() {
    this.data = { posted: [], lastCheck: null };
    this.save();
    console.log('[Storage] Data reset');
  }

  /**
   * Get statistik
   * @returns {object}
   */
  getStats() {
    return {
      totalPosted: this.data.posted.length,
      lastCheck: this.data.lastCheck,
      oldestPost: this.data.posted.length > 0 
        ? this.data.posted[0].postedAt 
        : null,
      newestPost: this.data.posted.length > 0 
        ? this.data.posted[this.data.posted.length - 1].postedAt 
        : null
    };
  }
}

export default Storage;
