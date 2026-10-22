const FALLBACK_IMAGE = '/laptop placeholder.png';
const CONTENT_TAGS = /<[^>]*>/g;
const IMAGE_SOURCE = /<img\b[^>]*\bsrc=["']([^"']+)["']/i;

function stripHtml(html = '') {
    return html.replace(CONTENT_TAGS, ' ').replace(/\s+/g, ' ').trim();
}

export function transformArticle(item) {
    const content = item['content:encoded'] || item.content || '';
    const imageMatch = content.match(IMAGE_SOURCE);
    const image = imageMatch?.[1] || item.thumbnail || FALLBACK_IMAGE;
    const plainContent = stripHtml(content);
    const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;
    const excerpt = plainContent
        ? `${plainContent.substring(0, 200)}${plainContent.length > 200 ? '...' : ''}`
        : '';
    const pubDate = item.pubDate || item['dc:date'] || '';
    const timestamp = Date.parse(pubDate);
    const date = Number.isNaN(timestamp)
        ? ''
        : new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });

    return {
        title: item.title || 'Untitled article',
        excerpt,
        image,
        href: item.link || item.guid || '#',
        date,
        readTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
        categories: Array.isArray(item.category)
            ? item.category
            : item.category ? [item.category] : []
    };
}

export function parseMediumFeed(xml, parser) {
    let feed;
    try {
        feed = parser.parse(xml);
    } catch {
        throw new Error('Medium feed could not be parsed');
    }
    const channel = feed?.rss?.channel || feed?.feed;
    if (!channel) throw new Error('Medium feed returned an unexpected format');
    const items = channel.item || channel.entry || [];
    return (Array.isArray(items) ? items : [items]).map(transformArticle);
}
