import { readEnv, requiredEnv } from './spotify-env.mjs';

const env = readEnv();
requiredEnv(env, ['SPOTIFY_CLIENT_ID']);

const redirectUri = env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/spotify/callback';
const scopes = [
    'user-top-read',
    'user-read-recently-played'
];

const url = new URL('https://accounts.spotify.com/authorize');
url.searchParams.set('client_id', env.SPOTIFY_CLIENT_ID);
url.searchParams.set('response_type', 'code');
url.searchParams.set('redirect_uri', redirectUri);
url.searchParams.set('scope', scopes.join(' '));
url.searchParams.set('show_dialog', 'true');

console.log(url.toString());
