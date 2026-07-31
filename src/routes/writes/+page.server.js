const MEDIUM_FEED_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@yusufhaikall';
const ARTICLE_CACHE_TTL_MS = 60 * 60 * 1000;
const ARTICLE_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

let cachedArticles = null;
let cacheExpiresAt = 0;
let inFlightArticles = null;

function transformArticle(item) {
    let image = item.thumbnail;

    if (!image) {
        const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
        image = imgMatch ? imgMatch[1] : '/laptop placeholder.png';
    }

    const wordCount = item.content?.split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const cleanDescription = item.description
        ?.replace(/<[^>]*>/g, '')
        ?.trim() || '';
    const excerpt = cleanDescription
        ? `${cleanDescription.substring(0, 200)}${cleanDescription.length > 200 ? '...' : ''}`
        : '';

    return {
        title: item.title,
        excerpt,
        image,
        href: item.link,
        date: new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        readTime: `${readingTime} min read`,
        categories: item.categories || []
    };
}

async function fetchArticles(requestFetch) {
    const response = await requestFetch(MEDIUM_FEED_URL);

    if (!response.ok) {
        throw new Error(`Medium feed request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'ok' || !Array.isArray(data.items)) {
        throw new Error(data.message || 'Medium feed returned an unexpected response');
    }

    return data.items.map(transformArticle);
}

async function getArticles(requestFetch) {
    if (cachedArticles && Date.now() < cacheExpiresAt) {
        return cachedArticles;
    }

    if (!inFlightArticles) {
        inFlightArticles = fetchArticles(requestFetch)
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
