<script>
    import { onMount } from 'svelte';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import ChevronRight from '@lucide/svelte/icons/chevron-right';
    import { paceLabel } from './atlas.js';
    import { progressChart } from './progress-chart.js';
    export let series = [];
    export let period = 'All time';
    export let importedAt = null;
    let root;
    let svg;
    let width = 900;
    let activeIndex = Math.max(0, series.length - 1);
    let previousSeries = series;
    const decimal = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    $: if (series !== previousSeries) { previousSeries = series; activeIndex = Math.max(0, series.length - 1); }
    $: chart = progressChart(series, width);
    $: active = chart.rows[activeIndex];
    $: animationKey = `${period}:${series[0]?.key}:${series.at(-1)?.key}`;
    $: cutoff = importedAt ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(importedAt)) : '';
    $: cutoffKey = importedAt ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Jakarta' }).formatToParts(new Date(importedAt)).filter(part => part.type !== 'literal').map(part => [part.type, part.value]) : [];
    $: cutoffDate = Object.fromEntries(cutoffKey);
    $: isCurrentMonth = active && Number(cutoffDate.year) === active.year && Number(cutoffDate.month) === active.month + 1;

    onMount(() => {
        const resize = new ResizeObserver(([entry]) => { width = Math.max(180, entry.contentRect.width); });
        resize.observe(root);
        return () => resize.disconnect();
    });
    function inspect(event) {
        if (!svg || !series.length) return;
        const bounds = svg.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * width / bounds.width;
        if (x >= chart.left && x <= chart.right) activeIndex = chart.nearest(x);
    }
    function step(delta) { activeIndex = Math.max(0, Math.min(series.length - 1, activeIndex + delta)); }
</script>

<section class="progress-chart" aria-label="Running progress" bind:this={root}>
    <div class="progress-heading"><h2>Mileage &amp; pace</h2><span>Monthly</span></div>
    {#if active}
        <div class="chart-readout">
            <span class="active-month">{active.label}{#if isCurrentMonth}<small>Through {cutoff}</small>{/if}</span>
            <div><i class="mileage-key"></i><strong data-mileage-value>{decimal.format(active.distance)}<small> km</small></strong><span>{active.count} {active.count === 1 ? 'run' : 'runs'}</span></div>
            <div><i class="pace-key"></i><strong data-pace-value>{paceLabel(active.paceSeconds)}<small> /km</small></strong><span>Moving pace</span></div>
        </div>
        <svg class="progress-svg" bind:this={svg} viewBox={`0 0 ${width} ${chart.height}`} role="img" aria-label="Monthly running distance in kilometres and distance-weighted moving pace in minutes per kilometre" on:pointermove={inspect} on:pointerdown={inspect}>
            <desc>Distance bars and moving pace share the same monthly timeline. Lower pace values appear higher. Months without moving-time data are gaps in the pace line.</desc>
            <text x={chart.left} y="12" class="axis-title">Mileage<tspan dx="4">km</tspan></text>
            <text x={chart.left} y={chart.paceTitleY} class="axis-title">Moving pace<tspan dx="4">min/km</tspan></text>
            {#each chart.mileageTicks as tick}
                <line class="grid-line" x1={chart.left} x2={chart.right} y1={tick.y} y2={tick.y}/>
                <text class="tick-label" x={chart.left - 10} y={tick.y + 4} text-anchor="end">{tick.value}</text>
            {/each}
            {#each chart.paceTicks as tick}
                <line class="grid-line" x1={chart.left} x2={chart.right} y1={tick.y} y2={tick.y}/>
                <text class="tick-label" x={chart.left - 10} y={tick.y + 4} text-anchor="end">{paceLabel(tick.value)}</text>
            {/each}
            {#key animationKey}
                <g class="mileage-series">
                    {#each chart.rows as row}
                        <rect class="mileage-bar" class:active={row.index === activeIndex} x={row.x} y={row.y} width={row.width} height={row.height} style={`animation-delay:${Math.min(row.index * 7, 240)}ms`}/>
                    {/each}
                </g>
                <path class="pace-line" d={chart.pacePath} pathLength="1"/>
                {#each chart.rows.filter(row => row.paceY !== null) as row}<circle class="pace-observation" cx={row.center} cy={row.paceY} r="2"/>{/each}
            {/key}
            <line class="hover-guide" x1={active.center} x2={active.center} y1={chart.mileageTop} y2={chart.paceBottom}/>
            <circle class="mileage-marker" cx={active.center} cy={active.y} r="3.5"/>
            {#if active.paceY !== null}<circle class="pace-marker" cx={active.center} cy={active.paceY} r="4.5"/>{/if}
            {#each chart.ticks as tick}<text class="tick-label month-tick" x={tick.x} y={chart.monthTickY} text-anchor={tick.anchor}>{tick.label}</text>{/each}
        </svg>
        <div class="month-inspector">
            <button type="button" class="step-button" title="Previous month" aria-label="Previous month" disabled={activeIndex === 0} on:click={() => step(-1)}><ChevronLeft size={16}/></button>
            <input type="range" min="0" max={series.length - 1} step="1" value={activeIndex} aria-label="Inspect month" aria-valuetext={`${active.label}, ${decimal.format(active.distance)} kilometres, ${active.paceSeconds === null ? 'no moving pace recorded' : paceLabel(active.paceSeconds) + ' per kilometre'}`} on:input={event => { activeIndex = Number(event.currentTarget.value); }}/>
            <button type="button" class="step-button" title="Next month" aria-label="Next month" disabled={activeIndex === series.length - 1} on:click={() => step(1)}><ChevronRight size={16}/></button>
        </div>
    {:else}<p class="chart-empty">No running data in this period.</p>{/if}
</section>

<style>
    .progress-chart { padding: 26px 0 24px; border-top: 1px solid var(--atlas-line); border-bottom: 1px solid var(--atlas-line); }
    .progress-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .progress-heading h2 { margin: 0; font-size: 1.15rem; }
    .progress-heading > span { font-size: 0.8rem; color: var(--atlas-muted); }
    .chart-readout { display: grid; grid-template-columns: 140px 160px 160px; gap: 24px; align-items: center; margin: 24px 0 22px; min-height: 46px; }
    .active-month { font-size: 1.1rem; }
    .active-month small { display: block; font-size: 0.75rem; color: var(--atlas-muted); margin-top: 3px; }
    .chart-readout > div { display: grid; grid-template-columns: 7px 1fr; gap: 3px 9px; align-items: center; }
    .chart-readout i { width: 6px; height: 6px; border-radius: 50%; }
    .mileage-key { background: var(--atlas-green); }
    .pace-key { background: var(--atlas-orange); }
    .chart-readout strong { font-size: 1.35rem; font-weight: 400; font-variant-numeric: tabular-nums; }
    .chart-readout small { font-size: 0.8rem; color: var(--atlas-muted); margin-left: 3px; }
    .chart-readout div > span { grid-column: 2; font-size: 0.75rem; color: var(--atlas-muted); }
    .progress-svg { width: 100%; height: 382px; overflow: visible; display: block; touch-action: pan-y; }
    .axis-title { font-family: system-ui, sans-serif; fill: var(--atlas-ink); font-size: 12px; }
    .axis-title tspan { fill: var(--atlas-muted); }
    .tick-label { fill: var(--atlas-muted); font-family: system-ui, sans-serif; font-size: 11px; font-variant-numeric: tabular-nums; }
    .grid-line { stroke: var(--atlas-line); stroke-width: 0.7px; }
    .mileage-bar { fill: var(--atlas-green); opacity: 0.5; transform-box: fill-box; transform-origin: center bottom; animation: grow-bar 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .mileage-bar.active { opacity: 1; }
    .pace-line { fill: none; stroke: var(--atlas-orange); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; animation: trace-line 850ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .pace-observation { fill: var(--atlas-orange); }
    .hover-guide { stroke: var(--atlas-muted); opacity: 0.45; stroke-width: 1; stroke-dasharray: 2 4; pointer-events: none; }
    .mileage-marker { fill: var(--atlas-green); stroke: var(--atlas-paper); stroke-width: 2; pointer-events: none; }
    .pace-marker { fill: var(--atlas-orange); stroke: var(--atlas-paper); stroke-width: 2; pointer-events: none; }
    .month-inspector { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
    .month-inspector input { width: 100%; min-width: 0; accent-color: var(--atlas-ink); height: 24px; background: transparent !important; }
    .step-button { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--atlas-line); border-radius: 4px; flex: 0 0 auto; }
    .step-button:hover { background: var(--atlas-soft); }
    .step-button:disabled { opacity: 0.3; }
    .chart-empty { padding: 80px 0; color: var(--atlas-muted) !important; }
    @keyframes grow-bar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes trace-line { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) { .mileage-bar, .pace-line { animation: none; } }
    @media (max-width: 600px) {
        .progress-chart { padding-top: 22px; }
        .progress-svg { height: 334px; }
        .chart-readout { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 20px; margin: 18px 0; }
        .active-month { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.95rem; }
        .active-month small { margin-top: 0; }
        .chart-readout strong { font-size: 1.2rem; }
        .step-button { width: 44px; height: 44px; }
    }
</style>
