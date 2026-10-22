import test from 'node:test';
import assert from 'node:assert/strict';
import { XMLParser } from 'fast-xml-parser';
import { parseMediumFeed, transformArticle } from './medium-feed.js';
import { _fetchMediumArticles } from './+page.server.js';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: true,
    isArray: name => name === 'item' || name === 'category'
});

const sampleFeed = `<?xml version="1.0"?><rss><channel><item>
    <title>Example article</title>
    <link>https://medium.com/@author/example</link>
    <pubDate>Sat, 01 Jun 2024 12:00:00 GMT</pubDate>
    <category>engineering</category><category>web</category>
    <content:encoded><![CDATA[<p>A useful article about Svelte.</p><figure><img src="https://cdn.example.com/cover.png" /></figure>]]></content:encoded>
</item></channel></rss>`;

test('fetches and parses Medium RSS into the Writes article shape', async () => {
    let requestedUrl;
    let responseMethod = '';
    const articles = await _fetchMediumArticles(async url => {
        requestedUrl = url;
        return {
            ok: true,
            text: async () => {
                responseMethod = 'text';
                return sampleFeed;
            }
        };
    }, 'https://medium.example/feed');

    assert.equal(requestedUrl, 'https://medium.example/feed');
    assert.equal(responseMethod, 'text');
    assert.equal(articles.length, 1);
    assert.equal(articles[0].title, 'Example article');
    assert.equal(articles[0].href, 'https://medium.com/@author/example');
    assert.equal(articles[0].image, 'https://cdn.example.com/cover.png');
    assert.match(articles[0].excerpt, /A useful article about Svelte/);
    assert.equal(articles[0].date, 'Jun 1, 2024');
    assert.deepEqual(articles[0].categories, ['engineering', 'web']);
});

test('returns an empty list for a valid feed with no items', () => {
    assert.deepEqual(parseMediumFeed('<rss><channel><title>Empty</title></channel></rss>', parser), []);
});

test('rejects non-RSS or malformed feed responses', () => {
    assert.throws(() => parseMediumFeed('<html>blocked</html>', parser), /unexpected format/);
    assert.throws(() => parseMediumFeed('<rss><channel>', parser), /unexpected format|could not be parsed/);
});

test('reports HTTP errors from the Medium feed', async () => {
    await assert.rejects(
        _fetchMediumArticles(async () => ({ ok: false, status: 503 }), 'https://medium.example/feed'),
        /Medium feed request failed with status 503/
    );
});

test('falls back to a placeholder image when the article has no image', () => {
    const article = transformArticle({
        title: 'Text only',
        link: 'https://medium.com/@author/text-only',
        pubDate: 'Sat, 01 Jun 2024 12:00:00 GMT',
        'content:encoded': '<p>Just text.</p>',
        category: []
    });
    assert.equal(article.image, '/laptop placeholder.png');
});
