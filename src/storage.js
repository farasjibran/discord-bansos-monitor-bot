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
   * Cek berdasarkan ID dan juga link untuk menghindari duplikasi
   * @param {string} itemId 
   * @param {string} itemLink - Optional, untuk double-check
   * @returns {boolean}
   */
  isPosted(itemId, itemLink = null) {
    // Cek berdasarkan ID
    const foundById = this.data.posted.some(item => item.id === itemId);
    if (foundById) {
      return true;
    }
    
    // Cek juga berdasarkan link jika disediakan (untuk menghindari duplikasi jika ID berubah)
    if (itemLink) {
      // Normalize URL untuk perbandingan (hapus trailing slash, query params)
      const normalizedNewLink = this.normalizeUrl(itemLink);
      const foundByLink = this.data.posted.some(item => {
        if (!item.link) return false;
        const normalizedStoredLink = this.normalizeUrl(item.link);
        return normalizedStoredLink === normalizedNewLink;
      });
      
      if (foundByLink) {
        console.log(`[Storage] Item dengan link yang sama sudah ada: ${itemLink}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Normalize URL untuk perbandingan yang konsisten
   * @param {string} url 
   * @returns {string}
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Ambil hanya protocol, host, pathname (tanpa query params, hash, trailing slash)
      let normalized = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      // Hapus trailing slash
      normalized = normalized.replace(/\/$/, '');
      return normalized.toLowerCase();
    } catch {
      // Jika parsing gagal, return as-is
      return url.toLowerCase();
    }
  }

  /**
   * Tandai item sebagai sudah dipost
   * @param {object} item 
   */
  markAsPosted(item) {
    if (!this.isPosted(item.id, item.link)) {
      this.data.posted.push({
        id: item.id,
        title: item.title,
        link: item.link || null,
        postedAt: new Date().toISOString()
      });
      this.save();
      console.log(`[Storage] Marked as posted: ${item.title} (ID: ${item.id})`);
    } else {
      console.log(`[Storage] Item sudah ada, skip: ${item.title} (ID: ${item.id})`);
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
