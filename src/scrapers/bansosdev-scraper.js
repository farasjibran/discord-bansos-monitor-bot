import BaseScraper from './base-scraper.js';

/**
 * Scraper untuk bansos.dev/list/
 */
class BansosDevScraper extends BaseScraper {
  constructor(url = 'https://bansos.dev/list/') {
    super(url, 'BansosDevScraper');
  }

  /**
   * Parse tanggal dari text (bansos.dev tidak tampilkan tanggal eksplisit di list)
   * Fallback ke scrape time
   * @returns {Date}
   */
  getDefaultDate() {
    return new Date();
  }

  /**
   * Extract provider name dari teks
   * @param {string} text 
   * @returns {string|null}
   */
  extractProvider(text) {
    // Format: "Provider: Provider Name"
    const match = text.match(/Provider:\s*(.+)/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Scrape data dari bansos.dev
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
          source: 'bansos.dev'
        };
      }

      const $ = pageResult.$;
      const items = [];

      // Cari semua bansos cards
      $('article.bansos-card').each((index, element) => {
        try {
          const $card = $(element);
          
          // Skip jika tidak aktif (optional - tergantung requirement)
          const statusBadge = $card.find('.status-badge').text();
          const isActive = statusBadge.includes('AKTIF');
          
          // Extract title
          const title = $card.find('h2.card-title').text().trim();
          if (!title || title.length < 3) return; // Skip invalid

          // Extract link dari tombol "Lihat Cara Klaim Lengkap"
          let link = null;
          const $detailLink = $card.find('a.btn-primary');
          if ($detailLink.length > 0) {
            link = $detailLink.attr('href');
            // Convert relative URL ke absolute
            // Format: ../list/slug -> https://bansos.dev/list/slug
            if (link && link.startsWith('../list/')) {
              link = link.replace('../list/', 'https://bansos.dev/list/');
            } else if (link && !link.startsWith('http')) {
              link = this.normalizeUrl(link, this.url);
            }
          }

          if (!link) return; // Skip jika tidak ada link

          // Extract description
          const description = $card.find('p.card-desc').text().trim();

          // Extract provider
          const providerText = $card.find('.provider-row .provider-label').text();
          const provider = this.extractProvider(providerText);

          // Extract tags/categories
          const tags = [];
          $card.find('.tag-badge').each((i, tag) => {
            const tagText = $(tag).text().trim();
            if (tagText) tags.push(tagText);
          });

          // Check if featured
          const isFeatured = $card.hasClass('is-featured') || 
                           $card.find('.featured-badge').length > 0;

          // Extract view count
          let views = 0;
          const viewText = $card.find('.stat-icon').first().text();
          const viewMatch = viewText.match(/(\d+)/);
          if (viewMatch) {
            views = parseInt(viewMatch[1]);
          }

          // Extract validity text
          let validity = null;
          const validityText = $card.find('.validity-text').text().trim();
          if (validityText) {
            validity = validityText;
          }

          // Generate ID dari link
          const id = this.generateId(link);

          // Bansos.dev tidak tampilkan tanggal eksplisit di list page
          // Gunakan scrape time sebagai reference
          const scrapedDate = this.getDefaultDate();

          const item = {
            id,
            title,
            link,
            description: description || null,
            provider: provider || null,
            tags: tags.length > 0 ? tags : null,
            isFeatured,
            isActive,
            views,
            validity: validity || null,
            date: scrapedDate,
            dateText: null, // bansos.dev tidak tampilkan tanggal
            scrapedAt: new Date().toISOString(),
            source: 'bansos.dev'
          };

          items.push(item);

        } catch (err) {
          console.error(`[${this.name}] Error parsing card:`, err.message);
        }
      });

      // Remove duplicates
      const uniqueItems = this.removeDuplicates(items);

      // Sort: Featured first, then by views
      uniqueItems.sort((a, b) => {
        // Featured items di atas
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        
        // Then sort by views (descending)
        return b.views - a.views;
      });

      console.log(`[${this.name}] Found ${uniqueItems.length} items`);
      
      return {
        success: true,
        items: uniqueItems,
        scrapedAt: new Date().toISOString(),
        source: 'bansos.dev'
      };

    } catch (error) {
      console.error(`[${this.name}] Error during scraping:`, error.message);
      return {
        success: false,
        items: [],
        error: error.message,
        scrapedAt: new Date().toISOString(),
        source: 'bansos.dev'
      };
    }
  }
}

export default BansosDevScraper;
