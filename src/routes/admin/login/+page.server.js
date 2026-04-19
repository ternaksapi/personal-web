import { fail, redirect } from '@sveltejs/kit'
import {
    ADMIN_COOKIE_NAME,
    hasValidAdminSession,
    setAdminSession,
    validateAdminPassword
} from '$lib/server/admin'

export function load({ cookies }) {
    if (hasValidAdminSession(cookies.get(ADMIN_COOKIE_NAME))) {
        throw redirect(303, '/admin/reads')
    }
}

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData()
        const password = String(formData.get('password') ?? '')

        if (!validateAdminPassword(password)) {
            return fail(401, {
                error: 'Incorrect password.'
            })
        }

        setAdminSession(cookies)
        throw redirect(303, '/admin/reads')
    }
}
