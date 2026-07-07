import { env } from '$env/dynamic/private'

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

function cleanString(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback
}

function limitWords(value, maxWords) {
    const words = cleanString(value).split(/\s+/).filter(Boolean)

    if (words.length <= maxWords) {
        return words.join(' ')
    }

    return `${words.slice(0, maxWords).join(' ')}...`
}

function parseJsonObject(text) {
    const raw = cleanString(text)

    if (!raw) {
        throw new Error('Gemini returned an empty response.')
    }

    try {
        return JSON.parse(raw)
    } catch {
        const jsonMatch = raw.match(/\{[\s\S]*\}/)

        if (!jsonMatch) {
            throw new Error('Gemini did not return JSON.')
        }

        return JSON.parse(jsonMatch[0])
    }
}

export function getSourceDomain(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '')
    } catch {
        return ''
    }
}

export function normalizeTopics(topicStringOrArray) {
    const topics = Array.isArray(topicStringOrArray)
        ? topicStringOrArray
        : cleanString(topicStringOrArray).split(',')

    return [...new Set(
        topics
            .map((topic) => cleanString(topic))
            .filter(Boolean)
            .slice(0, 3)
    )]
}

export function normalizeReadMetadata(metadata, articleUrl) {
    const topics = normalizeTopics(metadata?.topics)
    const sourceDomain = cleanString(metadata?.sourceDomain) || getSourceDomain(articleUrl)

    return {
        title: limitWords(metadata?.title, 18),
        author: limitWords(metadata?.author, 8) || sourceDomain || 'Unknown',
        description: limitWords(metadata?.description || metadata?.summary, 45),
        note: '',
        readTime: cleanString(metadata?.readTime) || '5 min read',
        topics,
        sourceDomain
    }
}

export async function suggestReadMetadata(articleUrl) {
    const apiKey = env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY

    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY.')
    }

    const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    const prompt = [
        'Read the public article URL and return concise metadata for a personal reading list.',
        'Return only a JSON object with these fields:',
        '{',
        '  "title": "article title",',
        '  "author": "author or publication if no author is clear",',
        '  "description": "one neutral summary sentence, max 35 words",',
        '  "topics": ["one", "two", "three"],',
        '  "readTime": "estimated read time like 8 min read",',
        '  "sourceDomain": "domain without www"',
        '}',
        'Use broad but useful topics. Do not invent claims. If a field is unclear, make the best conservative guess.',
        `URL: ${articleUrl}`
    ].join('\n')

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ],
            tools: [
                {
                    url_context: {}
                }
            ],
            generationConfig: {
                temperature: 0.2
            }
        })
    })

    const data = await response.json()

    if (!response.ok) {
        const message = data?.error?.message || `Gemini request failed with ${response.status}.`
        throw new Error(message)
    }

    const text = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        ?.join('\n')

    return normalizeReadMetadata(parseJsonObject(text), articleUrl)
}
