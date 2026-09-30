import spotifySnapshot from '$lib/data/spotifyAlbums.json';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
const archives = import.meta.glob('/src/lib/data/listens-history/*.json');

function compactStats(stats) {
    if (!stats) return null;

    return {
        periodLabel: stats.periodLabel,
        periodStart: stats.periodStart,
        scrobbles: stats.scrobbles,
        tracks: stats.tracks,
        artists: stats.artists,
        albums: stats.albums,
        topArtist: stats.topArtist || null,
        months: Array.isArray(stats.months) ? stats.months : []
    };
}

function albumBase(album) {
    return {
        albumId: album.albumId,
        albumName: album.albumName,
        artists: album.artists || [],
        imageUrl: album.imageUrl,
        imageWidth: album.imageWidth,
        imageHeight: album.imageHeight,
        spotifyUrl: album.spotifyUrl || '',
        lastfmUrl: album.lastfmUrl || '',
        timeRanges: album.timeRanges || [],
        lastPlayedAt: album.lastPlayedAt || null
    };
}

function wallEntry(album) {
    return {
        albumId: album.albumId,
        lastfmScrobbles: album.lastfmScrobbles || 0,
        lastfmTopTracks: (album.lastfmTopTracks || []).slice(0, 4).map(track => ({
            trackName: track.trackName,
            scrobbles: track.scrobbles
        })),
        lastfmPeriodLabel: album.lastfmPeriodLabel || ''
    };
}

async function liveSnapshot(fetch) {
    if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) return null;

    const url = new URL('/rest/v1/listens_snapshots', PUBLIC_SUPABASE_URL);
    url.searchParams.set('select', 'snapshot');
    url.searchParams.set('id', 'eq.current');
    url.searchParams.set('limit', '1');

    try {
        const response = await fetch(url, {
            headers: {
                apikey: PUBLIC_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) return null;

        const rows = await response.json();
        const snapshot = rows?.[0]?.snapshot;

        return snapshot?.stats ? snapshot : null;
    } catch {
        return null;
    }
}

function pageData(snapshot) {
    const snapshotWalls = snapshot.albumWalls || {};
    const currentMonthSource = Array.isArray(snapshotWalls.currentMonth)
        ? snapshotWalls.currentMonth
        : (Array.isArray(snapshot.albums) ? snapshot.albums : []);
    const yearToDateSource = Array.isArray(snapshotWalls.yearToDate)
        ? snapshotWalls.yearToDate
        : [];
    const albumIndex = {};

    for (const album of [...currentMonthSource, ...yearToDateSource]) {
        if (album?.albumId && !albumIndex[album.albumId]) {
            albumIndex[album.albumId] = albumBase(album);
        }
    }

    const currentStats = compactStats(snapshot.stats);

    return {
        generatedAt: snapshot.generatedAt || null,
        stats: currentStats
            ? {
                ...currentStats,
                year: compactStats(snapshot.stats?.year)
            }
            : null,
        albumIndex,
        albumWalls: {
            currentMonth: currentMonthSource.map(wallEntry),
            yearToDate: yearToDateSource.map(wallEntry)
        }
    };
}

export async function load({ fetch, setHeaders, url }) {
    const currentYear = Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date()));
    const historyYears = Object.keys(archives).map(path => Number(path.match(/(\d{4})\.json$/)[1])).filter(year => year < currentYear).sort((a,b) => b-a);
    const selectedYear = url.searchParams.has('year') ? Number(url.searchParams.get('year')) : currentYear;
    const historical = selectedYear !== currentYear;
    if (historical && !historyYears.includes(selectedYear)) error(404, 'Listening history is unavailable for this year');
    const snapshot = historical
        ? (await archives[`/src/lib/data/listens-history/${selectedYear}.json`]()).default
        : await liveSnapshot(fetch) || spotifySnapshot;

    setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
    });

    return { ...pageData(snapshot), selectedYear, historical, years: [currentYear, ...historyYears] };
}
