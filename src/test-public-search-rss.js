import assert from 'node:assert/strict';
import {
  parseRssFeed,
  parseThreadsResponse,
} from './scrapers/public-search-rss.js';

const now = new Date('2026-09-24T12:00:00.000Z');
const xml = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>Claude Pro referral gift link</title>
    <link>https://example.test/new</link>
    <pubDate>Wed, 23 Sep 2026 12:00:00 GMT</pubDate>
    <description>New invite for Claude</description>
  </item>
  <item>
    <title>Claude Pro trial invite</title>
    <link>https://example.test/old</link>
    <pubDate>Tue, 15 Sep 2026 12:00:00 GMT</pubDate>
    <description>Old referral</description>
  </item>
  <item>
    <title>Claude referral gift</title>
    <link>https://example.test/future</link>
    <pubDate>Fri, 25 Sep 2026 12:00:00 GMT</pubDate>
    <description>Future result</description>
  </item>
  <item>
    <title>Claude documentation update</title>
    <link>https://example.test/unrelated</link>
    <pubDate>Wed, 23 Sep 2026 12:00:00 GMT</pubDate>
    <description>API docs only</description>
  </item>
</channel></rss>`;

const items = parseRssFeed(xml, 'Test RSS', now);
assert.equal(items.length, 1);
assert.equal(items[0].link, 'https://example.test/new');
assert.equal(items[0].sourceName, 'Test RSS');

const atom = `<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Anthropic Claude invite trial</title>
    <link href="https://reddit.test/post" />
    <updated>Wed, 23 Sep 2026 11:00:00 GMT</updated>
    <summary>New gift referral link</summary>
  </entry>
</feed>`;
const atomItems = parseRssFeed(atom, 'Reddit', now);
assert.equal(atomItems.length, 1);
assert.equal(atomItems[0].link, 'https://reddit.test/post');

const threadsPosts = parseThreadsResponse({
  data: [
    {
      id: 'fresh',
      text: 'Claude Pro gift referral link',
      permalink: 'https://threads.net/@person/post/fresh',
      timestamp: '2026-09-23T11:00:00.000Z',
      username: 'person',
    },
    {
      id: 'old',
      text: 'Claude invite trial',
      permalink: 'https://threads.net/@person/post/old',
      timestamp: '2026-09-15T11:00:00.000Z',
      username: 'person',
    },
    {
      id: 'unrelated',
      text: 'Claude API documentation',
      permalink: 'https://threads.net/@person/post/unrelated',
      timestamp: '2026-09-23T11:00:00.000Z',
      username: 'person',
    },
  ],
}, now);
assert.equal(threadsPosts.length, 1);
assert.equal(threadsPosts[0].id, 'fresh');
assert.equal(threadsPosts[0].sourceName, 'Threads');
console.log('Public RSS and Threads filtering checks passed');
