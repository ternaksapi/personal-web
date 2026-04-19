import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { redirect } from '@sveltejs/kit'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE_NAME = 'admin_session'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

function getRequiredEnv(name) {
    const value = env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

function signPayload(payload) {
    return createHmac('sha256', getRequiredEnv('SESSION_SECRET'))
        .update(payload)
        .digest('base64url')
}

function safeCompare(left, right) {
    const leftBuffer = Buffer.from(left, 'utf8')
    const rightBuffer = Buffer.from(right, 'utf8')

    if (leftBuffer.length !== rightBuffer.length) {
        return false
    }

    return timingSafeEqual(leftBuffer, rightBuffer)
}

export function createAdminSessionValue() {
    const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000
    const payload = `admin:${expiresAt}`

    return `${payload}.${signPayload(payload)}`
}

export function hasValidAdminSession(sessionValue) {
    if (!sessionValue) {
        return false
    }

    const separatorIndex = sessionValue.lastIndexOf('.')

    if (separatorIndex === -1) {
        return false
    }

    const payload = sessionValue.slice(0, separatorIndex)
    const signature = sessionValue.slice(separatorIndex + 1)
    const expectedSignature = signPayload(payload)

    if (!safeCompare(signature, expectedSignature)) {
        return false
    }

    const [scope, expiresAt] = payload.split(':')
    const expiresAtMs = Number(expiresAt)

    if (scope !== 'admin' || !Number.isFinite(expiresAtMs)) {
        return false
    }

    return expiresAtMs > Date.now()
}

export function getAdminCookieOptions() {
    return {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: !dev,
        maxAge: SESSION_TTL_SECONDS
    }
}

export function setAdminSession(cookies) {
    cookies.set(
        ADMIN_COOKIE_NAME,
        createAdminSessionValue(),
        getAdminCookieOptions()
    )
}

export function clearAdminSession(cookies) {
    cookies.delete(ADMIN_COOKIE_NAME, getAdminCookieOptions())
}

export function requireAdmin(cookies) {
    if (!hasValidAdminSession(cookies.get(ADMIN_COOKIE_NAME))) {
        throw redirect(303, '/admin/login')
    }
}

export function validateAdminPassword(password) {
    return safeCompare(password, getRequiredEnv('ADMIN_PASSWORD'))
}

export function createAdminSupabaseClient() {
    const supabaseUrl = env.SUPABASE_URL || PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
        throw new Error(
            'Missing required environment variable: SUPABASE_URL or PUBLIC_SUPABASE_URL'
        )
    }

    return createClient(supabaseUrl, getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
}

export function normalizeTags(tagString) {
    return [...new Set(
        tagString
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
    )]
}
