import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';

/**
 * Discord Client untuk mengirim notifikasi konten baru
 */
class DiscordNotifier {
  constructor(token, channelId) {
    this.token = token;
    this.channelId = channelId;
    this.client = null;
    this.isReady = false;
  }

  /**
   * Initialize dan login Discord bot
   */
  async init() {
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages
        ]
      });

      // Event: Bot siap
      this.client.once('ready', () => {
        console.log(`[Discord] Bot logged in as ${this.client.user.tag}`);
        this.isReady = true;
      });

      // Event: Error handling
      this.client.on('error', (error) => {
        console.error('[Discord] Client error:', error.message);
      });

      // Login
      await this.client.login(this.token);

      // Wait sampai bot ready
      await this.waitForReady();

      return true;
    } catch (error) {
      console.error('[Discord] Initialization error:', error.message);
      return false;
    }
  }

  /**
   * Wait sampai bot ready
   */
  async waitForReady(timeout = 10000) {
    const startTime = Date.now();
    while (!this.isReady) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Bot ready timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Kirim notifikasi konten baru ke Discord channel
   * @param {object} item - Data konten
   */
  async sendNotification(item) {
    try {
      if (!this.isReady) {
        console.error('[Discord] Bot not ready');
        return false;
      }

      const channel = await this.client.channels.fetch(this.channelId);
      
      if (!channel) {
        console.error('[Discord] Channel not found');
        return false;
      }

      // Buat embed message
      const embed = this.createEmbed(item);

      // Kirim message
      await channel.send({ embeds: [embed] });
      console.log(`[Discord] Notification sent: ${item.title}`);

      return true;
    } catch (error) {
      console.error('[Discord] Send notification error:', error.message);
      if (error.code) console.error('[Discord] Error code:', error.code);
      if (error.rawError) console.error('[Discord] Raw error:', JSON.stringify(error.rawError, null, 2));
      return false;
    }
  }

  /**
   * Buat Discord embed dari data item
   * @param {object} item 
   * @returns {EmbedBuilder}
   */
  createEmbed(item) {
    const source = item.source || 'appverse'; // Default ke appverse jika tidak ada
    
    // Konfigurasi berbeda per source
    const sourceConfig = {
      'appverse': {
        color: 0x5865F2, // Discord Blurple
        footerText: 'Source: AppVerse Bansos AI',
        footerIcon: 'https://appverse.id/favicon.ico',
        hotColor: 0xFF4500 // Orange untuk Hot items
      },
      'bansos.dev': {
        color: 0x10b981, // Green
        footerText: 'Source: Bansos.dev',
        footerIcon: 'https://bansos.dev/favicon.ico',
        featuredColor: 0xFBBF24 // Yellow untuk Featured items
      }
    };

    const config = sourceConfig[source] || sourceConfig['appverse'];

    // Determine color berdasarkan source dan status
    let embedColor = config.color;
    if (source === 'appverse' && item.isHot) {
      embedColor = config.hotColor;
    } else if (source === 'bansos.dev' && item.isFeatured) {
      embedColor = config.featuredColor;
    }

    const embed = new EmbedBuilder()
      .setTitle(item.title)
      .setURL(item.link)
      .setColor(embedColor)
      .setTimestamp();

    // Add description jika ada
    if (item.description) {
      const maxLength = 300;
      const desc = item.description.length > maxLength 
        ? item.description.substring(0, maxLength) + '...'
        : item.description;
      embed.setDescription(desc);
    }

    // Add image jika ada (biasanya dari AppVerse)
    if (item.image) {
      embed.setImage(item.image);
    }

    // Build fields berdasarkan source
    const fields = [];

    if (source === 'appverse') {
      // AppVerse specific fields
      if (item.dateText) {
        fields.push({
          name: '📅 Tanggal',
          value: item.dateText,
          inline: true
        });
      }

      if (item.views !== undefined && item.views > 0) {
        fields.push({
          name: '👁️ Views',
          value: item.views.toLocaleString('id-ID'),
          inline: true
        });
      }

      if (item.isHot) {
        fields.push({
          name: '🔥 Status',
          value: 'HOT!',
          inline: true
        });
      }
    } else if (source === 'bansos.dev') {
      // Bansos.dev specific fields
      if (item.provider) {
        fields.push({
          name: '🏢 Provider',
          value: item.provider,
          inline: true
        });
      }

      if (item.validity) {
        fields.push({
          name: '⏰ Validity',
          value: item.validity,
          inline: true
        });
      }

      if (item.isFeatured) {
        fields.push({
          name: '⭐ Status',
          value: 'FEATURED',
          inline: true
        });
      }

      if (item.tags && item.tags.length > 0) {
        // Batasi tags maksimal 5 untuk tidak terlalu panjang
        const displayTags = item.tags.slice(0, 5).join(', ');
        const moreCount = item.tags.length > 5 ? ` (+${item.tags.length - 5} more)` : '';
        fields.push({
          name: '🏷️ Tags',
          value: displayTags + moreCount,
          inline: false
        });
      }

      if (item.isActive !== undefined) {
        fields.push({
          name: '✅ Status',
          value: item.isActive ? 'AKTIF' : 'OBSOLETE',
          inline: true
        });
      }
    }

    if (fields.length > 0) {
      embed.addFields(fields);
    }

    // Footer dengan source differentiation
    embed.setFooter({ 
      text: config.footerText,
      iconURL: config.footerIcon
    });

    return embed;
  }

  /**
   * Kirim notifikasi untuk multiple items
   * @param {Array} items 
   * @returns {Object} { successCount, failedCount, successItems, failedItems }
   */
  async sendBulkNotifications(items) {
    console.log(`[Discord] Sending ${items.length} notifications...`);
    
    const results = {
      successCount: 0,
      failedCount: 0,
      successItems: [],
      failedItems: []
    };

    for (const item of items) {
      const success = await this.sendNotification(item);
      if (success) {
        results.successCount++;
        results.successItems.push(item);
        console.log(`[Discord] ✓ Sent: ${item.title} (ID: ${item.id})`);
      } else {
        results.failedCount++;
        results.failedItems.push(item);
        console.log(`[Discord] ✗ Failed: ${item.title} (ID: ${item.id})`);
      }

      // Delay untuk menghindari rate limit (2 detik antar message)
      if (items.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[Discord] Bulk send completed: ${results.successCount} success, ${results.failedCount} failed`);
    return results;
  }

  /**
   * Kirim message sederhana (tanpa embed)
   * @param {string} message 
   */
  async sendSimpleMessage(message) {
    try {
      if (!this.isReady) {
        console.error('[Discord] Bot not ready');
        return false;
      }

      const channel = await this.client.channels.fetch(this.channelId);
      await channel.send(message);
      console.log('[Discord] Simple message sent');
      return true;
    } catch (error) {
      console.error('[Discord] Send simple message error:', error.message);
      return false;
    }
  }

  /**
   * Test koneksi dengan mengirim test message
   */
  async testConnection() {
    try {
      const testEmbed = new EmbedBuilder()
        .setTitle('🤖 Bot Test')
        .setDescription('Discord bot berhasil terhubung dan siap memantau konten baru!')
        .setColor(0x00FF00)
        .setTimestamp();

      const channel = await this.client.channels.fetch(this.channelId);
      await channel.send({ embeds: [testEmbed] });
      
      console.log('[Discord] Test message sent successfully');
      return true;
    } catch (error) {
      console.error('[Discord] Test connection error:', error.message);
      return false;
    }
  }

  /**
   * Destroy client
   */
  async destroy() {
    if (this.client) {
      await this.client.destroy();
      console.log('[Discord] Client destroyed');
    }
  }
}

export default DiscordNotifier;
