export async function load({ fetch }) {
    try {
        // Fetch Medium RSS feed
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@yusufhaikall');
        const data = await response.json();

        if (data.status !== 'ok') {
            console.error('Error fetching Medium feed:', data.message);
            return { articles: [] };
        }

        // Transform the articles
        const articles = data.items.map(item => {
            // Extract first image from content if thumbnail is missing
            let image = item.thumbnail;
            if (!image || image === '') {
                const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
                image = imgMatch ? imgMatch[1] : '/placeholder-article.png';
            }

            // Calculate reading time (rough estimate: 200 words per minute)
            const wordCount = item.content?.split(/\s+/).length || 0;
            const readingTime = Math.max(1, Math.ceil(wordCount / 200));

            // Clean excerpt from HTML tags
            const excerpt = item.description
                ?.replace(/<[^>]*>/g, '')
                ?.substring(0, 200)
                ?.trim() + '...' || '';

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
        });

        return { articles };
    } catch (error) {
        console.error('Error fetching Medium articles:', error);
        return { articles: [] };
    }
}
