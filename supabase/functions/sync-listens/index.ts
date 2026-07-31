type LastfmTrack = {
    trackName: string;
    artistName: string;
    albumName: string;
    albumMbid: string;
    imageUrl: string;
    playedAt: string;
};

type RankedTrack = {
    trackName: string;
    artistName: string;
    albumName?: string;
    scrobbles: number;
};

type RankedAlbum = {
    albumName: string;
    artistName: string;
    albumMbid: string;
    imageUrl: string;
    scrobbles: number;
    topTracks: RankedTrack[];
};

type AlbumWallEntry = {
    albumId: string;
    albumName: string;
    artists: string[];
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    spotifyUrl: string;
    lastfmUrl: string;
    releaseDate: string;
    albumType: string;
    timeRanges: string[];
    topTracks: unknown[];
    recentPlayCount: number;
    lastPlayedAt: string | null;
    score: number;
    mergedAlbumIds?: string[];
    lastfmScrobbles: number;
    lastfmTopTracks: RankedTrack[];
    lastfmPeriod: string;
    lastfmPeriodLabel: string;
};

const LASTFM_ENDPOINT = 'https://ws.audioscrobbler.com/2.0/';
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const PAGE_SIZE = 200;
const PAGE_CONCURRENCY = 5;
const WALL_LIMIT = 120;

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

function requiredEnv(name: string) {
    const value = Deno.env.get(name);

    if (!value) throw new Error(`Missing ${name}`);

    return value;
}

function positiveInteger(value: string | undefined, fallback: number) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function normalizeText(value: unknown) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function normalizeKey(...parts: unknown[]) {
    return parts.map(normalizeText).join('::');
}

function textValue(value: unknown) {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '#text' in value) {
        return String((value as Record<string, unknown>)['#text'] || '');
    }
    return '';
}

function pickLastfmImage(images: unknown) {
    if (!Array.isArray(images)) return '';

    for (const size of ['extralarge', 'large', 'medium']) {
        const image = images.find((item) =>
            item && typeof item === 'object' &&
            (item as Record<string, unknown>).size === size &&
            (item as Record<string, unknown>)['#text']
        ) as Record<string, unknown> | undefined;

        if (image) return String(image['#text']);
    }

    const fallback = images.find((item) =>
        item && typeof item === 'object' && (item as Record<string, unknown>)['#text']
    ) as Record<string, unknown> | undefined;

    return fallback ? String(fallback['#text']) : '';
}

function jakartaParts(date: Date) {
    const local = new Date(date.getTime() + JAKARTA_OFFSET_MS);

    return {
        year: local.getUTCFullYear(),
        month: local.getUTCMonth(),
        day: local.getUTCDate()
    };
}

function jakartaStart(year: number, month: number) {
    return new Date(Date.UTC(year, month, 1) - JAKARTA_OFFSET_MS);
}

async function fetchWithRetry(url: URL, attempts = 3): Promise<Record<string, unknown>> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(20_000)
            });
            const data = await response.json().catch(() => ({})) as Record<string, unknown>;

            if (!response.ok || data.error) {
                const details = data.message || data.error || `HTTP ${response.status}`;
                throw new Error(`Last.fm request failed: ${details}`);
            }

            return data;
        } catch (error) {
            lastError = error;
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, attempt * 350));
            }
        }
    }

    throw lastError;
}

async function fetchLastfmPage(
    apiKey: string,
    username: string,
    from: number,
    to: number,
    page: number
) {
    const url = new URL(LASTFM_ENDPOINT);
    url.searchParams.set('method', 'user.getrecenttracks');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('user', username);
    url.searchParams.set('format', 'json');
    url.searchParams.set('from', String(from));
    url.searchParams.set('to', String(to));
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));

    return fetchWithRetry(url);
}

function tracksFromPage(data: Record<string, unknown>) {
    const recent = data.recenttracks as Record<string, unknown> | undefined;
    const rawTracks = recent?.track;
    const items = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [];

    return items.flatMap((raw): LastfmTrack[] => {
        const item = raw as Record<string, unknown>;
        const date = item.date as Record<string, unknown> | undefined;
        const playedAt = Number(date?.uts || 0);

        if (!playedAt) return [];

        const album = item.album as Record<string, unknown> | string | undefined;

        return [{
            trackName: String(item.name || ''),
            artistName: textValue(item.artist),
            albumName: textValue(album),
            albumMbid: album && typeof album === 'object' ? String(album.mbid || '') : '',
            imageUrl: pickLastfmImage(item.image),
            playedAt: new Date(playedAt * 1000).toISOString()
        }];
    });
}

async function fetchYearScrobbles(
    apiKey: string,
    username: string,
    start: Date,
    end: Date,
    maxPages: number
) {
    const from = Math.floor(start.getTime() / 1000);
    const to = Math.floor(end.getTime() / 1000);
    const first = await fetchLastfmPage(apiKey, username, from, to, 1);
    const recent = first.recenttracks as Record<string, unknown> | undefined;
    const attrs = recent?.['@attr'] as Record<string, unknown> | undefined;
    const totalPages = Math.max(1, Number(attrs?.totalPages || 1));

    if (totalPages > maxPages) {
        throw new Error(
            `Last.fm returned ${totalPages} pages, exceeding LASTFM_SYNC_MAX_PAGES=${maxPages}`
        );
    }

    const pages: Record<string, unknown>[] = [first];

    for (let page = 2; page <= totalPages; page += PAGE_CONCURRENCY) {
        const batch = Array.from(
            { length: Math.min(PAGE_CONCURRENCY, totalPages - page + 1) },
            (_, index) => fetchLastfmPage(apiKey, username, from, to, page + index)
        );

        pages.push(...await Promise.all(batch));
    }

    return pages.flatMap(tracksFromPage);
}

function rankMap<T extends Record<string, unknown>>(map: Map<string, T & { scrobbles: number }>) {
    return [...map.values()].sort((a, b) =>
        b.scrobbles - a.scrobbles ||
        JSON.stringify(a).localeCompare(JSON.stringify(b))
    );
}

function buildStats(
    tracks: LastfmTrack[],
    start: Date,
    end: Date,
    period: string,
    periodLabel: string
) {
    const artists = new Map<string, { artistName: string; scrobbles: number }>();
    const songs = new Map<string, RankedTrack>();
    const albums = new Map<string, RankedAlbum & { trackCounts: Map<string, RankedTrack> }>();

    for (const track of tracks) {
        const artistKey = normalizeKey(track.artistName);
        const songKey = normalizeKey(track.artistName, track.trackName);
        const albumKey = track.albumName
            ? normalizeKey(track.artistName, track.albumName)
            : '';

        if (artistKey) {
            const artist = artists.get(artistKey) || {
                artistName: track.artistName,
                scrobbles: 0
            };
            artist.scrobbles += 1;
            artists.set(artistKey, artist);
        }

        if (songKey) {
            const song = songs.get(songKey) || {
                trackName: track.trackName,
                artistName: track.artistName,
                albumName: track.albumName,
                scrobbles: 0
            };
            song.scrobbles += 1;
            songs.set(songKey, song);
        }

        if (albumKey) {
            const album = albums.get(albumKey) || {
                albumName: track.albumName,
                artistName: track.artistName,
                albumMbid: track.albumMbid,
                imageUrl: track.imageUrl,
                scrobbles: 0,
                topTracks: [],
                trackCounts: new Map<string, RankedTrack>()
            };
            album.scrobbles += 1;
            album.albumMbid ||= track.albumMbid;
            album.imageUrl ||= track.imageUrl;

            const albumTrack = album.trackCounts.get(songKey) || {
                trackName: track.trackName,
                artistName: track.artistName,
                scrobbles: 0
            };
            albumTrack.scrobbles += 1;
            album.trackCounts.set(songKey, albumTrack);
            albums.set(albumKey, album);
        }
    }

    const topArtists = rankMap(artists);
    const topTracks = rankMap(songs);
    const rankedAlbums = rankMap(albums).map(({ trackCounts, ...album }) => ({
        ...album,
        topTracks: rankMap(trackCounts).slice(0, 4)
    }));

    return {
        source: 'lastfm',
        period,
        periodLabel,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        scrobbles: tracks.length,
        tracks: songs.size,
        artists: artists.size,
        albums: albums.size,
        topArtist: topArtists[0] || null,
        topTrack: topTracks[0] || null,
        topAlbum: rankedAlbums[0] || null,
        topArtists: topArtists.slice(0, 5),
        topTracks: topTracks.slice(0, 5),
        topAlbums: rankedAlbums.slice(0, WALL_LIMIT),
        rankedAlbums
    };
}

function monthlyScrobbles(tracks: LastfmTrack[], year: number, currentMonth: number) {
    const counts = Array.from({ length: currentMonth + 1 }, () => 0);

    for (const track of tracks) {
        const parts = jakartaParts(new Date(track.playedAt));

        if (parts.year === year && parts.month <= currentMonth) {
            counts[parts.month] += 1;
        }
    }

    const maximum = Math.max(...counts, 1);

    return counts.map((scrobbles, month) => ({
        label: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            timeZone: 'Asia/Jakarta'
        }).format(jakartaStart(year, month)),
        scrobbles,
        intensity: Math.max(0.08, scrobbles / maximum)
    }));
}

function lastfmAlbumUrl(albumName: string, artistName: string) {
    return `https://www.last.fm/music/${encodeURIComponent(artistName)}/${encodeURIComponent(albumName)}`;
}

function snapshotCatalog(snapshot: Record<string, unknown> | null) {
    if (!snapshot) return [];

    const walls = snapshot.albumWalls as Record<string, unknown> | undefined;
    const sources = [
        snapshot.albums,
        walls?.currentMonth,
        walls?.yearToDate
    ];
    const byId = new Map<string, AlbumWallEntry>();

    for (const source of sources) {
        if (!Array.isArray(source)) continue;

        for (const item of source) {
            const album = item as AlbumWallEntry;
            if (album?.albumId && !byId.has(album.albumId)) {
                byId.set(album.albumId, album);
            }
        }
    }

    return [...byId.values()];
}

function catalogAlbum(catalog: AlbumWallEntry[], album: RankedAlbum) {
    return catalog.find((candidate) =>
        normalizeText(candidate.albumName) === normalizeText(album.albumName) &&
        candidate.artists?.some((artist) =>
            normalizeText(artist) === normalizeText(album.artistName)
        )
    ) || null;
}

function freshWallEntry(album: RankedAlbum): AlbumWallEntry {
    return {
        albumId: album.albumMbid
            ? `lastfm-mbid:${album.albumMbid}`
            : `lastfm:${normalizeKey(album.artistName, album.albumName)}`,
        albumName: album.albumName,
        artists: [album.artistName],
        imageUrl: album.imageUrl,
        imageWidth: 300,
        imageHeight: 300,
        spotifyUrl: '',
        lastfmUrl: lastfmAlbumUrl(album.albumName, album.artistName),
        releaseDate: '',
        albumType: 'album',
        timeRanges: [],
        topTracks: [],
        recentPlayCount: 0,
        lastPlayedAt: null,
        score: 0,
        lastfmScrobbles: 0,
        lastfmTopTracks: [],
        lastfmPeriod: '',
        lastfmPeriodLabel: ''
    };
}

function mergeRankedTracks(existing: RankedTrack[], incoming: RankedTrack[]) {
    const tracks = new Map<string, RankedTrack>();

    for (const track of [...existing, ...incoming]) {
        const key = normalizeKey(track.trackName);
        const current = tracks.get(key);

        if (current) {
            current.scrobbles += track.scrobbles;
        } else {
            tracks.set(key, { ...track });
        }
    }

    return rankMap(tracks).slice(0, 4);
}

function buildAlbumWall(
    catalog: AlbumWallEntry[],
    rankedAlbums: RankedAlbum[],
    period: string,
    periodLabel: string
) {
    const wall = new Map<string, AlbumWallEntry>();

    for (const ranked of rankedAlbums) {
        const cached = catalogAlbum(catalog, ranked);
        const base = cached ? { ...cached } : freshWallEntry(ranked);
        const key = base.albumId;
        const existing = wall.get(key);

        if (existing) {
            existing.lastfmScrobbles += ranked.scrobbles;
            existing.lastfmTopTracks = mergeRankedTracks(
                existing.lastfmTopTracks,
                ranked.topTracks
            );
            existing.artists = [...new Set([...existing.artists, ranked.artistName])];
            existing.imageUrl ||= ranked.imageUrl;
            continue;
        }

        base.artists = [...new Set([...(base.artists || []), ranked.artistName])];
        base.imageUrl ||= ranked.imageUrl;
        base.lastfmUrl ||= lastfmAlbumUrl(ranked.albumName, ranked.artistName);
        base.lastfmScrobbles = ranked.scrobbles;
        base.lastfmTopTracks = ranked.topTracks;
        base.lastfmPeriod = period;
        base.lastfmPeriodLabel = periodLabel;
        wall.set(key, base);
    }

    return [...wall.values()]
        .filter((album) => album.imageUrl && album.lastfmScrobbles)
        .sort((a, b) =>
            b.lastfmScrobbles - a.lastfmScrobbles ||
            a.albumName.localeCompare(b.albumName)
        )
        .slice(0, WALL_LIMIT);
}

function publicStats(stats: ReturnType<typeof buildStats>) {
    const { rankedAlbums: _rankedAlbums, ...result } = stats;
    return result;
}

async function currentSnapshot(
    supabaseUrl: string,
    serviceRoleKey: string
): Promise<{ snapshot: Record<string, unknown>; generated_at: string } | null> {
    const url = new URL('/rest/v1/listens_snapshots', supabaseUrl);
    url.searchParams.set('select', 'snapshot,generated_at');
    url.searchParams.set('id', 'eq.current');
    url.searchParams.set('limit', '1');

    const response = await fetch(url, {
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`Could not read current snapshot: HTTP ${response.status}`);
    }

    const rows = await response.json();
    return rows?.[0] || null;
}

async function saveSnapshot(
    supabaseUrl: string,
    serviceRoleKey: string,
    snapshot: Record<string, unknown>
) {
    const url = new URL('/rest/v1/listens_snapshots', supabaseUrl);
    url.searchParams.set('on_conflict', 'id');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'content-type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
            id: 'current',
            snapshot,
            generated_at: snapshot.generatedAt,
            updated_at: new Date().toISOString()
        })
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Could not save snapshot: HTTP ${response.status} ${details}`);
    }
}

Deno.serve(async (request) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    const startedAt = Date.now();

    try {
        const lastfmApiKey = requiredEnv('LASTFM_API_KEY');
        const lastfmUsername = requiredEnv('LASTFM_USERNAME');
        const supabaseUrl = requiredEnv('SUPABASE_URL');
        const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
        const maxPages = positiveInteger(Deno.env.get('LASTFM_SYNC_MAX_PAGES'), 100);
        const minimumMinutes = positiveInteger(Deno.env.get('LISTENS_SYNC_MINUTES'), 30);
        const body = await request.json().catch(() => ({})) as { force?: boolean };
        const previous = await currentSnapshot(supabaseUrl, serviceRoleKey);
        const previousTime = previous?.generated_at
            ? new Date(previous.generated_at).getTime()
            : 0;

        if (
            !body.force &&
            previousTime &&
            Date.now() - previousTime < minimumMinutes * 60_000
        ) {
            return json({
                ok: true,
                skipped: true,
                reason: `Snapshot is newer than ${minimumMinutes} minutes`,
                generatedAt: previous?.generated_at
            });
        }

        const now = new Date();
        const local = jakartaParts(now);
        const yearStart = jakartaStart(local.year, 0);
        const monthStart = jakartaStart(local.year, local.month);
        const yearTracks = await fetchYearScrobbles(
            lastfmApiKey,
            lastfmUsername,
            yearStart,
            now,
            maxPages
        );
        const monthTracks = yearTracks.filter((track) =>
            new Date(track.playedAt).getTime() >= monthStart.getTime()
        );
        const monthLabel = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta'
        }).format(now);
        const monthStats = buildStats(
            monthTracks,
            monthStart,
            now,
            'current_month',
            monthLabel
        );
        const yearStats = buildStats(
            yearTracks,
            yearStart,
            now,
            'year_to_date',
            `${local.year} so far`
        );
        const catalog = snapshotCatalog(previous?.snapshot || null);
        const currentMonthWall = buildAlbumWall(
            catalog,
            monthStats.rankedAlbums,
            monthStats.period,
            monthStats.periodLabel
        );
        const yearToDateWall = buildAlbumWall(
            catalog,
            yearStats.rankedAlbums,
            yearStats.period,
            yearStats.periodLabel
        );
        const publicYearStats = {
            ...publicStats(yearStats),
            months: monthlyScrobbles(yearTracks, local.year, local.month)
        };
        const stats = {
            ...publicStats(monthStats),
            year: publicYearStats
        };
        const generatedAt = new Date().toISOString();
        const snapshot = {
            generatedAt,
            stats,
            albums: currentMonthWall,
            albumWalls: {
                currentMonth: currentMonthWall,
                yearToDate: yearToDateWall
            }
        };

        await saveSnapshot(supabaseUrl, serviceRoleKey, snapshot);

        return json({
            ok: true,
            generatedAt,
            durationMs: Date.now() - startedAt,
            monthScrobbles: monthStats.scrobbles,
            yearScrobbles: yearStats.scrobbles,
            monthAlbums: currentMonthWall.length,
            yearAlbums: yearToDateWall.length
        });
    } catch (error) {
        console.error(error);
        return json({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            durationMs: Date.now() - startedAt
        }, 500);
    }
});
