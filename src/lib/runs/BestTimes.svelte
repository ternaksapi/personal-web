<script>
    import { createEventDispatcher } from 'svelte';
    import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
    import { bestEfforts, effortTime } from './best-efforts.js';
    import { paceLabel } from './atlas.js';
    export let runs = [];
    export let period = 'All time';
    const dispatch = createEventDispatcher();
    $: records = bestEfforts(runs);
</script>

<section class="best-times" aria-label="Best running times">
    <div class="records-heading"><h2>Best times</h2><span>{period}</span></div>
    <p class="records-note">GPS estimates. Elapsed time, including stops.</p>
    <div class="records-grid">
        {#each records as record (record.meters)}
            <div class="distance-record" data-distance={record.label}>
                <h3>{record.label}</h3>
                <strong>{effortTime(record.seconds)}</strong>
                <span class="record-pace">{record.seconds === null ? '--' : paceLabel(record.seconds / record.meters * 1000)} <small>/km</small></span>
                {#if record.run}
                    <button type="button" class="record-source" aria-haspopup="dialog" aria-label={`View ${record.label} best effort, ${record.run.shortDate}`} title={record.run.name} on:click={() => dispatch('select', record.run.id)}>{record.run.shortDate}<ArrowUpRight size={14}/></button>
                {:else}<span class="record-empty">No recorded effort</span>{/if}
            </div>
        {/each}
    </div>
</section>

<style>
    .best-times { padding: 28px 0; border-bottom: 1px solid var(--atlas-line); }
    .records-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .records-heading h2 { font-size: 1.15rem; margin: 0; }
    .records-heading > span { color: var(--atlas-muted); font-size: 0.8rem; }
    .records-note { font-size: 0.78rem; color: var(--atlas-muted) !important; margin: 8px 0 24px; }
    .records-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
    .distance-record { min-width: 0; }
    h3 { font-size: 0.95rem; font-weight: 400; color: var(--atlas-orange); margin: 0 0 10px; }
    strong { display: block; font-size: 1.8rem; line-height: 1.15; font-weight: 400; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .record-pace { display: block; font-size: 1rem; margin-top: 5px; font-variant-numeric: tabular-nums; }
    small { font-size: 0.78rem; color: var(--atlas-muted); }
    .record-source { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; max-width: 100%; text-align: left; font-size: 0.78rem; color: var(--atlas-muted); }
    .record-source :global(svg) { flex-shrink: 0; }
    .record-source:hover { color: var(--atlas-ink); text-decoration: underline; }
    .record-source:focus-visible { outline: 2px solid var(--atlas-orange); outline-offset: 3px; }
    .record-empty { display: flex; align-items: center; min-height: 44px; font-size: 0.78rem; color: var(--atlas-muted); }
    @media (max-width: 600px) {
        .records-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 16px; }
        strong { font-size: 1.65rem; }
        .records-heading h2 { font-size: 1.05rem; }
    }
</style>
