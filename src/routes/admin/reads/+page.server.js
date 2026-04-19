import { fail, redirect } from '@sveltejs/kit'
import {
    clearAdminSession,
    createAdminSupabaseClient,
    normalizeTags,
    requireAdmin
} from '$lib/server/admin'

function getFormValues(formData) {
    return {
        title: String(formData.get('title') ?? '').trim(),
        author: String(formData.get('author') ?? '').trim(),
        url: String(formData.get('url') ?? '').trim(),
        description: String(formData.get('description') ?? '').trim(),
        category: String(formData.get('category') ?? '').trim(),
        tags: String(formData.get('tags') ?? '').trim(),
        readTime: String(formData.get('read_time') ?? '').trim(),
        favorite: formData.get('favorite') === 'on'
    }
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
    create: async ({ request, cookies }) => {
        requireAdmin(cookies)

        const formData = await request.formData()
        const values = getFormValues(formData)

        if (
            !values.title ||
            !values.author ||
            !values.url ||
            !values.description ||
            !values.category ||
            !values.readTime
        ) {
            return fail(400, {
                error: 'Title, author, URL, description, category, and read time are required.',
                values
            })
        }

        try {
            new URL(values.url)
        } catch {
            return fail(400, {
                error: 'URL must be a valid absolute link.',
                values
            })
        }

        try {
            const { error } = await createAdminSupabaseClient()
                .from('reads')
                .insert({
                    title: values.title,
                    author: values.author,
                    url: values.url,
                    description: values.description,
                    category: values.category,
                    tags: normalizeTags(values.tags),
                    read_time: values.readTime,
                    favorite: values.favorite,
                    date_added: new Date().toISOString()
                })

            if (error) {
                console.error('Error inserting read:', error)

                return fail(500, {
                    error: `Could not save this read entry: ${error.message}`,
                    values
                })
            }
        } catch (error) {
            console.error('Unexpected error inserting read:', error)

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
