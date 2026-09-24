import assert from 'node:assert/strict';
import {
  extractReferralUrls,
  parseRssFeed,
  parseThreadsResponse,
  stripHtml,
} from './scrapers/public-search-rss.js';

const now = new Date('2026-09-24T12:00:00.000Z');

assert.deepEqual(
  extractReferralUrls('claim at https://claude.ai/referral/UNsnvZJo6w now'),
  ['https://claude.ai/referral/UNsnvZJo6w'],
);
assert.deepEqual(
  extractReferralUrls('href="http://claude.ai/referral/abc123" and https://claude.ai/referral/abc123'),
  ['https://claude.ai/referral/abc123'],
);
assert.deepEqual(
  extractReferralUrls('claim https://claude.ai/referral/gZZ-9vPSCC before it is gone.'),
  ['https://claude.ai/referral/gZZ-9vPSCC'],
);
assert.deepEqual(extractReferralUrls('no link here, just referral talk'), []);
assert.equal(stripHtml('<div class="md"><p>Hi! I&#39;m sharing</p></div>'), "Hi! I'm sharing");

const xml = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>first to claim gets it</title>
    <link>https://reddit.test/r/ClaudeAI/post1</link>
    <pubDate>Wed, 23 Sep 2026 12:00:00 GMT</pubDate>
    <description>&lt;div class="md"&gt;&lt;p&gt;enjoy! &lt;a href="https://claude.ai/referral/UNsnvZJo6w"&gt;https://claude.ai/referral/UNsnvZJo6w&lt;/a&gt;&lt;/p&gt;&lt;/div&gt;</description>
  </item>
  <item>
    <title>Looking for a Claude referral link</title>
    <link>https://reddit.test/r/ClaudeAI/post2</link>
    <pubDate>Wed, 23 Sep 2026 12:00:00 GMT</pubDate>
    <description>Please DM me a referral or gift link</description>
  </item>
  <item>
    <title>Claude Pro trial invite</title>
    <link>https://example.test/old</link>
    <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate>
    <description>Old referral https://claude.ai/referral/oldcode1</description>
  </item>
  <item>
    <title>Claude referral gift</title>
    <link>https://example.test/future</link>
    <pubDate>Fri, 25 Sep 2026 12:00:00 GMT</pubDate>
    <description>Future result https://claude.ai/referral/futurecc</description>
  </item>
  <item>
    <title>I(M16) called my girlfriend a terrible word</title>
    <link>https://reddit.test/r/relationships/post3</link>
    <pubDate>Wed, 23 Sep 2026 12:00:00 GMT</pubDate>
    <description>Long relationship story, no referral link at all</description>
  </item>
</channel></rss>`;

const items = parseRssFeed(xml, 'Reddit', now);
assert.equal(items.length, 1);
assert.equal(items[0].link, 'https://claude.ai/referral/UNsnvZJo6w');
assert.equal(items[0].id, 'https://claude.ai/referral/UNsnvZJo6w');
assert.equal(items[0].postLink, 'https://reddit.test/r/ClaudeAI/post1');
assert.equal(items[0].description, 'enjoy! https://claude.ai/referral/UNsnvZJo6w');
assert.equal(items[0].sourceName, 'Reddit');

const atom = `<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Free week of Claude</title>
    <link href="https://reddit.test/post" />
    <updated>Wed, 23 Sep 2026 11:00:00 GMT</updated>
    <summary>grab it: https://claude.ai/referral/scJrEtQS9A</summary>
  </entry>
</feed>`;
const atomItems = parseRssFeed(atom, 'Reddit', now);
assert.equal(atomItems.length, 1);
assert.equal(atomItems[0].link, 'https://claude.ai/referral/scJrEtQS9A');
assert.equal(atomItems[0].postLink, 'https://reddit.test/post');

const threadsPosts = parseThreadsResponse({
  data: [
    {
      id: 'fresh',
      text: 'Claude Pro gift, claim https://claude.ai/referral/freshtok',
      permalink: 'https://threads.net/@person/post/fresh',
      timestamp: '2026-09-23T11:00:00.000Z',
      username: 'person',
    },
    {
      id: 'nolink',
      text: 'Claude invite trial, looking for one',
      permalink: 'https://threads.net/@person/post/nolink',
      timestamp: '2026-09-23T11:00:00.000Z',
      username: 'person',
    },
    {
      id: 'old',
      text: 'Claude invite https://claude.ai/referral/oldcode1',
      permalink: 'https://threads.net/@person/post/old',
      timestamp: '2026-09-15T11:00:00.000Z',
      username: 'person',
    },
  ],
}, now);
assert.equal(threadsPosts.length, 1);
assert.equal(threadsPosts[0].id, 'https://claude.ai/referral/freshtok');
assert.equal(threadsPosts[0].link, 'https://claude.ai/referral/freshtok');
assert.equal(threadsPosts[0].sourceName, 'Threads');

console.log('Public RSS and Threads referral-link checks passed');
