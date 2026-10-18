<script>
    import Header from '$lib/header.svelte';
    import ProgressChart from '$lib/runs/ProgressChart.svelte';
    import BestTimes from '$lib/runs/BestTimes.svelte';
    import AtlasMap from '$lib/runs/AtlasMap.svelte';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import ChevronRight from '@lucide/svelte/icons/chevron-right';
    import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
    import Footprints from '@lucide/svelte/icons/footprints';
    import X from '@lucide/svelte/icons/x';
    import { tick } from 'svelte';
    import { filterRuns, summarize, movingPace, paceLabel, progressSeries } from '$lib/runs/atlas.js';
    import { routeArtwork } from '$lib/runs/geometry.js';

    export let data;
    let year = 'all';
    let selectedId = null;
    let archivePage = 0;
    let dialog;
    const PAGE_SIZE = 6;
    const decimal = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    $: runs = data.atlas || [];
    $: filtered = filterRuns(runs, year);
    $: summary = summarize(filtered);
    $: averagePace = movingPace(filtered);
    $: series = progressSeries(runs, year);
    $: selected = runs.find(run => run.id === selectedId);
    $: totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    $: if (archivePage >= totalPages) archivePage = Math.max(0, totalPages - 1);
    $: archive = filtered.slice(archivePage * PAGE_SIZE, (archivePage + 1) * PAGE_SIZE);
    $: period = year === 'all' ? 'All time' : String(year);

    function setYear(value) { year = value; archivePage = 0; }
    async function selectRun(id) {
        selectedId = id;
        await tick();
        if (!dialog.open) dialog.showModal();
    }
    function closeDetails() { selectedId = null; }
    function pageArchive(delta) { archivePage = Math.max(0, Math.min(totalPages - 1, archivePage + delta)); }
</script>

<svelte:head><title>Running | kalkalkal.xyz</title><meta name="description" content="My running progress in mileage, pace, and the occasional questionable run title." /></svelte:head>
<div class="running-atlas">
    <div class="header-width"><Header /></div>
    <section class="runs-heading">
        <div><p class="eyebrow">On foot, since {data.years?.[0] || new Date().getFullYear()}</p><h1>Running</h1><p class="intro">I like to run once in a while.</p></div>
        <a class="archive-link" href="#run-journal">The journal <ArrowUpRight size={15}/></a>
    </section>
    {#if !runs.length}
        <p class="empty">No runs imported yet.</p>
    {:else}
        <div class="period-controls" role="group" aria-label="Filter runs by year">
            <button type="button" class:active={year === 'all'} aria-pressed={year === 'all'} on:click={() => setYear('all')}>All time</button>
            {#each data.years as value}<button type="button" class:active={year === value} aria-pressed={year === value} on:click={() => setYear(value)}>{value}</button>{/each}
        </div>
        <div class="totals" aria-live="polite">
            <div><strong>{decimal.format(summary.distance)}<span> km</span></strong><small>Distance</small></div>
            <div><strong>{summary.count}</strong><small>Runs</small></div>
            <div><strong>{paceLabel(averagePace)}<span> /km</span></strong><small>Moving pace</small></div>
            <p>{period}</p>
        </div>
        <ProgressChart {series} {period} importedAt={data.importedAt}/>
        <BestTimes runs={filtered} {period} on:select={event => selectRun(event.detail)}/>
        <section id="run-journal" class="route-collection" aria-label="Run journal">
            <div class="section-heading"><h2>The run journal</h2><span class="muted">{summary.count} {summary.count === 1 ? 'entry' : 'entries'}</span></div>
            {#if archive.length}
                <div class="route-grid">
                    {#each archive as run (run.id)}
                        <button class="route-print" type="button" aria-haspopup="dialog" aria-label={`View ${run.name}, ${run.shortDate}, ${run.distance} kilometers`} on:click={() => selectRun(run.id)}>
                            <span class="print-date">{run.shortDate}</span>
                            <div class="print-art">{#if run.segments.length}<svg class="route-glyph" viewBox="0 0 240 120" aria-hidden="true"><path d={routeArtwork(run.segments)}/></svg>{:else}<div class="missing-art"><Footprints size={24} aria-hidden="true"/><span>No GPS recorded</span></div>{/if}</div>
                            <span class="print-title">{run.name}</span>
                            <span class="print-meta">{run.distance} km <span>{run.pace} /km</span></span>
                        </button>
                    {/each}
                </div>
                {#if totalPages > 1}
                    <div class="archive-pagination"><span class="muted">{archivePage * PAGE_SIZE + 1}–{Math.min(filtered.length, (archivePage + 1) * PAGE_SIZE)} of {filtered.length}</span><div><button class="icon-button" type="button" aria-label="Previous runs" title="Previous runs" disabled={archivePage === 0} on:click={() => pageArchive(-1)}><ChevronLeft size={18}/></button><span>{archivePage + 1} / {totalPages}</span><button class="icon-button" type="button" aria-label="Next runs" title="Next runs" disabled={archivePage === totalPages - 1} on:click={() => pageArchive(1)}><ChevronRight size={18}/></button></div></div>
                {/if}
            {:else}<p class="empty">No runs in {period}.</p>{/if}
        </section>
    {/if}

    <dialog class="run-dialog" bind:this={dialog} aria-labelledby="run-detail-title" on:close={closeDetails}>
        {#if selected}
            <div class="detail-top"><p class="eyebrow">{selected.date}</p><button type="button" class="icon-button" aria-label="Close run details" title="Close run details" on:click={() => dialog.close()}><X size={18}/></button></div>
            <h2 id="run-detail-title">{selected.name}</h2>
            <dl class="run-metrics">
                <div><dt>Distance</dt><dd>{selected.distance}<span> km</span></dd></div>
                <div><dt>{selected.timeBasis === 'elapsed' ? 'Elapsed time' : 'Moving time'}</dt><dd>{selected.time}</dd></div>
                <div><dt>Avg. pace</dt><dd>{selected.pace}<span> /km</span></dd></div>
                <div><dt>Elevation gain</dt><dd>{selected.elevation}<span> m</span></dd></div>
            </dl>
            {#if selected.segments.length}
                <div class="detail-map"><AtlasMap runs={[selected]} selectedId={selected.id}/></div>
            {:else}<p class="muted">No GPS route recorded for this run.</p>{/if}
        {/if}
    </dialog>
</div>

<style>
    .running-atlas { --atlas-paper: #fff; --atlas-ink: #191b1a; --atlas-muted: #656c68; --atlas-line: #dce0dc; --atlas-soft: #f1f4f1; --atlas-orange: #d34c1d; --atlas-green: #267b5d; width: 100%; max-width: 960px; color: var(--atlas-ink); letter-spacing: 0; }
    :global([data-theme="dark"]) .running-atlas { --atlas-paper: #090b0a; --atlas-ink: #f1f3ef; --atlas-muted: #a5afa7; --atlas-line: #303831; --atlas-soft: #171e19; --atlas-orange: #f67b42; --atlas-green: #7abc9c; }
    .running-atlas :global(p), .running-atlas :global(h1), .running-atlas :global(h2) { color: var(--atlas-ink); }
    .header-width { max-width: 672px; margin-inline: auto; }
    .runs-heading { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin: 48px 0 26px; }
    .eyebrow { font-size: 0.8rem; color: var(--atlas-muted) !important; margin: 0 0 8px; }
    h1 { font-size: 2.5rem; line-height: 1.05; font-weight: 400; margin: 0; }
    .intro { margin: 10px 0 0; font-size: 0.95rem; line-height: 1.4; color: var(--atlas-muted) !important; }
    .archive-link { display: inline-flex; align-items: center; gap: 4px; color: var(--atlas-muted) !important; font-size: 0.85rem; white-space: nowrap; padding-bottom: 4px; }
    .period-controls { display: flex; flex-wrap: wrap; gap: 2px; border-bottom: 1px solid var(--atlas-line); padding-bottom: 8px; }
    .period-controls button { font-family: inherit; font-size: 0.85rem; padding: 7px 13px; border-radius: 3px; color: var(--atlas-muted); }
    .period-controls button:hover { background: var(--atlas-soft); }
    .period-controls button.active { color: var(--atlas-paper) !important; background: var(--atlas-ink); }
    .totals { display: flex; align-items: center; gap: 48px; padding: 22px 0; }
    .totals strong { display: block; font-size: 1.65rem; font-weight: 400; line-height: 1.15; font-variant-numeric: tabular-nums; }
    .totals strong span { font-size: 0.95rem; color: var(--atlas-muted); margin-left: 4px; }
    .totals small { font-size: 0.78rem; color: var(--atlas-muted); display: block; margin-top: 3px; }
    .totals p { font-size: 0.85rem; margin-left: auto; color: var(--atlas-muted) !important; }
    .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 22px; }
    .section-heading h2 { font-size: 1.15rem; margin: 0; }
    .section-heading > span { font-size: 0.8rem; }
    .muted { color: var(--atlas-muted) !important; }
    .route-collection { padding-top: 32px; scroll-margin-top: 24px; }
    .route-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .route-print { text-align: left; border: 1px solid var(--atlas-line); border-radius: 5px; padding: 16px; background: var(--atlas-paper); display: grid; grid-template-rows: 20px 124px minmax(48px, auto) 24px; gap: 8px; min-width: 0; }
    .route-print:hover { background: var(--atlas-soft); border-color: var(--atlas-muted); }
    .print-date { color: var(--atlas-muted); font-size: 0.75rem; }
    .print-art { display: grid; place-items: center; color: var(--atlas-muted); overflow: hidden; }
    .print-art .route-glyph { width: 100%; height: 120px; }
    .route-glyph path { fill: none; stroke: var(--atlas-orange); stroke-width: 1.65px; stroke-linejoin: round; stroke-linecap: round; }
    .missing-art { display: grid; justify-items: center; gap: 8px; font-size: 0.75rem; }
    .print-title { font-size: 1rem; line-height: 1.3; overflow-wrap: anywhere; }
    .print-meta { display: flex; align-items: end; justify-content: space-between; gap: 8px; font-size: 0.8rem; }
    .print-meta > span { color: var(--atlas-muted); }
    .archive-pagination { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 24px; font-size: 0.8rem; }
    .archive-pagination > div { display: flex; align-items: center; gap: 12px; }
    .icon-button { width: 34px; height: 34px; display: inline-grid; place-items: center; border: 1px solid var(--atlas-line); border-radius: 4px; background: var(--atlas-paper); flex: 0 0 auto; }
    .icon-button:hover { background: var(--atlas-soft); }
    .icon-button:disabled { opacity: 0.3; }
    .empty { color: var(--atlas-muted) !important; padding: 40px 0; }
    .run-dialog { width: min(760px, calc(100% - 32px)); max-height: calc(100dvh - 48px); padding: 24px; border: 1px solid var(--atlas-line); border-radius: 6px; color: var(--atlas-ink); background: var(--atlas-paper); overscroll-behavior: contain; }
    .run-dialog::backdrop { background: #0009; }
    :global(body:has(.run-dialog[open])) { overflow: hidden; }
    .detail-top { display: flex; justify-content: space-between; align-items: start; gap: 12px; }
    .detail-top p { padding-top: 8px; }
    .run-dialog h2 { font-size: 1.5rem; line-height: 1.25; margin: 8px 0 24px; overflow-wrap: anywhere; }
    .run-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 24px; }
    dt { font-size: 0.78rem; color: var(--atlas-muted); }
    dd { font-size: 1.25rem; margin: 3px 0 0; font-variant-numeric: tabular-nums; }
    dd span { font-size: 0.85rem; color: var(--atlas-muted); margin-left: 4px; }
    .detail-map :global(.atlas-map) { height: 300px; }
    @media (max-width: 760px) { .route-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .totals { gap: 26px; } }
    @media (max-width: 600px) {
        .runs-heading { margin: 34px 0 22px; flex-wrap: wrap; }
        h1 { font-size: 2rem; }
        .archive-link { font-size: 0.8rem; }
        .period-controls { flex-wrap: nowrap; justify-content: space-between; gap: 0; }
        .period-controls button { padding: 9px 7px; font-size: 0.8rem; min-height: 40px; }
        .totals { display: grid; grid-template-columns: 1.4fr 0.8fr 1fr; gap: 16px 8px; }
        .totals strong { font-size: 1.4rem; white-space: nowrap; }
        .totals strong span { font-size: 0.8rem; }
        .totals p { display: none; }
        .section-heading h2 { font-size: 1.05rem; }
        .route-grid { grid-template-columns: minmax(0, 1fr); }
        .route-print { grid-template-rows: 20px 124px minmax(30px, auto) 24px; }
        .icon-button { width: 40px; height: 40px; }
        .run-dialog { padding: 18px; }
        .run-dialog h2 { font-size: 1.25rem; }
        .run-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .detail-map :global(.atlas-map) { height: 260px; }
    }
    @media (max-width: 360px) { .period-controls button { padding-inline: 5px; } .totals strong { font-size: 1.2rem; } }
</style>
