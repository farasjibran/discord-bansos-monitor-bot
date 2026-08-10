import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Base Scraper Class
 * Provides common functionality for all website scrapers
 */
class BaseScraper {
  constructor(url, name = 'BaseScraper') {
    this.url = url;
    this.name = name;
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
  }

  /**
   * Generate unique ID dari URL
   * @param {string} url 
   * @returns {string}
   */
  generateId(url) {
    // Try to extract UUID or slug from URL
    const uuidMatch = url.match(/\/([a-f0-9-]{36})\//);
    if (uuidMatch) {
      return uuidMatch[1];
    }

    // Try to extract slug (last segment)
    const slugMatch = url.match(/\/([^/]+)\/?$/);
    if (slugMatch && slugMatch[1]) {
      return slugMatch[1];
    }
    
    // Fallback: hash dari URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Fetch halaman web
   * @returns {Promise<object>}
   */
  async fetchPage() {
    try {
      console.log(`[${this.name}] Fetching data from: ${this.url}`);
      const response = await this.axiosInstance.get(this.url);
      return {
        success: true,
        html: response.data,
        $: cheerio.load(response.data)
      };
    } catch (error) {
      console.error(`[${this.name}] Error fetching data:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Abstract method - harus diimplementasikan oleh child class
   * @returns {Promise<object>}
   */
  async scrape() {
    throw new Error('scrape() method must be implemented by child class');
  }

  /**
   * Filter item terbaru (opsional)
   * @param {Array} items 
   * @param {number} hoursAgo 
   * @returns {Array}
   */
  filterRecentItems(items, hoursAgo = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    return items.filter(item => {
      if (!item.date) return true;
      
      try {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffTime;
      } catch {
        return true;
      }
    });
  }

  /**
   * Normalize relative URL to absolute
   * @param {string} url 
   * @param {string} baseUrl 
   * @returns {string|null}
   */
  normalizeUrl(url, baseUrl) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return null;
    }
  }

  /**
   * Remove duplicates berdasarkan ID
   * @param {Array} items 
   * @returns {Array}
   */
  removeDuplicates(items) {
    const uniqueItems = [];
    const seenIds = new Set();
    
    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  }
}

export default BaseScraper;
