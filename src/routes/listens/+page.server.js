import spotifySnapshot from '$lib/data/spotifyAlbums.json';

export function load() {
    const albums = Array.isArray(spotifySnapshot.albums) ? spotifySnapshot.albums : [];
    const albumWalls = spotifySnapshot.albumWalls || {};

    return {
        generatedAt: spotifySnapshot.generatedAt || null,
        stats: spotifySnapshot.stats || null,
        albums,
        albumWalls: {
            currentMonth: Array.isArray(albumWalls.currentMonth) ? albumWalls.currentMonth : albums,
            yearToDate: Array.isArray(albumWalls.yearToDate) ? albumWalls.yearToDate : []
        }
    };
}
