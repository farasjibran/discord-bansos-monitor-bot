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
    const embed = new EmbedBuilder()
      .setTitle(item.title)
      .setURL(item.link)
      .setColor(item.isHot ? 0xFF4500 : 0x0099FF) // Orange untuk "Hot", biru untuk normal
      .setTimestamp();

    // Add description jika ada
    if (item.description) {
      // Potong description jika terlalu panjang
      const maxLength = 300;
      const desc = item.description.length > maxLength 
        ? item.description.substring(0, maxLength) + '...'
        : item.description;
      embed.setDescription(desc);
    }

    // Add image jika ada
    if (item.image) {
      embed.setImage(item.image);
    }

    // Add fields
    const fields = [];

    if (item.dateText) {
      fields.push({
        name: '📅 Tanggal',
        value: item.dateText,
        inline: true
      });
    }

    if (item.views > 0) {
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

    if (fields.length > 0) {
      embed.addFields(fields);
    }

    // Footer
    embed.setFooter({ 
      text: 'AppVerse Bansos AI Monitor',
      iconURL: 'https://appverse.id/favicon.ico'
    });

    return embed;
  }

  /**
   * Kirim notifikasi untuk multiple items
   * @param {Array} items 
   */
  async sendBulkNotifications(items) {
    console.log(`[Discord] Sending ${items.length} notifications...`);
    
    const results = {
      success: 0,
      failed: 0
    };

    for (const item of items) {
      const success = await this.sendNotification(item);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }

      // Delay untuk menghindari rate limit (2 detik antar message)
      if (items.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[Discord] Bulk send completed: ${results.success} success, ${results.failed} failed`);
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
