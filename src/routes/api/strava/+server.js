import { json } from '@sveltejs/kit';
import snapshot from '$lib/data/runs-public.json';
import { buildRunsPage } from '$lib/server/runs.js';

// Retain the existing endpoint for clients, using imported data instead of Strava's API.
export function GET() {
    return json(buildRunsPage(snapshot), {
        headers: { 'cache-control': 'public, max-age=0, s-maxage=300' }
    });
}
