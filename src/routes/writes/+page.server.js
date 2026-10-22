import { XMLParser } from 'fast-xml-parser';
import { parseMediumFeed } from './medium-feed.js';

const MEDIUM_FEED_URL = 'https://medium.com/feed/@yusufhaikall';
const ARTICLE_CACHE_TTL_MS = 60 * 60 * 1000;
const ARTICLE_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';
const feedParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: true,
    isArray: name => name === 'item' || name === 'category'
});

let cachedArticles = null;
let cacheExpiresAt = 0;
let inFlightArticles = null;

export async function _fetchMediumArticles(requestFetch, url = MEDIUM_FEED_URL) {
    const response = await requestFetch(url);

    if (!response.ok) {
        throw new Error(`Medium feed request failed with status ${response.status}`);
    }

    const xml = await response.text();
    return parseMediumFeed(xml, feedParser);
}

async function getArticles(requestFetch) {
    if (cachedArticles && Date.now() < cacheExpiresAt) {
        return cachedArticles;
    }

    if (!inFlightArticles) {
        inFlightArticles = _fetchMediumArticles(requestFetch)
            .then(articles => {
                cachedArticles = articles;
                cacheExpiresAt = Date.now() + ARTICLE_CACHE_TTL_MS;
                return articles;
            })
            .finally(() => {
                inFlightArticles = null;
            });
    }

    return inFlightArticles;
}

export async function load({ fetch, setHeaders }) {
    setHeaders({
        'cache-control': ARTICLE_CACHE_CONTROL
    });

    try {
        return {
            articles: await getArticles(fetch)
        };
    } catch (error) {
        console.error('Error fetching Medium articles:', error);

        return {
            articles: cachedArticles || []
        };
    }
}
