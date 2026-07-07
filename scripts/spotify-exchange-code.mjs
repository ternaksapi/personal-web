import { readEnv, requiredEnv, upsertEnvValue } from './spotify-env.mjs';

const code = process.argv[2];

if (!code) {
    throw new Error('Usage: npm run spotify:exchange -- <code>');
}

const env = readEnv();
requiredEnv(env, ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET']);

const redirectUri = env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/spotify/callback';
const basicAuth = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri
});

const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
});

const data = await response.json().catch(() => ({}));

if (!response.ok || !data.refresh_token) {
    const details = data.error_description || data.error || `HTTP ${response.status}`;
    throw new Error(`Spotify code exchange failed: ${details}`);
}

upsertEnvValue('SPOTIFY_REFRESH_TOKEN', data.refresh_token);

console.log('spotify_exchange_status=success');
console.log(`spotify_scope=${data.scope || 'unknown'}`);
console.log('spotify_refresh_token_saved=true');
