import fs from 'node:fs';
import path from 'node:path';
import { readEnv, requiredEnv } from './spotify-env.mjs';

const outputPath = path.resolve('src/lib/data/spotifyAlbums.json');
const env = readEnv();
requiredEnv(env, ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN']);

const basicAuth = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
const hasLastfm = Boolean(env.LASTFM_API_KEY && env.LASTFM_USERNAME);
const albumWallLimit = positiveInteger(env.LASTFM_ALBUM_WALL_LIMIT, 120);

function positiveInteger(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

async function getAccessToken() {
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: env.SPOTIFY_REFRESH_TOKEN
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

    if (!response.ok || !data.access_token) {
        const details = data.error_description || data.error || `HTTP ${response.status}`;
        throw new Error(`Spotify token refresh failed: ${details}`);
    }

    return data.access_token;
}

async function spotifyGet(accessToken, pathName, params = {}) {
    const url = new URL(`https://api.spotify.com/v1${pathName}`);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (response.status === 403) {
        return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const details = data.error?.message || data.error || `HTTP ${response.status}`;
        throw new Error(`Spotify API request failed for ${pathName}: ${details}`);
    }

    return data;
}

function pickImage(album) {
    const images = album?.images || [];
    return images.find((image) => image.width >= 300) || images[0] || null;
}

function pickLastfmImage(images = []) {
    const preferred = ['extralarge', 'large', 'medium'];

    for (const size of preferred) {
        const image = images.find((item) => item.size === size && item['#text']);
        if (image) return image['#text'];
    }

    return images.find((item) => item['#text'])?.['#text'] || '';
}

function ensureAlbum(albums, album, defaults = {}) {
    if (!album?.id) return null;

    const image = pickImage(album);
    if (!image?.url) return null;

    if (!albums.has(album.id)) {
        albums.set(album.id, {
            albumId: album.id,
            albumName: album.name,
            artists: (album.artists || []).map((artist) => artist.name),
            imageUrl: image.url,
            imageWidth: image.width,
            imageHeight: image.height,
            spotifyUrl: album.external_urls?.spotify || '',
            releaseDate: album.release_date || '',
            albumType: album.album_type || '',
            timeRanges: [],
            topTracks: [],
            recentPlayCount: 0,
            lastPlayedAt: null,
            score: 0,
            ...defaults
        });
    }

    return albums.get(album.id);
}

async function addTopTracks(accessToken, albums) {
    const ranges = [
        { key: 'short_term', weight: 180 },
        { key: 'medium_term', weight: 100 },
        { key: 'long_term', weight: 55 }
    ];

    for (const range of ranges) {
        const data = await spotifyGet(accessToken, '/me/top/tracks', {
            time_range: range.key,
            limit: '50'
        });

        if (!data?.items) continue;

        data.items.forEach((track, index) => {
            const album = ensureAlbum(albums, track.album);
            if (!album) return;

            if (!album.timeRanges.includes(range.key)) {
                album.timeRanges.push(range.key);
            }

            album.topTracks.push({
                trackName: track.name,
                rank: index + 1,
                timeRange: range.key
            });
            album.score += Math.max(range.weight - index, 1);
        });
    }
}

async function addRecentlyPlayed(accessToken, albums) {
    const data = await spotifyGet(accessToken, '/me/player/recently-played', {
        limit: '50'
    });

    if (!data?.items) return;

    data.items.forEach((item, index) => {
        const album = ensureAlbum(albums, item.track?.album);
        if (!album) return;

        album.recentPlayCount += 1;
        album.score += Math.max(45 - index, 1);

        if (!album.lastPlayedAt || new Date(item.played_at) > new Date(album.lastPlayedAt)) {
            album.lastPlayedAt = item.played_at;
        }
    });
}

function cleanAlbum(album) {
    const { score, ...publicAlbum } = album;
    publicAlbum.timeRanges.sort();
    publicAlbum.topTracks = publicAlbum.topTracks.slice(0, 3);
    publicAlbum.lastfmTopTracks = (publicAlbum.lastfmTopTracks || []).slice(0, 4);
    return publicAlbum;
}

function textValue(value) {
    if (typeof value === 'string') return value;
    return value?.['#text'] || '';
}

function normalizeKey(...parts) {
    return parts
        .map((part) => normalizeText(part))
        .join('::');
}

function normalizeText(part) {
    return String(part || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function albumIdentityKey(album) {
    return normalizeKey(album.artists?.[0], album.albumName);
}

function monthWindow(now = new Date()) {
    return {
        start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
        end: now
    };
}

function yearWindow(now = new Date()) {
    return {
        start: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
        end: now
    };
}

async function lastfmGet(params) {
    const url = new URL('https://ws.audioscrobbler.com/2.0/');

    url.searchParams.set('api_key', env.LASTFM_API_KEY);
    url.searchParams.set('user', env.LASTFM_USERNAME);
    url.searchParams.set('format', 'json');

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.error) {
        const details = data.message || data.error || `HTTP ${response.status}`;
        throw new Error(`Last.fm request failed: ${details}`);
    }

    return data;
}

async function fetchLastfmScrobbles({ start, end, maxPages }) {
    const from = Math.floor(start.getTime() / 1000);
    const to = Math.floor(end.getTime() / 1000);
    const tracks = [];
    let page = 1;
    let totalPages = 1;

    do {
        const data = await lastfmGet({
            method: 'user.getrecenttracks',
            from: String(from),
            to: String(to),
            limit: '200',
            page: String(page)
        });

        const recentTracks = data.recenttracks?.track || [];
        const items = Array.isArray(recentTracks) ? recentTracks : [recentTracks];
        const attrs = data.recenttracks?.['@attr'] || {};

        totalPages = Math.max(1, Number(attrs.totalPages || 1));

        for (const item of items) {
            const playedAt = Number(item.date?.uts || 0);
            if (!playedAt) continue;

            tracks.push({
                trackName: item.name || '',
                artistName: textValue(item.artist),
                albumName: textValue(item.album),
                imageUrl: pickLastfmImage(item.image || []),
                playedAt: new Date(playedAt * 1000).toISOString()
            });
        }

        page += 1;
    } while (page <= totalPages && page <= maxPages);

    return {
        start,
        end,
        tracks
    };
}

function tracksBetween(tracks, start, end) {
    const startTime = start.getTime();
    const endTime = end.getTime();

    return tracks.filter((track) => {
        const playedAt = new Date(track.playedAt).getTime();
        return playedAt >= startTime && playedAt <= endTime;
    });
}

function rankedCounts(items, keyFor, valueFor) {
    const counts = new Map();

    for (const item of items) {
        const key = keyFor(item);
        if (!key) continue;

        if (!counts.has(key)) {
            counts.set(key, {
                ...valueFor(item),
                scrobbles: 0
            });
        }

        counts.get(key).scrobbles += 1;
    }

    return [...counts.values()]
        .sort((a, b) => b.scrobbles - a.scrobbles || JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function buildListeningStats({ start, end, tracks, period, periodLabel }) {
    const uniqueTrackKeys = new Set();
    const uniqueArtistKeys = new Set();
    const uniqueAlbumKeys = new Set();

    for (const track of tracks) {
        uniqueTrackKeys.add(normalizeKey(track.artistName, track.trackName));
        uniqueArtistKeys.add(normalizeKey(track.artistName));

        if (track.albumName) {
            uniqueAlbumKeys.add(normalizeKey(track.artistName, track.albumName));
        }
    }

    const topArtists = rankedCounts(
        tracks,
        (track) => normalizeKey(track.artistName),
        (track) => ({ artistName: track.artistName })
    );
    const topTracks = rankedCounts(
        tracks,
        (track) => normalizeKey(track.artistName, track.trackName),
        (track) => ({
            trackName: track.trackName,
            artistName: track.artistName,
            albumName: track.albumName
        })
    );
    const topAlbums = rankedCounts(
        tracks.filter((track) => track.albumName),
        (track) => normalizeKey(track.artistName, track.albumName),
        (track) => ({
            albumName: track.albumName,
            artistName: track.artistName,
            imageUrl: track.imageUrl
        })
    ).map((album) => {
        const albumTracks = tracks.filter((track) =>
            normalizeKey(track.artistName, track.albumName) === normalizeKey(album.artistName, album.albumName)
        );

        return {
            ...album,
            imageUrl: album.imageUrl || albumTracks.find((track) => track.imageUrl)?.imageUrl || '',
            topTracks: rankedCounts(
                albumTracks,
                (track) => normalizeKey(track.artistName, track.trackName),
                (track) => ({
                    trackName: track.trackName,
                    artistName: track.artistName
                })
            ).slice(0, 4)
        };
    });

    return {
        source: 'lastfm',
        period,
        periodLabel,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        scrobbles: tracks.length,
        tracks: uniqueTrackKeys.size,
        artists: uniqueArtistKeys.size,
        albums: uniqueAlbumKeys.size,
        topArtist: topArtists[0] || null,
        topTrack: topTracks[0] || null,
        topAlbum: topAlbums[0] || null,
        topArtists: topArtists.slice(0, 5),
        topTracks: topTracks.slice(0, 5),
        topAlbums: topAlbums.slice(0, 120)
    };
}

function buildMonthlyScrobbles(tracks, year, currentMonthIndex) {
    const months = [];

    for (let month = 0; month <= currentMonthIndex; month += 1) {
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = month === currentMonthIndex
            ? new Date()
            : new Date(year, month + 1, 0, 23, 59, 59, 999);
        const monthTracks = tracksBetween(tracks, start, end);

        months.push({
            month,
            label: start.toLocaleString('en-US', { month: 'short' }),
            scrobbles: monthTracks.length
        });
    }

    const maxScrobbles = Math.max(...months.map((month) => month.scrobbles), 1);

    return months.map((month) => ({
        ...month,
        intensity: Math.max(0.08, month.scrobbles / maxScrobbles)
    }));
}

async function getLastfmStats() {
    const now = new Date();
    const currentMonth = monthWindow(now);
    const currentYear = yearWindow(now);
    const yearData = await fetchLastfmScrobbles({
        ...currentYear,
        maxPages: Number(env.LASTFM_YEAR_MAX_PAGES || env.LASTFM_MAX_PAGES || 80)
    });
    const monthTracks = tracksBetween(yearData.tracks, currentMonth.start, currentMonth.end);
    const monthStats = buildListeningStats({
        ...currentMonth,
        tracks: monthTracks,
        period: 'current_month',
        periodLabel: currentMonth.start.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    });
    const yearStats = buildListeningStats({
        ...currentYear,
        tracks: yearData.tracks,
        period: 'year_to_date',
        periodLabel: `${currentYear.start.getFullYear()} so far`
    });

    yearStats.months = buildMonthlyScrobbles(
        yearData.tracks,
        currentYear.start.getFullYear(),
        now.getMonth()
    );

    return {
        ...monthStats,
        year: yearStats
    };
}

function attachLastfmAlbumDetails(albums, stats) {
    if (!stats?.topAlbums) return albums;

    const details = new Map(
        stats.topAlbums.map((album) => [
            normalizeKey(album.artistName, album.albumName),
            album
        ])
    );

    return albums.map((album) => {
        const lastfmAlbum = (album.artists || [])
            .map((artist) => details.get(normalizeKey(artist, album.albumName)))
            .find(Boolean);

        return lastfmAlbum
            ? {
                ...album,
                lastfmScrobbles: lastfmAlbum.scrobbles,
                lastfmTopTracks: lastfmAlbum.topTracks || [],
                lastfmPeriod: stats.period,
                lastfmPeriodLabel: stats.periodLabel
            }
            : album;
    });
}

function mergeTopTracks(existingTracks = [], nextTracks = []) {
    const byKey = new Map();

    for (const track of [...existingTracks, ...nextTracks]) {
        const key = normalizeKey(track.timeRange, track.trackName);

        if (!byKey.has(key)) {
            byKey.set(key, track);
            continue;
        }

        const current = byKey.get(key);
        if ((track.rank || Infinity) < (current.rank || Infinity)) {
            byKey.set(key, track);
        }
    }

    return [...byKey.values()]
        .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
}

function mergeAlbumDuplicates(albums) {
    const byKey = new Map();

    for (const album of albums) {
        const key = albumIdentityKey(album);
        if (!key) continue;

        if (!byKey.has(key)) {
            byKey.set(key, {
                ...album,
                mergedAlbumIds: [album.albumId],
                timeRanges: [...(album.timeRanges || [])],
                topTracks: [...(album.topTracks || [])]
            });
            continue;
        }

        const current = byKey.get(key);
        current.mergedAlbumIds.push(album.albumId);
        current.timeRanges = [...new Set([...current.timeRanges, ...(album.timeRanges || [])])];
        current.topTracks = mergeTopTracks(current.topTracks, album.topTracks || []);
        current.recentPlayCount = (current.recentPlayCount || 0) + (album.recentPlayCount || 0);
        current.score = (current.score || 0) + (album.score || 0);

        if (!current.lastPlayedAt || (album.lastPlayedAt && new Date(album.lastPlayedAt) > new Date(current.lastPlayedAt))) {
            current.lastPlayedAt = album.lastPlayedAt;
        }
    }

    return [...byKey.values()];
}

function existingAlbumByLastfmKey(albums, lastfmAlbum) {
    return [...albums.values()].find((album) =>
        album.artists?.some((artist) =>
            normalizeKey(artist, album.albumName) === normalizeKey(lastfmAlbum.artistName, lastfmAlbum.albumName)
        )
    );
}

function lastfmAlbumUrl(albumName, artistName) {
    return `https://www.last.fm/music/${encodeURIComponent(artistName)}/${encodeURIComponent(albumName)}`;
}

function addLastfmFallbackAlbum(albums, lastfmAlbum) {
    if (!lastfmAlbum.imageUrl) return null;

    const albumId = `lastfm:${normalizeKey(lastfmAlbum.artistName, lastfmAlbum.albumName)}`;

    if (!albums.has(albumId)) {
        albums.set(albumId, {
            albumId,
            albumName: lastfmAlbum.albumName,
            artists: [lastfmAlbum.artistName],
            imageUrl: lastfmAlbum.imageUrl,
            imageWidth: 300,
            imageHeight: 300,
            spotifyUrl: '',
            lastfmUrl: lastfmAlbumUrl(lastfmAlbum.albumName, lastfmAlbum.artistName),
            releaseDate: '',
            albumType: 'album',
            timeRanges: [],
            topTracks: [],
            recentPlayCount: 0,
            lastPlayedAt: null,
            score: 0
        });
    }

    return albums.get(albumId);
}

async function searchSpotifyAlbum(accessToken, albumName, artistName) {
    const query = `album:${albumName} artist:${artistName}`;
    const data = await spotifyGet(accessToken, '/search', {
        q: query,
        type: 'album',
        limit: '8'
    });

    const candidates = data?.albums?.items || [];
    if (candidates.length === 0) return null;

    return candidates.find((album) =>
        normalizeText(album.name) === normalizeText(albumName) &&
        album.artists?.some((artist) => normalizeText(artist.name) === normalizeText(artistName))
    ) || candidates.find((album) =>
        normalizeText(album.name) === normalizeText(albumName)
    ) || null;
}

function uniqueLastfmAlbums(...statsList) {
    const byKey = new Map();

    for (const stats of statsList) {
        for (const album of stats?.topAlbums || []) {
            const key = normalizeKey(album.artistName, album.albumName);
            if (!key || byKey.has(key)) continue;

            byKey.set(key, album);
        }
    }

    return [...byKey.values()];
}

async function ensureSpotifyAlbumsForLastfm(accessToken, albums, ...statsList) {
    const lastfmAlbums = uniqueLastfmAlbums(...statsList);
    if (lastfmAlbums.length === 0) return;

    for (const lastfmAlbum of lastfmAlbums) {
        if (existingAlbumByLastfmKey(albums, lastfmAlbum)) continue;

        const spotifyAlbum = await searchSpotifyAlbum(accessToken, lastfmAlbum.albumName, lastfmAlbum.artistName);
        if (spotifyAlbum) {
            ensureAlbum(albums, spotifyAlbum);
        } else {
            addLastfmFallbackAlbum(albums, lastfmAlbum);
        }
    }
}

function buildAlbumWall(baseAlbums, periodStats, limit = albumWallLimit) {
    if (!periodStats?.topAlbums?.length) return [];

    return attachLastfmAlbumDetails(baseAlbums, periodStats)
        .filter((album) => album.lastfmScrobbles)
        .sort((a, b) =>
            (b.lastfmScrobbles || 0) - (a.lastfmScrobbles || 0) ||
            b.score - a.score ||
            a.albumName.localeCompare(b.albumName)
        )
        .slice(0, limit)
        .map(cleanAlbum);
}

function buildFallbackAlbumWall(baseAlbums, limit = albumWallLimit) {
    return [...baseAlbums]
        .sort((a, b) =>
            b.score - a.score ||
            (b.recentPlayCount || 0) - (a.recentPlayCount || 0) ||
            a.albumName.localeCompare(b.albumName)
        )
        .slice(0, limit)
        .map(cleanAlbum);
}

const accessToken = await getAccessToken();
const albums = new Map();

await addTopTracks(accessToken, albums);
await addRecentlyPlayed(accessToken, albums);

let stats = null;

if (hasLastfm) {
    try {
        stats = await getLastfmStats();
    } catch (error) {
        console.warn(`lastfm_sync_error=${error.message}`);
    }
}

await ensureSpotifyAlbumsForLastfm(accessToken, albums, stats, stats?.year);

const mergedAlbums = mergeAlbumDuplicates([...albums.values()]);
const currentMonthAlbums = buildAlbumWall(mergedAlbums, stats);
const yearToDateAlbums = buildAlbumWall(mergedAlbums, stats?.year);
const fallbackAlbums = currentMonthAlbums.length > 0
    ? currentMonthAlbums
    : buildFallbackAlbumWall(mergedAlbums);

const albumWalls = {
    currentMonth: currentMonthAlbums,
    yearToDate: yearToDateAlbums
};

const snapshot = {
    generatedAt: new Date().toISOString(),
    stats,
    albums: fallbackAlbums,
    albumWalls
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`listens_albums_synced=${snapshot.albums.length}`);
console.log(`listens_month_albums_synced=${albumWalls.currentMonth.length}`);
console.log(`listens_ytd_albums_synced=${albumWalls.yearToDate.length}`);
if (stats) {
    console.log(`lastfm_month_scrobbles=${stats.scrobbles}`);
    console.log(`lastfm_month_tracks=${stats.tracks}`);
    console.log(`lastfm_month_artists=${stats.artists}`);
}
console.log(`spotify_snapshot=${outputPath}`);
