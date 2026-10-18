import snapshot from '$lib/data/runs-public.json';
import { buildRunsPage } from '$lib/server/runs.js';

export function load({ setHeaders }) {
    setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=300' });
    return buildRunsPage(snapshot);
}
