import fs from 'node:fs';
import path from 'node:path';

const folder = process.argv[2];
if (!folder) throw new Error('Provide the Spotify export folder');
const years = new Map();
const currentYear = Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Jakarta', year: 'numeric' }).format(new Date()));
const key = (...parts) => parts.map(x => String(x || '').normalize('NFKC').toLowerCase().trim()).join('::');
const increment = (map, id, create) => { const value = map.get(id) || create(); value.scrobbles++; map.set(id, value); return value; };
const seen = new Set();
for (const file of fs.readdirSync(folder).filter(x => /^Streaming_History_Audio_.*\.json$/.test(x)).sort()) {
    for (const row of JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'))) {
        if (!row.master_metadata_track_name || !row.spotify_track_uri || row.ms_played < 80000) continue;
        const ended = Date.parse(row.ts);
        if (!Number.isFinite(ended)) continue;
        const started = ended - row.ms_played;
        const local = new Date(started + 7 * 3600000);
        const year = local.getUTCFullYear();
        if (year >= currentYear) continue;
        const event = `${row.ts}:${row.spotify_track_uri}:${row.ms_played}`;
        if (seen.has(event)) continue;
        seen.add(event);
        const state = years.get(year) || { count: 0, months: Array(12).fill(0), tracks: new Set(), artists: new Map(), albums: new Map() };
        const artist = row.master_metadata_album_artist_name || 'Unknown artist';
        const album = row.master_metadata_album_album_name || 'Unknown album';
        state.count++; state.months[local.getUTCMonth()]++;
        state.tracks.add(key(artist, row.master_metadata_track_name));
        increment(state.artists, key(artist), () => ({ artistName: artist, scrobbles: 0 }));
        const entry = increment(state.albums, key(artist, album), () => ({ albumId: key(artist, album), albumName: album, artists: [artist], scrobbles: 0, tracks: new Map(), uri: row.spotify_track_uri }));
        increment(entry.tracks, key(row.master_metadata_track_name), () => ({ trackName: row.master_metadata_track_name, scrobbles: 0 }));
        years.set(year, state);
    }
}
const ranked = map => [...map.values()].sort((a,b) => b.scrobbles-a.scrobbles || JSON.stringify(a).localeCompare(JSON.stringify(b)));
const out = 'src/lib/data/listens-history';
fs.mkdirSync(out, { recursive: true });
const artwork = new Map();
for (const [year, state] of [...years].sort((a,b) => a[0]-b[0])) {
    const albums = [];
    for (const album of ranked(state.albums).slice(0, 60)) {
        if (!artwork.has(album.uri)) {
            const url = new URL('https://open.spotify.com/oembed');
            url.searchParams.set('url', `https://open.spotify.com/track/${album.uri.split(':').at(-1)}`);
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (response.status === 429) throw new Error('Artwork rate limited; retry later');
            const data = response.ok ? await response.json() : {};
            artwork.set(album.uri, data.thumbnail_url || '/album-placeholder.svg');
        }
        albums.push({ albumId: album.albumId, albumName: album.albumName, artists: album.artists, imageUrl: artwork.get(album.uri), spotifyUrl: `https://open.spotify.com/track/${album.uri.split(':').at(-1)}`, lastfmScrobbles: album.scrobbles, lastfmTopTracks: ranked(album.tracks).slice(0,4), lastfmPeriodLabel: String(year) });
    }
    const maximum = Math.max(...state.months,1);
    const stats = { periodLabel: String(year), periodStart: `${year}-01-01T00:00:00+07:00`, scrobbles: state.count, tracks: state.tracks.size, artists: state.artists.size, albums: state.albums.size, topArtist: ranked(state.artists)[0], months: state.months.map((scrobbles, index) => ({ label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][index], scrobbles, intensity: Math.max(.08,scrobbles/maximum) })) };
    fs.writeFileSync(`${out}/${year}.json`, JSON.stringify({ generatedAt: new Date().toISOString(), stats: { ...stats, year: stats }, albumWalls: { currentMonth: [], yearToDate: albums } }));
    console.log(`${year}: ${state.count} plays, ${albums.length} albums`);
}
