<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import Plus from '@lucide/svelte/icons/plus';
    import Minus from '@lucide/svelte/icons/minus';
    import Scan from '@lucide/svelte/icons/scan';
    import LocateFixed from '@lucide/svelte/icons/locate-fixed';
    import { routeArtwork } from './geometry.js';
    import { env } from '$env/dynamic/public';
    import { theme } from '$lib/theme.js';
    export let runs = [];
    export let selectedId = null;
    const dispatch = createEventDispatcher();
    let container, map, L, layers, renderedRuns;
    let lines = new Map();
    let unavailable = false;
    let tilesFailed = false;
    let view = 'route';
    let basemap;
    let mapboxFailed = false;
    let hasMapbox = false;
    let basemapKey;

    $: if (map && runs !== renderedRuns) renderRuns(runs);
    $: if (map) highlight(selectedId, runs);
    $: if (map) updateBasemap($theme);
    $: fallback = routeArtwork(runs.find(run => run.id === selectedId)?.segments || [], 600, 340);
    $: hasSelectedRoute = Boolean(runs.find(run => run.id === selectedId)?.segments.length);

    onMount(() => {
        let disposed = false;
        let resize;
        (async () => {
            try {
                const [leaflet] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]);
                if (disposed) return;
                L = leaflet.default;
                map = L.map(container, { center: [-2.5, 118], zoom: 4, zoomControl: false, scrollWheelZoom: false, preferCanvas: true, attributionControl: true, zoomAnimation: false, fadeAnimation: false });
                map.attributionControl.setPrefix(false);
                layers = L.layerGroup().addTo(map);
                resize = new ResizeObserver(() => {
                    if (!map) return;
                    map.invalidateSize({ pan: false });
                    if (view === 'route') focusSelected(); else overview();
                });
                resize.observe(container);
                renderRuns(runs);
                highlight(selectedId, runs);
                updateBasemap($theme);
            } catch (error) {
                if (!disposed) { unavailable = true; console.warn('Running atlas initialization failed:', error.message); }
            }
        })();
        return () => { disposed = true; resize?.disconnect(); map?.remove(); map = null; };
    });

    function updateBasemap(appearance) {
        if (!L) return;
        const token = env.PUBLIC_MAPBOX_ACCESS_TOKEN || '';
        const useMapbox = token.startsWith('pk.') && !mapboxFailed;
        const key = useMapbox ? appearance : 'osm';
        if (key === basemapKey) return;
        basemapKey = key;
        basemap?.remove();
        hasMapbox = useMapbox;
        if (useMapbox) import('mapbox-gl/dist/mapbox-gl.css');
        const url = useMapbox
            ? `https://api.mapbox.com/styles/v1/mapbox/${appearance === 'dark' ? 'dark-v11' : 'light-v11'}/tiles/256/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`
            : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        basemap = L.tileLayer(url, {
            maxZoom: 19, updateWhenIdle: true, keepBuffer: 1,
            attribution: `${useMapbox ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> ' : ''}&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>`
        }).on('tileerror', () => {
            if (basemapKey !== key) return;
            if (useMapbox) { mapboxFailed = true; updateBasemap(appearance); }
            else tilesFailed = true;
        }).on('tileload', () => { if (basemapKey === key) tilesFailed = false; }).addTo(map);
    }

    function fit(segments) {
        const points = segments.flat();
        if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [35, 35], maxZoom: 17, animate: false });
        else map.setView([-2.5, 118], 4, { animate: false });
    }
    function renderRuns(values) {
        if (!layers) return;
        renderedRuns = values;
        layers.clearLayers();
        lines = new Map();
        for (const run of values) {
            if (!run.segments.length) continue;
            const line = L.polyline(run.segments, { color: '#e85820', weight: 2.5, opacity: 0.22, smoothFactor: 0.4 }).addTo(layers);
            line.on('click', () => dispatch('select', run.id));
            line.bindTooltip(document.createTextNode(run.name), { sticky: true, direction: 'top' });
            lines.set(run.id, line);
        }
        if (!values.some(run => run.id === selectedId && run.segments.length)) overview();
    }
    function highlight(id, values) {
        if (!layers) return;
        for (const [key, line] of lines) line.setStyle({ opacity: key === id ? 0.9 : 0.2, weight: key === id ? 3 : 2 });
        const run = values.find(run => run.id === id);
        lines.get(id)?.bringToFront();
        if (run?.segments.length) { fit(run.segments); view = 'route'; }
        else overview();
    }
    export function focusSelected() {
        const run = runs.find(run => run.id === selectedId);
        if (map && run?.segments.length) { fit(run.segments); view = 'route'; }
    }
    function overview() {
        if (!map) return;
        fit(runs.flatMap(run => run.segments));
        view = 'all';
    }
</script>

<div class="atlas-map" class:unavailable class:has-mapbox={hasMapbox}>
    <div class="map-canvas" bind:this={container} role="region" aria-label="Running route map"></div>
    {#if unavailable}<div class="map-fallback"><svg viewBox="0 0 600 340" role="img" aria-label="Selected running route"><path d={fallback} /></svg><span>Interactive map unavailable</span></div>{/if}
    <div class="map-caption"><span class="map-dot"></span>{view === 'all' ? 'All filtered routes' : 'Selected route'}</div>
    <div class="map-tools">
        <button type="button" aria-label="Zoom in" title="Zoom in" disabled={!map} on:click={() => map?.zoomIn()}><Plus size={17}/></button>
        <button type="button" aria-label="Zoom out" title="Zoom out" disabled={!map} on:click={() => map?.zoomOut()}><Minus size={17}/></button>
        <button type="button" aria-label="Show all filtered routes" title="Show all filtered routes" disabled={!map} on:click={overview}><Scan size={17}/></button>
        <button type="button" aria-label="Focus selected run" title="Focus selected run" disabled={!map || !hasSelectedRoute} on:click={focusSelected}><LocateFixed size={17}/></button>
    </div>
    {#if tilesFailed}<span class="tile-notice" role="status">Street map unavailable</span>{/if}
    {#if hasMapbox}<a class="mapboxgl-ctrl-logo mapbox-wordmark" href="https://www.mapbox.com/about/maps/" aria-label="Mapbox" target="_blank" rel="noreferrer"></a>{/if}
</div>

<style>
    .atlas-map { position: relative; height: 460px; isolation: isolate; background: var(--atlas-soft); overflow: hidden; }
    .map-canvas, .map-fallback { position: absolute; inset: 0; }
    .map-canvas { background: var(--atlas-soft); }
    .map-fallback { display: grid; place-items: center; color: var(--atlas-muted); }
    .map-fallback svg { width: 100%; height: 85%; }
    .map-fallback path { stroke: var(--atlas-orange); fill: none; stroke-width: 2; }
    .map-fallback span { position: absolute; bottom: 1rem; font-size: 0.8rem; }
    .map-caption { position: absolute; z-index: 500; left: 14px; top: 14px; display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--atlas-paper); color: var(--atlas-ink); border: 1px solid var(--atlas-line); font-size: 0.8rem; border-radius: 4px; pointer-events: none; }
    .map-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--atlas-orange); }
    .map-tools { position: absolute; z-index: 500; top: 14px; right: 14px; display: grid; background: var(--atlas-paper); border: 1px solid var(--atlas-line); border-radius: 4px; }
    .map-tools button { display: grid; place-items: center; width: 36px; height: 36px; background: transparent; color: var(--atlas-ink); }
    .map-tools button + button { border-top: 1px solid var(--atlas-line); }
    .map-tools button:hover { background: var(--atlas-soft); }
    .map-tools button:disabled { opacity: 0.35; }
    .tile-notice { position: absolute; bottom: 28px; left: 12px; z-index: 500; background: var(--atlas-paper); padding: 4px 8px; font-size: 0.75rem; }
    .mapbox-wordmark { position: absolute; left: 8px; bottom: 8px; z-index: 500; }
    :global([data-theme="dark"]) .mapbox-wordmark { filter: invert(1); }
    .atlas-map :global(.leaflet-tile-pane) { filter: grayscale(1) contrast(0.85); opacity: 0.8; }
    :global([data-theme="dark"]) .atlas-map :global(.leaflet-tile-pane) { filter: grayscale(1) invert(1) contrast(0.85); opacity: 0.7; }
    .atlas-map.has-mapbox :global(.leaflet-tile-pane), :global([data-theme="dark"]) .atlas-map.has-mapbox :global(.leaflet-tile-pane) { filter: grayscale(1); opacity: 1; }
    .atlas-map :global(.leaflet-control-attribution) { background: var(--atlas-paper); color: var(--atlas-muted); font-family: sans-serif; font-size: 10px; }
    .atlas-map :global(.leaflet-control-attribution a) { color: var(--atlas-ink); font-family: sans-serif; }
    .atlas-map :global(.leaflet-tooltip) { white-space: normal; max-width: 240px; color: var(--atlas-ink); background: var(--atlas-paper); border-color: var(--atlas-line); box-shadow: none; }
    .atlas-map :global(.leaflet-pane), .atlas-map :global(.leaflet-tile), .atlas-map :global(canvas) { transition: none; }
    @media (max-width: 600px) { .atlas-map { height: 340px; } .map-tools button { width: 40px; height: 40px; } .map-caption { max-width: calc(100% - 90px); } }
</style>
