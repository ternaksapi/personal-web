<script>
    import Header from "$lib/header.svelte";

    export let data;

    let stats = data.stats || null;
    let albumWalls = data.albumWalls || {};
    let wallMode = 'yearToDate';
    let activeId = null;
    let wallOptions = [];
    let activeWall = null;
    let albums = [];
    let hasPinnedSelection = false;

    $: wallOptions = [
        {
            key: 'currentMonth',
            label: stats?.periodLabel || 'This month',
            albums: Array.isArray(albumWalls.currentMonth) ? albumWalls.currentMonth : data.albums || [],
            stats
        },
        {
            key: 'yearToDate',
            label: stats?.year?.periodLabel || 'Year to date',
            albums: Array.isArray(albumWalls.yearToDate) ? albumWalls.yearToDate : [],
            stats: stats?.year || null
        }
    ].filter((option) => option.albums.length > 0);
    $: if (wallOptions.length > 0 && !wallOptions.some((option) => option.key === wallMode)) {
        wallMode = wallOptions[0].key;
    }
    $: activeWall = wallOptions.find((option) => option.key === wallMode) || wallOptions[0] || null;
    $: albums = activeWall?.albums || [];
    $: if (albums.length > 0 && !albums.some((album) => album.albumId === activeId)) {
        activeId = albums[0].albumId;
    }
    $: activeAlbum = albums.find((album) => album.albumId === activeId) || albums[0] || null;

    function selectAlbum(album, pinned = false) {
        activeId = album.albumId;

        if (pinned) {
            hasPinnedSelection = true;
        }
    }

    function setWallMode(key) {
        wallMode = key;
        hasPinnedSelection = false;
    }

    function artistsFor(album) {
        return album.artists?.join(', ') || 'Unknown artist';
    }

    function sourceLabel(album) {
        const ranges = album.timeRanges || [];

        if (album.lastfmScrobbles) return `${album.lastfmPeriodLabel || 'period'} album`;
        if (ranges.includes('short_term')) return 'recent rotation';
        if (ranges.includes('medium_term')) return 'six month rotation';
        if (ranges.includes('long_term')) return 'long rotation';
        if (album.lastPlayedAt) return 'recently played';

        return 'saved from Spotify';
    }

    function formattedDate(value) {
        if (!value) return '';

        return new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function listeningSummary(stats) {
        if (!stats?.year?.scrobbles) {
            return 'A recent snapshot of what has been in rotation.';
        }

        return `${stats.year.periodLabel}, Last.fm logged ${formatNumber(stats.year.scrobbles)} scrobbles across ${formatNumber(stats.year.tracks)} tracks and ${formatNumber(stats.year.artists)} artists. The wall switches between this month and the year-to-date album stack.`;
    }

    function formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value || 0);
    }

    function albumHref(album) {
        return album.spotifyUrl || album.lastfmUrl || '#';
    }

    function albumLinkLabel(album) {
        return album.spotifyUrl ? 'Open on Spotify' : 'Open on Last.fm';
    }

    function topArtistLine(stats) {
        if (!stats?.year?.topArtist) return '';

        return `${stats.year.topArtist.artistName} has the most scrobbles this year (${formatNumber(stats.year.topArtist.scrobbles)}).`;
    }

    function barHeight(month) {
        return `${0.45 + (month?.intensity || 0) * 3.4}rem`;
    }

    function scrobbleCopy(album) {
        if (!album?.lastfmScrobbles) return '';

        return `${formatNumber(album.lastfmScrobbles)} album scrobbles in ${album.lastfmPeriodLabel || 'this period'}`;
    }

    function wallDescription(wall) {
        if (!wall?.stats) return 'Albums ranked from the listening snapshot.';

        return `${formatNumber(wall.stats.albums)} albums ranked by scrobbles.`;
    }
</script>

<svelte:head>
    <title>Listens</title>
</svelte:head>

<div class="listens-shell transition-all duration-[2000ms] h-full w-full max-w-md space-y-10 sm:max-w-md md:max-w-xl lg:max-w-4xl">
    <Header />

    <section class="listens-header">
        <div>
            <h1>Listens</h1>
            <p>{listeningSummary(stats)}</p>
        </div>

        {#if data.generatedAt}
            <p class="snapshot-date">snapshot {formattedDate(data.generatedAt)}</p>
        {/if}
    </section>

    {#if stats?.year?.scrobbles}
        <section class="year-panel" aria-label="Year to date listening rhythm">
            <div class="year-copy">
                <p>year to date</p>
                <h2>{formatNumber(stats.year.scrobbles)} scrobbles in {new Date(stats.year.periodStart).getFullYear()}</h2>
                <span>{formatNumber(stats.year.tracks)} tracks, {formatNumber(stats.year.artists)} artists, {formatNumber(stats.year.albums)} albums. {topArtistLine(stats)}</span>
            </div>

            <div class="month-bars" aria-label="Monthly scrobbles this year">
                {#each stats.year.months as month}
                    <div class="month-bar" title={`${month.label}: ${formatNumber(month.scrobbles)} scrobbles`}>
                        <span class="bar-track">
                            <span class="bar-fill" style={`height: ${barHeight(month)};`}></span>
                        </span>
                        <span>{month.label}</span>
                    </div>
                {/each}
            </div>
        </section>
    {/if}

    {#if stats?.scrobbles}
        <section class="listening-ledger" aria-label="Listening stats">
            <div>
                <strong>{formatNumber(stats.scrobbles)}</strong>
                <span>{stats.periodLabel} scrobbles</span>
            </div>
            <div>
                <strong>{formatNumber(stats.tracks)}</strong>
                <span>{stats.periodLabel} tracks</span>
            </div>
            <div>
                <strong>{formatNumber(stats.artists)}</strong>
                <span>{stats.periodLabel} artists</span>
            </div>
            <div>
                <strong>{formatNumber(stats.albums)}</strong>
                <span>{stats.periodLabel} albums</span>
            </div>
        </section>
    {/if}

    {#if wallOptions.length > 0}
        <section class="wall-toolbar" aria-label="Album wall controls">
            <div>
                <p>album wall</p>
                <h2>{activeWall?.label}</h2>
                <span>{wallDescription(activeWall)}</span>
            </div>

            {#if wallOptions.length > 1}
                <div class="wall-toggle" role="group" aria-label="Album wall period">
                    {#each wallOptions as option}
                        <button
                            type="button"
                            class:active-wall={option.key === wallMode}
                            aria-pressed={option.key === wallMode}
                            on:click={() => setWallMode(option.key)}
                        >
                            {option.label}
                        </button>
                    {/each}
                </div>
            {/if}
        </section>
    {/if}

    {#if albums.length > 0}
        <section class="listens-board" aria-label={`${activeWall?.label || 'Listening'} album collage`}>
            <aside class="selected-album" aria-live="polite">
                {#if activeAlbum}
                    <p class="selected-kicker">{sourceLabel(activeAlbum)}</p>
                    <h2>{activeAlbum.albumName}</h2>
                    <p>{artistsFor(activeAlbum)}</p>
                    {#if activeAlbum.lastfmScrobbles}
                        <p class="selected-scrobbles">{scrobbleCopy(activeAlbum)}</p>
                    {/if}
                    {#if activeAlbum.lastfmTopTracks?.length}
                        <div class="selected-track-list">
                            <p>most played here</p>
                            {#each activeAlbum.lastfmTopTracks as track}
                                <div>
                                    <span>{track.trackName}</span>
                                    <span>{track.scrobbles}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    <a href={albumHref(activeAlbum)} target="_blank" rel="noopener noreferrer">
                        {albumLinkLabel(activeAlbum)}
                    </a>
                {/if}
            </aside>

            <div class="album-wall" class:pinned-selection={hasPinnedSelection}>
                {#each albums as album (album.albumId)}
                    <figure
                        class:active-tile={album.albumId === activeId}
                        on:mouseenter={() => selectAlbum(album)}
                        on:focusin={() => selectAlbum(album)}
                    >
                        <button
                            class="album-tile"
                            type="button"
                            aria-label={`Show ${album.albumName} by ${artistsFor(album)}`}
                            aria-pressed={album.albumId === activeId}
                            on:click={() => selectAlbum(album, true)}
                        >
                            <img
                                src={album.imageUrl}
                                alt={`${album.albumName} by ${artistsFor(album)}`}
                                loading="lazy"
                                width={album.imageWidth || 300}
                                height={album.imageHeight || 300}
                            />
                        </button>
                        <figcaption>
                            <span>{album.albumName}</span>
                            <span>{artistsFor(album)}</span>
                            {#if album.lastfmScrobbles}
                                <span>{formatNumber(album.lastfmScrobbles)} scrobbles in {album.lastfmPeriodLabel || 'this period'}</span>
                            {/if}
                        </figcaption>
                    </figure>
                {/each}
            </div>
        </section>
    {:else}
        <section class="empty-listens">
            <h2>No Spotify snapshot yet</h2>
            <p>Run the Spotify sync after adding your credentials and this becomes the album wall.</p>
        </section>
    {/if}
</div>

<style>
    .listens-shell {
        --surface: #ffffff;
        --surface-soft: #f8fafc;
        --ink: #111827;
        --muted: #64748b;
        --line: #d6dce5;
        --accent: #ff6b00;
        --shadow: rgba(15, 23, 42, 0.16);
        --toggle-selected-bg: #111827;
        --toggle-selected-text: #ffffff;
    }

    :global([data-theme="dark"]) .listens-shell {
        --surface: #050505;
        --surface-soft: #0f172a;
        --ink: #f8fafc;
        --muted: #94a3b8;
        --line: #263241;
        --shadow: rgba(0, 0, 0, 0.48);
        --toggle-selected-bg: #f8fafc;
        --toggle-selected-text: #050505;
    }

    .listens-header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 1.5rem;
        border-bottom: 1px solid var(--line);
        padding-bottom: 1.25rem;
    }

    .listens-header h1 {
        margin: 0;
        color: var(--ink);
        font-size: 2.15rem;
        line-height: 1;
    }

    .listens-header p,
    .snapshot-date,
    .selected-album p,
    .empty-listens p {
        color: var(--muted) !important;
    }

    .listens-header p {
        margin: 0.75rem 0 0;
        max-width: 32rem;
        line-height: 1.55;
    }

    .listening-ledger {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.65rem;
        margin-top: -1.2rem;
    }

    .year-panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem);
        gap: 1.25rem;
        align-items: end;
        border: 1px solid var(--line);
        border-radius: 0.5rem;
        background: linear-gradient(180deg, var(--surface), var(--surface-soft));
        padding: 1rem;
    }

    .year-copy p {
        margin: 0 0 0.55rem;
        color: var(--accent) !important;
        font-size: 0.78rem;
        letter-spacing: 0;
        text-transform: uppercase;
    }

    .year-copy h2 {
        margin: 0;
        color: var(--ink);
        font-size: 1.55rem;
        line-height: 1.12;
    }

    .year-copy span {
        display: block;
        margin-top: 0.65rem;
        color: var(--muted) !important;
        line-height: 1.45;
    }

    .month-bars {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(1.75rem, 1fr));
        gap: 0.42rem;
        align-items: end;
    }

    .month-bar {
        display: grid;
        gap: 0.3rem;
        justify-items: center;
        min-width: 0;
    }

    .bar-track {
        position: relative;
        display: flex;
        align-items: end;
        justify-content: center;
        width: 100%;
        height: 4.1rem;
        border-bottom: 1px solid var(--line);
    }

    .bar-fill {
        display: block;
        width: 72%;
        min-height: 0.45rem;
        border: 1px solid rgba(255, 107, 0, 0.32);
        border-radius: 0.16rem 0.16rem 0 0;
        background: linear-gradient(180deg, rgba(255, 107, 0, 0.9), rgba(255, 107, 0, 0.36));
    }

    .month-bar > span:last-child {
        color: var(--muted) !important;
        font-size: 0.68rem;
        line-height: 1;
        text-transform: uppercase;
    }

    .listening-ledger div {
        border: 1px solid var(--line);
        border-radius: 0.45rem;
        background: linear-gradient(180deg, var(--surface), var(--surface-soft));
        padding: 0.75rem 0.85rem;
    }

    .listening-ledger strong,
    .listening-ledger span {
        display: block;
        color: var(--ink) !important;
    }

    .listening-ledger strong {
        font-size: 1.35rem;
        line-height: 1;
    }

    .listening-ledger span {
        margin-top: 0.35rem;
        color: var(--muted) !important;
        font-size: 0.76rem;
        letter-spacing: 0;
        text-transform: uppercase;
    }

    .wall-toolbar {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid var(--line);
        padding-bottom: 0.9rem;
    }

    .wall-toolbar p {
        margin: 0 0 0.35rem;
        color: var(--accent) !important;
        font-size: 0.78rem;
        letter-spacing: 0;
        text-transform: uppercase;
    }

    .wall-toolbar h2 {
        margin: 0;
        color: var(--ink);
        font-size: 1.2rem;
        line-height: 1.15;
    }

    .wall-toolbar span {
        display: block;
        margin-top: 0.35rem;
        color: var(--muted) !important;
        font-size: 0.82rem;
    }

    .wall-toggle {
        display: inline-flex;
        flex: 0 0 auto;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 0.45rem;
        background: var(--surface);
    }

    .wall-toggle button {
        border: 0;
        border-left: 1px solid var(--line);
        background: transparent;
        color: var(--muted) !important;
        cursor: pointer;
        font: inherit;
        font-size: 0.78rem;
        line-height: 1;
        padding: 0.62rem 0.78rem;
        transition: background 0.16s ease, color 0.16s ease;
    }

    .wall-toggle button:first-child {
        border-left: 0;
    }

    .wall-toggle button:hover,
    .wall-toggle button:focus-visible {
        background: var(--surface-soft);
        color: var(--ink) !important;
        outline: none;
    }

    .wall-toggle button.active-wall {
        background: var(--toggle-selected-bg);
        color: var(--toggle-selected-text) !important;
    }

    .wall-toggle button.active-wall:hover,
    .wall-toggle button.active-wall:focus-visible {
        background: var(--toggle-selected-bg);
        color: var(--toggle-selected-text) !important;
    }

    .snapshot-date {
        flex: 0 0 auto;
        margin: 0;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0;
    }

    .listens-board {
        display: grid;
        grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
        gap: 1.25rem;
        align-items: start;
    }

    .selected-album {
        position: sticky;
        top: 2rem;
        border: 1px solid var(--line);
        border-radius: 0.5rem;
        background: linear-gradient(180deg, var(--surface), var(--surface-soft));
        box-shadow: 0 18px 44px -34px var(--shadow);
        padding: 1rem;
    }

    .selected-kicker {
        margin: 0 0 0.65rem;
        color: var(--accent) !important;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0;
    }

    .selected-album h2 {
        margin: 0;
        color: var(--ink);
        font-size: 1.35rem;
        line-height: 1.18;
    }

    .selected-album p {
        margin: 0.65rem 0 1rem;
        line-height: 1.45;
    }

    .selected-album .selected-scrobbles {
        margin-top: -0.35rem;
        color: var(--accent) !important;
        font-size: 0.82rem;
    }

    .selected-track-list {
        border-block: 1px solid var(--line);
        margin: 1rem 0;
        padding: 0.75rem 0;
    }

    .selected-track-list p {
        margin: 0 0 0.55rem;
        color: var(--muted) !important;
        font-size: 0.72rem;
        letter-spacing: 0;
        text-transform: uppercase;
    }

    .selected-track-list div {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.75rem;
        align-items: baseline;
        color: var(--ink);
        font-size: 0.82rem;
        line-height: 1.25;
    }

    .selected-track-list div + div {
        margin-top: 0.38rem;
    }

    .selected-track-list span:first-child {
        min-width: 0;
        color: var(--ink) !important;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .selected-track-list span:last-child {
        color: var(--accent) !important;
        font-size: 0.74rem;
    }

    .selected-album a {
        color: var(--accent) !important;
        text-decoration: underline;
        text-decoration-thickness: 0.08em;
        text-underline-offset: 0.18em;
    }

    .album-wall {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(4.6rem, 1fr));
        gap: 0.34rem;
        align-items: start;
    }

    figure {
        position: relative;
        margin: 0;
        aspect-ratio: 1;
        border: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
        background: var(--surface-soft);
        overflow: visible;
        transition: opacity 0.2s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    figure.active-tile {
        z-index: 4;
        border-color: var(--accent);
        box-shadow: 0 20px 38px -28px var(--shadow);
    }

    .album-tile {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        background: transparent;
        cursor: pointer;
        padding: 0;
        outline: none;
    }

    .album-tile:focus-visible {
        box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.28);
    }

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #111827;
    }

    figcaption {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 0.45rem);
        z-index: 5;
        display: none;
        width: max-content;
        max-width: min(14rem, 65vw);
        transform: translateX(-50%);
        border: 1px solid var(--line);
        border-radius: 0.35rem;
        background: var(--surface);
        box-shadow: 0 16px 28px -22px var(--shadow);
        color: var(--ink);
        padding: 0.45rem 0.55rem;
        pointer-events: none;
    }

    figure:hover figcaption,
    figure:focus-within figcaption {
        display: grid;
        gap: 0.12rem;
    }

    figcaption span:first-child {
        color: var(--ink) !important;
        font-size: 0.78rem;
        line-height: 1.2;
    }

    figcaption span:not(:first-child) {
        color: var(--muted) !important;
        font-size: 0.68rem;
        line-height: 1.2;
    }

    .empty-listens {
        border: 1px dashed var(--line);
        border-radius: 0.5rem;
        padding: 1.25rem;
    }

    .empty-listens h2 {
        margin: 0 0 0.5rem;
        color: var(--ink);
        font-size: 1.25rem;
    }

    .empty-listens p {
        margin: 0;
        line-height: 1.5;
    }

    @media (max-width: 760px) {
        .listens-header,
        .listens-board {
            display: block;
        }

        .listening-ledger {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: -0.75rem;
        }

        .year-panel {
            grid-template-columns: 1fr;
        }

        .wall-toolbar {
            display: block;
        }

        .wall-toggle {
            display: flex;
            width: 100%;
            margin-top: 0.85rem;
        }

        .wall-toggle button {
            flex: 1 1 0;
        }

        .snapshot-date {
            margin-top: 1rem;
        }

        .selected-album {
            position: sticky;
            top: max(0.65rem, env(safe-area-inset-top));
            z-index: 12;
            margin-bottom: 1rem;
            max-height: min(52vh, 26rem);
            overflow: auto;
            -webkit-overflow-scrolling: touch;
        }

        .selected-album h2 {
            font-size: 1.2rem;
        }

        .selected-album p {
            margin-block: 0.55rem 0.8rem;
        }

        .selected-track-list {
            margin: 0.75rem 0;
            padding: 0.65rem 0;
        }

        .album-wall {
            grid-template-columns: repeat(auto-fill, minmax(4.25rem, 1fr));
        }
    }

    @media (hover: none) {
        figcaption {
            display: none !important;
        }

        .album-wall.pinned-selection figure:not(.active-tile) {
            opacity: 0.42;
        }
    }

    @media (hover: hover) {
        .album-wall:has(figure:hover) figure:not(:hover),
        .album-wall:has(figure:focus-within) figure:not(:focus-within) {
            opacity: 0.42;
        }

        figure:hover,
        figure:focus-within,
        figure.active-tile {
            transform: translateY(-2px) scale(1.04);
        }
    }
</style>
