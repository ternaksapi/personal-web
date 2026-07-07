import { fail, redirect } from '@sveltejs/kit'
import {
    clearAdminSession,
    createAdminSupabaseClient,
    requireAdmin
} from '$lib/server/admin'
import {
    getSourceDomain,
    normalizeTopics,
    suggestReadMetadata
} from '$lib/server/readMetadata'

function getFormValues(formData) {
    const url = String(formData.get('url') ?? '').trim()

    return {
        title: String(formData.get('title') ?? '').trim(),
        author: String(formData.get('author') ?? '').trim(),
        url,
        description: String(formData.get('description') ?? '').trim(),
        note: String(formData.get('note') ?? '').trim(),
        topics: String(formData.get('topics') ?? '').trim(),
        readTime: String(formData.get('read_time') ?? '').trim(),
        sourceDomain: String(formData.get('source_domain') ?? '').trim() || getSourceDomain(url),
        favorite: formData.get('favorite') === 'on'
    }
}

function valuesFromSuggestion(url, suggestion) {
    return {
        title: suggestion.title,
        author: suggestion.author,
        url,
        description: suggestion.description,
        note: '',
        topics: suggestion.topics.join(', '),
        readTime: suggestion.readTime,
        sourceDomain: suggestion.sourceDomain,
        favorite: false
    }
}

function validateUrl(url) {
    try {
        return new URL(url)
    } catch {
        return null
    }
}

function isMissingMetadataColumn(error) {
    const message = [
        error?.message,
        error?.details,
        error?.hint
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

    return (
        error?.code === 'PGRST204' &&
        (message.includes('note') || message.includes('source_domain'))
    ) || (
        message.includes("could not find the 'note' column") ||
        message.includes("could not find the 'source_domain' column")
    )
}

function metadataMigrationError(values, editId = null) {
    return fail(500, {
        error: 'The reads table is missing the new note/source_domain columns. Run supabase/reads_metadata.sql in Supabase, then retry. If you just ran it, wait a moment for Supabase schema cache to refresh.',
        values,
        editId
    })
}

export async function load({ cookies }) {
    requireAdmin(cookies)

    const { data: reads, error } = await createAdminSupabaseClient()
        .from('reads')
        .select('*')
        .order('date_added', { ascending: false })
        .limit(12)

    if (error) {
        console.error('Error fetching reads for admin:', error)

        return {
            reads: [],
            loadError: 'Could not load recent entries from Supabase.'
        }
    }

    return {
        reads: reads || [],
        loadError: null
    }
}

export const actions = {
    suggest: async ({ request, cookies }) => {
        requireAdmin(cookies)

        const formData = await request.formData()
        const url = String(formData.get('url') ?? '').trim()

        if (!url || !validateUrl(url)) {
            return fail(400, {
                error: 'Paste a valid absolute URL before generating metadata.',
                values: { url }
            })
        }

        try {
            const suggestion = await suggestReadMetadata(url)

            return {
                success: 'Generated a draft. Review it before saving.',
                values: valuesFromSuggestion(url, suggestion),
                suggestion
            }
        } catch (error) {
            console.error('Error generating read metadata:', error)

            return fail(500, {
                error: error instanceof Error
                    ? error.message
                    : 'Could not generate metadata for this URL.',
                values: {
                    url,
                    sourceDomain: getSourceDomain(url)
                }
            })
        }
    },

    create: async ({ request, cookies }) => {
        requireAdmin(cookies)

        const formData = await request.formData()
        const values = getFormValues(formData)
        const topics = normalizeTopics(values.topics)

        if (
            !values.title ||
            !values.author ||
            !values.url ||
            !values.description ||
            !values.readTime
        ) {
            return fail(400, {
                error: 'Title, author, URL, summary, and read time are required.',
                values
            })
        }

        if (!validateUrl(values.url)) {
            return fail(400, {
                error: 'URL must be a valid absolute link.',
                values
            })
        }

        try {
            const category = topics[0] || 'Reading'

            const { error } = await createAdminSupabaseClient()
                .from('reads')
                .insert({
                    title: values.title,
                    author: values.author,
                    url: values.url,
                    description: values.description,
                    note: values.note || null,
                    source_domain: values.sourceDomain || getSourceDomain(values.url),
                    category,
                    tags: topics,
                    read_time: values.readTime,
                    favorite: values.favorite,
                    date_added: new Date().toISOString()
                })

            if (error) {
                console.error('Error inserting read:', error)

                if (isMissingMetadataColumn(error)) {
                    return metadataMigrationError(values)
                }

                return fail(500, {
                    error: `Could not save this read entry: ${error.message}`,
                    values
                })
            }
        } catch (error) {
            console.error('Unexpected error inserting read:', error)

            if (isMissingMetadataColumn(error)) {
                return metadataMigrationError(values)
            }

            return fail(500, {
                error: error instanceof Error
                    ? error.message
                    : 'Unexpected server error while saving this read entry.',
                values
            })
        }

        return {
            success: `Added "${values.title}" to the reading list.`
        }
    },

    update: async ({ request, cookies }) => {
        requireAdmin(cookies)

        const formData = await request.formData()
        const id = String(formData.get('id') ?? '').trim()
        const values = getFormValues(formData)
        const topics = normalizeTopics(values.topics)

        if (!id) {
            return fail(400, {
                error: 'Missing read entry id.',
                values,
                editId: id
            })
        }

        if (
            !values.title ||
            !values.author ||
            !values.url ||
            !values.description ||
            !values.readTime
        ) {
            return fail(400, {
                error: 'Title, author, URL, summary, and read time are required.',
                values,
                editId: id
            })
        }

        if (!validateUrl(values.url)) {
            return fail(400, {
                error: 'URL must be a valid absolute link.',
                values,
                editId: id
            })
        }

        try {
            const category = topics[0] || 'Reading'

            const { error } = await createAdminSupabaseClient()
                .from('reads')
                .update({
                    title: values.title,
                    author: values.author,
                    url: values.url,
                    description: values.description,
                    note: values.note || null,
                    source_domain: values.sourceDomain || getSourceDomain(values.url),
                    category,
                    tags: topics,
                    read_time: values.readTime,
                    favorite: values.favorite
                })
                .eq('id', id)

            if (error) {
                console.error('Error updating read:', error)

                if (isMissingMetadataColumn(error)) {
                    return metadataMigrationError(values, id)
                }

                return fail(500, {
                    error: `Could not update this read entry: ${error.message}`,
                    values,
                    editId: id
                })
            }
        } catch (error) {
            console.error('Unexpected error updating read:', error)

            if (isMissingMetadataColumn(error)) {
                return metadataMigrationError(values, id)
            }

            return fail(500, {
                error: error instanceof Error
                    ? error.message
                    : 'Unexpected server error while updating this read entry.',
                values,
                editId: id
            })
        }

        return {
            success: `Updated "${values.title}".`
        }
    },

    delete: async ({ request, cookies }) => {
        requireAdmin(cookies)

        const formData = await request.formData()
        const id = String(formData.get('id') ?? '').trim()
        const title = String(formData.get('title') ?? '').trim()

        if (!id) {
            return fail(400, {
                error: 'Missing read entry id.'
            })
        }

        try {
            const { error } = await createAdminSupabaseClient()
                .from('reads')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting read:', error)

                return fail(500, {
                    error: `Could not delete this read entry: ${error.message}`
                })
            }
        } catch (error) {
            console.error('Unexpected error deleting read:', error)

            return fail(500, {
                error: error instanceof Error
                    ? error.message
                    : 'Unexpected server error while deleting this read entry.'
            })
        }

        return {
            success: title
                ? `Deleted "${title}" from the reading list.`
                : 'Deleted the read entry.'
        }
    },

    logout: async ({ cookies }) => {
        clearAdminSession(cookies)
        throw redirect(303, '/admin/login')
    }
}
