import axios from 'axios';
import * as cheerio from 'cheerio';

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const THREADS_API_URL = 'https://graph.threads.net/v1.0/keyword_search';
const THREADS_QUERIES = ['Claude referral', 'Claude gift', 'Anthropic invite'];
const FEEDS = [
  {
    name: 'Google News',
    url: buildGoogleNewsUrl('Claude (referral OR invite OR "free pro")'),
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com/search.rss?q=Claude%20(referral%20OR%20' +
      'gift%20OR%20invite%20OR%20trial)&sort=new&t=week',
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com/search.rss?q=%22claude.ai%2Freferral%22&sort=new&t=week',
  },
];

export function extractReferralUrls(text) {
  const matches = String(text || '').match(
    /https?:\/\/(?:www\.)?claude\.ai\/referral\/[A-Za-z0-9_-]+/gi,
  );
  if (!matches) return [];
  return [...new Set(matches.map((url) => url.replace(/^http:/i, 'https:')))];
}

export function stripHtml(html) {
  if (!html) return '';
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function buildGoogleNewsUrl(query) {
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'en-US');
  url.searchParams.set('gl', 'US');
  url.searchParams.set('ceid', 'US:en');
  return url.href;
}

export function parseThreadsResponse(response, now = new Date()) {
  const cutoff = now.getTime() - MAX_AGE_MS;
  const posts = Array.isArray(response?.data) ? response.data : [];

  return posts.flatMap((post) => {
    const publishedAt = new Date(post.timestamp);
    const searchableText = post.text || '';
    if (!post.id || !post.permalink || !searchableText) return [];
    if (!/^https:\/\//i.test(post.permalink)) return [];
    if (Number.isNaN(publishedAt.getTime())) return [];
    if (publishedAt.getTime() < cutoff || publishedAt > now) return [];

    const referralUrls = extractReferralUrls(searchableText);
    if (referralUrls.length === 0) return [];

    return referralUrls.map((referralUrl) => ({
      id: referralUrl,
      title: `Threads post by @${post.username || 'unknown'}`,
      link: referralUrl,
      postLink: post.permalink,
      description: searchableText,
      date: publishedAt,
      source: 'public-search',
      sourceName: 'Threads',
      scrapedAt: now.toISOString(),
    }));
  });
}

export function parseRssFeed(xml, sourceName, now = new Date()) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const cutoff = now.getTime() - MAX_AGE_MS;
  const items = [];

  $('item, entry').each((_, element) => {
    const item = $(element);
    const title = item.find('title').first().text().trim();
    const linkElement = item.find('link').first();
    const link = linkElement.attr('href') || linkElement.text().trim();
    const publicationText = item.find('pubDate, published, updated').first().text();
    const publishedAt = new Date(publicationText);
    const description = item.find('description, summary, content').first().text().trim();

    if (!title || !link || Number.isNaN(publishedAt.getTime())) return;
    if (!/^https?:\/\//i.test(link)) return;
    if (publishedAt.getTime() < cutoff || publishedAt > now) return;

    // Cari link referral di teks mentah (href + plain text) sebelum tag dibuang
    const referralUrls = extractReferralUrls(`${title} ${description}`);
    if (referralUrls.length === 0) return;

    for (const referralUrl of referralUrls) {
      items.push({
        id: referralUrl,
        title,
        link: referralUrl,
        postLink: link,
        description: stripHtml(description) || null,
        date: publishedAt,
        source: 'public-search',
        sourceName,
        scrapedAt: now.toISOString(),
      });
    }
  });

  return items;
}

class PublicSearchRssScraper {
  constructor() {
    this.name = 'PublicSearchRssScraper';
    this.feeds = FEEDS;
    this.threadsToken = process.env.THREADS_ACCESS_TOKEN;
    this.http = axios.create({
      timeout: 15000,
      headers: { 'User-Agent': 'DiscordBansosMonitor/1.0' },
    });
  }

  async scrapeThreads(query) {
    try {
      const response = await this.http.get(THREADS_API_URL, {
        params: {
          access_token: this.threadsToken,
          q: query,
          search_type: 'RECENT',
          fields: 'id,text,permalink,timestamp,username',
          limit: 100,
        },
      });
      return parseThreadsResponse(response.data);
    } catch (error) {
      console.error(`[Threads] Search failed for "${query}": ${error.message}`);
      return [];
    }
  }

  async scrape() {
    const results = await Promise.all(this.feeds.map(async (feed) => {
      try {
        const response = await this.http.get(feed.url);
        return parseRssFeed(response.data, feed.name);
      } catch (error) {
        console.error(`[${feed.name}] RSS fetch failed: ${error.message}`);
        return [];
      }
    }));
    if (this.threadsToken) {
      const threadsResults = await Promise.all(
        THREADS_QUERIES.map((query) => this.scrapeThreads(query)),
      );
      results.push(...threadsResults);
    }
    const items = [...new Map(results.flat().map((item) => [item.link, item])).values()];
    return {
      success: true,
      items,
      scrapedAt: new Date().toISOString(),
      source: 'public-search',
    };
  }
}

export default PublicSearchRssScraper;
