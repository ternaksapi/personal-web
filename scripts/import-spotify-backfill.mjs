import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { readEnv, requiredEnv } from './spotify-env.mjs';

const folder = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
const apply = process.argv.includes('--apply');
const after = new Date('2026-07-24T02:34:53.000Z');
const cachePath = path.join(process.env.TEMP || process.env.TMP || '.', 'spotify-track-metadata-cache.json');
const env = readEnv();

if (!folder || !fs.existsSync(folder)) {
    throw new Error('Pass the Spotify Extended Streaming History folder as the first argument.');
}

if (apply) requiredEnv(env, ['PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function audioRows() {
    const files = fs.readdirSync(folder)
        .filter((name) => /^Streaming_History_Audio_2026(?:_\d+)?\.json$/.test(name))
        .sort();

    return files.flatMap((name) =>
        JSON.parse(fs.readFileSync(path.join(folder, name), 'utf8'))
    ).filter((row) =>
        row.master_metadata_track_name &&
        row.master_metadata_album_artist_name &&
        row.spotify_track_uri?.startsWith('spotify:track:') &&
        new Date(row.ts) > after
    );
}

async function spotifyThumbnail(trackId) {
    const url = new URL('https://open.spotify.com/oembed');
    url.searchParams.set('url', `https://open.spotify.com/track/${trackId}`);

    for (let attempt = 1; attempt <= 4; attempt += 1) {
        const response = await fetch(url);

        if (response.status === 429 || response.status >= 500) {
            await sleep(attempt * 750);
            continue;
        }

        if (!response.ok) return '';
        const data = await response.json().catch(() => ({}));
        return data.thumbnail_url || '';
    }

    return '';
}

async function mapConcurrent(items, concurrency, worker) {
    const results = new Array(items.length);
    let next = 0;

    async function run() {
        while (next < items.length) {
            const index = next;
            next += 1;
            results[index] = await worker(items[index], index);
        }
    }

    await Promise.all(Array.from({ length: concurrency }, run));
    return results;
}

function eventId(row) {
    return crypto.createHash('sha256')
        .update(`${row.ts}\0${row.spotify_track_uri}\0${row.ms_played}`)
        .digest('hex');
}

const rows = audioRows();
const metadata = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    : {};
const acceptedRows = rows.filter((row) => Number(row.ms_played || 0) >= 80_000);
const albumKey = (row) => `${row.master_metadata_album_artist_name}\0${row.master_metadata_album_album_name || ''}`;
const albumGroups = new Map();

for (const row of acceptedRows) {
    const key = albumKey(row);
    const group = albumGroups.get(key) || { plays: 0, rows: [] };
    group.plays += 1;
    group.rows.push(row);
    albumGroups.set(key, group);
}

const topAlbumGroups = [...albumGroups.entries()]
    .sort((a, b) => b[1].plays - a[1].plays)
    .slice(0, 120);
const albumImages = new Map();

await mapConcurrent(topAlbumGroups, 5, async ([key, group], index) => {
    const cachedImage = group.rows
        .map((row) => metadata[row.spotify_track_uri.split(':').at(-1)]?.imageUrl)
        .find(Boolean);
    const representativeId = group.rows[0].spotify_track_uri.split(':').at(-1);
    albumImages.set(key, cachedImage || await spotifyThumbnail(representativeId));

    if ((index + 1) % 30 === 0 || index + 1 === topAlbumGroups.length) {
        console.log(`album_images_resolved=${index + 1}/${topAlbumGroups.length}`);
    }
});

const events = acceptedRows.map((row) => {

    return {
        id: eventId(row),
        played_at: new Date(new Date(row.ts).getTime() - Number(row.ms_played || 0)).toISOString(),
        track_name: row.master_metadata_track_name,
        artist_name: row.master_metadata_album_artist_name,
        album_name: row.master_metadata_album_album_name || '',
        spotify_track_uri: row.spotify_track_uri,
        image_url: albumImages.get(albumKey(row)) || ''
    };
});

const monthCounts = {};
for (const event of events) {
    const month = event.played_at.slice(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
}

console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    after: after.toISOString(),
    sourceRows: rows.length,
    qualification: 'played at least 80 seconds (calibrated against Last.fm history)',
    acceptedEvents: events.length,
    monthCounts
}, null, 2));

if (apply) {
    const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    for (let offset = 0; offset < events.length; offset += 500) {
        const { error } = await supabase
            .from('listens_backfill_events')
            .upsert(events.slice(offset, offset + 500), { onConflict: 'id' });

        if (error) throw new Error(`Backfill upsert failed: ${error.message}`);
        console.log(`supabase_events_upserted=${Math.min(offset + 500, events.length)}/${events.length}`);
    }
}
