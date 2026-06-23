import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scraper untuk mengambil data dari AppVerse Bansos AI
 */
class BansosAIScraper {
  constructor(url) {
    this.url = url;
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    // Mapping bulan Indonesia ke angka
    this.monthMap = {
      'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
      'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
      'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
    };
  }

  /**
   * Parse tanggal Indonesia ke Date object
   * Format: "Dibuat pada: Jumat, 15 Mei 2026" atau "Jumat, 15 Mei 2026"
   * @param {string} dateText 
   * @returns {Date|null}
   */
  parseIndonesianDate(dateText) {
    try {
      // Remove "Dibuat pada:" jika ada
      let cleanText = dateText.replace(/Dibuat pada:\s*/i, '').trim();
      
      // Format: "Jumat, 15 Mei 2026"
      // Extract: day, month, year
      const match = cleanText.match(/\w+,\s*(\d{1,2})\s+(\w+)\s+(\d{4})/);
      
      if (match) {
        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        const year = parseInt(match[3]);
        
        const month = this.monthMap[monthName];
        
        if (month !== undefined) {
          return new Date(year, month, day);
        }
      }
      
      return null;
    } catch (err) {
      console.error('[Scraper] Error parsing date:', err.message);
      return null;
    }
  }

  /**
   * Fetch halaman web dan parse HTML
   * @returns {Promise<object>} Data yang di-scrape
   */
  async scrape() {
    try {
      console.log(`[Scraper] Fetching data from: ${this.url}`);
      const response = await this.axiosInstance.get(this.url);
      const $ = cheerio.load(response.data);

      const items = [];

      // Strategi scraping yang lebih spesifik berdasarkan struktur HTML AppVerse
      // Cari semua container yang kemungkinan berisi item resource
      $('div, article, section').each((index, element) => {
        try {
          const $el = $(element);
          const fullText = $el.text();
          
          // Skip jika ada label "Obsolete"
          if (fullText.includes('Obsolete') || fullText.includes('penawaran ini mungkin sudah tidak tersedia')) {
            return; // continue to next iteration
          }
          
          // Cari h3 untuk title (berdasarkan struktur yang terlihat)
          const title = $el.find('h3').first().text().trim();
          if (!title || title.length < 3) return;
          
          // Cari link yang mengarah ke /bansos-ai/resources/
          let link = null;
          $el.find('a').each((i, a) => {
            const href = $(a).attr('href');
            if (href && href.includes('/bansos-ai/resources/')) {
              link = href;
              return false; // break
            }
          });
          
          if (!link) return;
          
          // Convert relative URL ke absolute
          if (!link.startsWith('http')) {
            link = new URL(link, this.url).href;
          }
          
          // Cari tanggal dengan format "Dibuat pada: ..."
          const dateMatch = fullText.match(/Dibuat pada:\s*([^\n]+)/);
          let dateText = dateMatch ? dateMatch[1].trim() : '';
          // Clean up dateText - ambil hanya sampai tahun (4 digit)
          const cleanDateMatch = dateText.match(/([^,]+,\s*\d{1,2}\s+\w+\s+\d{4})/);
          if (cleanDateMatch) {
            dateText = cleanDateMatch[1];
          }
          const parsedDate = this.parseIndonesianDate(dateText);
          
          // Cari view count - biasanya angka besar
          const viewMatch = fullText.match(/Lihat\s*([\d.,]+)/);
          let views = 0;
          if (viewMatch) {
            views = parseInt(viewMatch[1].replace(/[^\d]/g, ''));
          }
          
          // Cari image
          let image = $el.find('img').first().attr('src');
          if (image && !image.startsWith('http') && !image.startsWith('data:')) {
            try {
              image = new URL(image, this.url).href;
            } catch {
              image = null;
            }
          }
          
          // Cari description - ambil paragraph pertama setelah title
          let description = null;
          $el.find('p').each((i, p) => {
            const text = $(p).text().trim();
            if (text && text.length > 10 && text !== title) {
              description = text;
              return false; // break
            }
          });
          
          // Cek apakah ada label "Hot"
          const isHot = fullText.includes('Hot') && !fullText.includes('Hotline');

          // Validasi: pastikan title dan link valid
          if (title && link && title.length > 3) {
            items.push({
              id: this.generateId(link),
              title,
              link,
              dateText,
              date: parsedDate,
              views,
              image: image || null,
              description: description || null,
              isHot,
              scrapedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('[Scraper] Error parsing element:', err.message);
        }
      });

      // Remove duplicates berdasarkan ID
      const uniqueItems = [];
      const seenIds = new Set();
      
      for (const item of items) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueItems.push(item);
        }
      }

      // Sort berdasarkan tanggal (terbaru dulu)
      uniqueItems.sort((a, b) => {
        // Items dengan tanggal valid di atas
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        if (!a.date && !b.date) return 0;
        
        // Sort descending (terbaru dulu)
        return b.date.getTime() - a.date.getTime();
      });

      console.log(`[Scraper] Found ${uniqueItems.length} valid items (after filtering Obsolete)`);
      
      return {
        success: true,
        items: uniqueItems,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('[Scraper] Error fetching data:', error.message);
      return {
        success: false,
        items: [],
        error: error.message,
        scrapedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Generate unique ID dari URL
   * @param {string} url 
   * @returns {string}
   */
  generateId(url) {
    // Extract ID dari URL jika ada pattern seperti /resources/{id}/
    const match = url.match(/\/([a-f0-9-]{36})\//);
    if (match) {
      return match[1];
    }
    
    // Fallback: hash sederhana dari URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Filter hanya item terbaru (opsional, bisa digunakan untuk filter by date)
   * @param {Array} items 
   * @param {number} hoursAgo 
   * @returns {Array}
   */
  filterRecentItems(items, hoursAgo = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    return items.filter(item => {
      if (!item.date) return true; // Include items tanpa tanggal
      
      try {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffTime;
      } catch {
        return true; // Include jika parsing gagal
      }
    });
  }
}

export default BansosAIScraper;
