import BaseScraper from './base-scraper.js';

/**
 * Scraper untuk mengambil data dari AppVerse Bansos AI
 */
class AppVerseScraper extends BaseScraper {
  constructor(url = 'https://appverse.id/bansos-ai') {
    super(url, 'AppVerseScraper');
    
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
      console.error(`[${this.name}] Error parsing date:`, err.message);
      return null;
    }
  }

  /**
   * Scrape data dari AppVerse Bansos AI
   * @returns {Promise<object>}
   */
  async scrape() {
    try {
      const pageResult = await this.fetchPage();
      
      if (!pageResult.success) {
        return {
          success: false,
          items: [],
          error: pageResult.error,
          scrapedAt: new Date().toISOString(),
          source: 'appverse'
        };
      }

      const $ = pageResult.$;
      const items = [];

      // Strategi scraping untuk struktur HTML AppVerse
      $('div, article, section').each((index, element) => {
        try {
          const $el = $(element);
          const fullText = $el.text();
          
          // Skip jika ada label "Obsolete"
          if (fullText.includes('Obsolete') || fullText.includes('penawaran ini mungkin sudah tidak tersedia')) {
            return; // continue to next iteration
          }
          
          // Cari h3 untuk title
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
          link = this.normalizeUrl(link, this.url);
          if (!link) return;
          
          // Cari tanggal dengan format "Dibuat pada: ..."
          const dateMatch = fullText.match(/Dibuat pada:\s*([^\n]+)/);
          let dateText = dateMatch ? dateMatch[1].trim() : '';
          // Clean up dateText - ambil hanya sampai tahun (4 digit)
          const cleanDateMatch = dateText.match(/([^,]+,\s*\d{1,2}\s+\w+\s+\d{4})/);
          if (cleanDateMatch) {
            dateText = cleanDateMatch[1];
          }
          const parsedDate = this.parseIndonesianDate(dateText);
          
          // Cari view count
          const viewMatch = fullText.match(/Lihat\s*([\d.,]+)/);
          let views = 0;
          if (viewMatch) {
            views = parseInt(viewMatch[1].replace(/[^\d]/g, ''));
          }
          
          // Cari image
          let image = $el.find('img').first().attr('src');
          image = this.normalizeUrl(image, this.url);
          
          // Cari description
          let description = null;
          
          // Prioritaskan p dengan class spesifik
          const $specificDesc = $el.find('p.line-clamp-3, p[class*="line-clamp"], p[class*="text-text-mid"]').first();
          if ($specificDesc.length > 0) {
            description = $specificDesc.text().trim();
          }
          
          // Fallback: ambil paragraph pertama setelah title
          if (!description) {
            $el.find('p').each((i, p) => {
              const text = $(p).text().trim();
              if (text && text.length > 10 && text !== title) {
                description = text;
                return false; // break
              }
            });
          }
          
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
              scrapedAt: new Date().toISOString(),
              source: 'appverse'
            });
          }
        } catch (err) {
          console.error(`[${this.name}] Error parsing element:`, err.message);
        }
      });

      // Remove duplicates
      const uniqueItems = this.removeDuplicates(items);

      // Sort berdasarkan tanggal (terbaru dulu)
      uniqueItems.sort((a, b) => {
        // Items dengan tanggal valid di atas
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        if (!a.date && !b.date) return 0;
        
        // Sort descending (terbaru dulu)
        return b.date.getTime() - a.date.getTime();
      });

      console.log(`[${this.name}] Found ${uniqueItems.length} valid items (after filtering Obsolete)`);
      
      return {
        success: true,
        items: uniqueItems,
        scrapedAt: new Date().toISOString(),
        source: 'appverse'
      };

    } catch (error) {
      console.error(`[${this.name}] Error during scraping:`, error.message);
      return {
        success: false,
        items: [],
        error: error.message,
        scrapedAt: new Date().toISOString(),
        source: 'appverse'
      };
    }
  }
}

export default AppVerseScraper;
