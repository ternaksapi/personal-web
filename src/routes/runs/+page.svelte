<script>
    import Header from "$lib/header.svelte";
    import RouteMap from "$lib/RouteMap.svelte";
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { tick } from 'svelte';
    
    // Only import the polyline helper in the browser
    onMount(() => {
        if (browser) {
            import('$lib/polyline.js');
        }
    });
    
    // Get the data loaded from the server
    export let data;
    
    // Destructure the data with safe defaults
    const activities = data?.activities || [];
    const stats = data?.stats || { totalRuns: 0, totalDistance: '0.0', longestRun: '0.0', year: new Date().getFullYear(), bestEfforts: [] };
    const error = data?.error || null;
    
    // Pagination state
    let currentPage = 0;
    const ITEMS_PER_PAGE = 5;
    
    // Compute paged activities
    $: totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
    $: paginatedActivities = activities.slice(
        currentPage * ITEMS_PER_PAGE, 
        (currentPage + 1) * ITEMS_PER_PAGE
    );
    
    // Page navigation
    function nextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    function goToPage(page) {
        if (page >= 0 && page < totalPages) {
            currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // Track which maps are visible based on intersection observer
    let visibleMaps = {};
    let mapObserver = null;
    let setupMapObserver = () => {};

    $: if (browser && currentPage !== undefined) {
        tick().then(() => setupMapObserver());
    }
    
    // Set up intersection observer to only render maps when they're near the viewport
    onMount(() => {
        if (!browser) return;
        
        setupMapObserver = function setupObserver() {
            // Wait for DOM to update
            tick().then(() => {
                const mapContainers = document.querySelectorAll('.map-container');
                
                if (!mapContainers.length) return;

                if (mapObserver) {
                    mapObserver.disconnect();
                }
                
                mapObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        const id = entry.target.dataset.activityId;
                        if (entry.isIntersecting) {
                            // Mark this map as visible when it enters viewport
                            visibleMaps[id] = true;
                            visibleMaps = {...visibleMaps}; // Trigger reactivity
                        }
                    });
                }, {
                    rootMargin: '200px', // Load maps when they're within 200px of viewport
                    threshold: 0.1
                });
                
                // Observe all map containers
                mapContainers.forEach(container => {
                    mapObserver.observe(container);
                });
            });
        };
        
        // Initial setup
        setupMapObserver();
        
        return () => mapObserver?.disconnect();
    });
</script>

<svelte:head>
    <title>Running</title>
</svelte:head>

<div class="runs-shell transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-xl lg:max-w-2xl">
    <Header />
    
    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <h1 class="text-3xl font-bold mb-6">{stats?.year || new Date().getFullYear()} Running Stats</h1>
        
        {#if error}
            <div class="w-full text-center py-10 text-slate-300">
                <p>{error}</p>
            </div>
        {:else}
            <p class="run-year-summary">
                This year, I've logged <strong>{stats.totalRuns}</strong> runs for <strong>{stats.totalDistance} km</strong>, with the longest one stretching <strong>{stats.longestRun} km</strong>.
            </p>

            {#if stats.bestEfforts?.length}
                <section class="w-full mb-8">
                    <div class="run-section-kicker">
                        <p>Fastest equivalents</p>
                        <span>Estimated from each run's average pace.</span>
                    </div>

                    <div class="run-effort-grid">
                        {#each stats.bestEfforts as effort}
                            <div class="run-effort-card">
                                <span>{effort.label}</span>
                                <strong>{effort.time}</strong>
                                {#if effort.activityName}
                                    <small>{effort.pace}/km · {effort.activityDate}</small>
                                {:else}
                                    <small>No eligible run yet</small>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </section>
            {/if}
            
            <!-- Activity list with pagination -->
            <div class="w-full">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">{stats?.year || new Date().getFullYear()} Activities</h2>
                    {#if totalPages > 1}
                        <div class="run-page-count text-sm">
                            Page {currentPage + 1} of {totalPages}
                        </div>
                    {/if}
                </div>
                
                {#if activities.length === 0}
                    <div class="run-empty-card p-8 text-center">
                        <p>No running activities found for {stats?.year || new Date().getFullYear()}</p>
                    </div>
                {:else}
                    <div class="space-y-6">
                        {#each paginatedActivities as activity, index (activity.id)}
                            <div class="run-activity-card">
                                <div class="flex justify-between items-start">
                                    <h3 class="run-activity-title">{activity.name}</h3>
                                    <span class="run-activity-date">{activity.date}</span>
                                </div>
                                <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
                                    <div>
                                        <span class="run-metric-label">Distance</span>
                                        <p class="run-metric-value">{activity.distance} km</p>
                                    </div>
                                    <div>
                                        <span class="run-metric-label">Time</span>
                                        <p class="run-metric-value">{activity.time}</p>
                                    </div>
                                    <div>
                                        <span class="run-metric-label">Pace</span>
                                        <p class="run-metric-value">{activity.pace} /km</p>
                                    </div>
                                    <div>
                                        <span class="run-metric-label">Elevation</span>
                                        <p class="run-metric-value">{activity.elevation} m</p>
                                    </div>
                                </div>
                                
                                <!-- Map section (always shown but loaded lazily) -->
                                <div class="run-map-shell mt-3 map-container" data-activity-id={activity.id}>
                                    <RouteMap 
                                        polyline={activity.map} 
                                        startLat={activity.startLat}
                                        startLng={activity.startLng}
                                        id={activity.id}
                                    />
                                </div>
                            </div>
                        {/each}
                    </div>
                    
                    <!-- Pagination controls -->
                    {#if totalPages > 1}
                        <div class="mt-8 flex justify-center items-center space-x-2">
                            <button 
                                class="px-3 py-1 rounded-md bg-slate-700 bg-opacity-50 text-slate-300 hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                on:click={prevPage}
                                disabled={currentPage === 0}
                                aria-label="Previous page"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            
                            <!-- First page always shown -->
                            <button 
                                class="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                                class:bg-orange-500={currentPage === 0}
                                class:text-white={currentPage === 0}
                                class:text-slate-400={currentPage !== 0}
                                class:hover:bg-slate-700={currentPage !== 0}
                                class:hover:bg-opacity-50={currentPage !== 0}
                                class:hover:text-slate-200={currentPage !== 0}
                                on:click={() => goToPage(0)}
                                aria-label="Go to page 1"
                                aria-current={currentPage === 0 ? 'page' : undefined}
                            >
                                1
                            </button>
                            
                            <!-- Left ellipsis if needed -->
                            {#if currentPage > 2}
                                <span class="text-slate-500 px-1">...</span>
                            {/if}
                            
                            <!-- Pages around current page -->  
                            {#each Array(totalPages) as _, i}
                                {@const pageNum = i}
                                <!-- Only show pages near current page -->
                                {#if pageNum !== 0 && pageNum !== totalPages - 1 && 
                                     (pageNum === currentPage - 1 || 
                                      pageNum === currentPage || 
                                      pageNum === currentPage + 1)}
                                    <button 
                                        class="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                                        class:bg-orange-500={currentPage === pageNum}
                                        class:text-white={currentPage === pageNum}
                                        class:text-slate-400={currentPage !== pageNum}
                                        class:hover:bg-slate-700={currentPage !== pageNum}
                                        class:hover:bg-opacity-50={currentPage !== pageNum}
                                        class:hover:text-slate-200={currentPage !== pageNum}
                                        on:click={() => goToPage(pageNum)}
                                        aria-label={`Go to page ${pageNum + 1}`}
                                        aria-current={currentPage === pageNum ? 'page' : undefined}
                                    >
                                        {pageNum + 1}
                                    </button>
                                {/if}
                            {/each}
                            
                            <!-- Right ellipsis if needed -->
                            {#if currentPage < totalPages - 3}
                                <span class="text-slate-500 px-1">...</span>
                            {/if}
                            
                            <!-- Last page always shown (if not the first page) -->
                            {#if totalPages > 1}
                                <button 
                                    class="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                                    class:bg-orange-500={currentPage === totalPages - 1}
                                    class:text-white={currentPage === totalPages - 1}
                                    class:text-slate-400={currentPage !== totalPages - 1}
                                    class:hover:bg-slate-700={currentPage !== totalPages - 1}
                                    class:hover:bg-opacity-50={currentPage !== totalPages - 1}
                                    class:hover:text-slate-200={currentPage !== totalPages - 1}
                                    on:click={() => goToPage(totalPages - 1)}
                                    aria-label={`Go to page ${totalPages}`}
                                    aria-current={currentPage === totalPages - 1 ? 'page' : undefined}
                                >
                                    {totalPages}
                                </button>
                            {/if}
                            
                            <button 
                                class="px-3 py-1 rounded-md bg-slate-700 bg-opacity-50 text-slate-300 hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                on:click={nextPage}
                                disabled={currentPage === totalPages - 1}
                                aria-label="Next page"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    {/if}
                    
                    <div class="mt-6 w-full text-center">
                        <a 
                            href={`https://www.strava.com/athletes/${activities[0]?.athleteId}`}
                            target="_blank" 
                            class="inline-flex items-center justify-center text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <span>View more on Strava</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .runs-shell {
        --card: #ffffff;
        --card-soft: #f8fafc;
        --ink: #111827;
        --muted: #64748b;
        --line: #d6dce5;
        --accent: #ff6b00;
        --shadow: rgba(15, 23, 42, 0.14);
        --gloss: rgba(255, 255, 255, 0.76);
        --gloss-soft: rgba(255, 255, 255, 0.36);
        --fade: rgba(15, 23, 42, 0.04);
    }

    :global([data-theme="dark"]) .runs-shell {
        --card: #0b1220;
        --card-soft: #111827;
        --ink: #f8fafc;
        --muted: #94a3b8;
        --line: #334155;
        --shadow: rgba(0, 0, 0, 0.46);
        --gloss: rgba(255, 255, 255, 0.13);
        --gloss-soft: rgba(255, 255, 255, 0.07);
        --fade: rgba(0, 0, 0, 0.22);
    }

    .run-effort-card,
    .run-activity-card,
    .run-empty-card {
        isolation: isolate;
        position: relative;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 0.5rem;
        background: linear-gradient(180deg, var(--card), var(--card-soft));
        box-shadow: 0 16px 34px -28px var(--shadow);
        color: var(--ink);
    }

    .run-effort-card::before,
    .run-activity-card::before,
    .run-empty-card::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background:
            radial-gradient(circle at 14% -8%, var(--gloss) 0, transparent 30%),
            linear-gradient(120deg, var(--gloss-soft), transparent 38%),
            linear-gradient(180deg, transparent 42%, var(--fade));
        pointer-events: none;
    }

    .run-effort-card > *,
    .run-activity-card > *,
    .run-empty-card > * {
        position: relative;
        z-index: 1;
    }

    .run-year-summary {
        max-width: 40rem;
        margin: -0.65rem 0 1.65rem;
        color: var(--muted) !important;
        font-size: 1rem;
        line-height: 1.58;
    }

    .run-year-summary strong {
        color: var(--ink) !important;
        font-weight: 700;
    }

    .run-section-kicker {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.65rem;
    }

    .run-section-kicker p {
        margin: 0;
        color: var(--accent) !important;
        font-size: 0.78rem;
        letter-spacing: 0;
        text-transform: uppercase;
    }

    .run-section-kicker span {
        color: var(--muted) !important;
        font-size: 0.78rem;
        text-align: right;
    }

    .run-effort-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.65rem;
    }

    .run-effort-card {
        padding: 0.78rem 0.85rem;
    }

    .run-effort-card span,
    .run-effort-card strong,
    .run-effort-card small {
        display: block;
    }

    .run-effort-card span {
        color: var(--accent) !important;
        font-size: 0.72rem;
        line-height: 1;
        text-transform: uppercase;
    }

    .run-effort-card strong {
        margin-top: 0.5rem;
        color: var(--ink) !important;
        font-size: 1.18rem;
        line-height: 1.05;
    }

    .run-effort-card small {
        margin-top: 0.45rem;
        color: var(--muted) !important;
        font-size: 0.68rem;
        line-height: 1.25;
    }

    .run-page-count,
    .run-activity-date,
    .run-empty-card p {
        color: var(--muted) !important;
    }

    .run-activity-card {
        padding: 1rem;
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    .run-activity-card:hover {
        border-color: rgba(255, 107, 0, 0.48);
        box-shadow: 0 26px 50px -30px var(--shadow);
        transform: translateY(-2px);
    }

    .run-activity-title {
        margin: 0;
        color: var(--ink) !important;
        font-size: 1.125rem;
        font-weight: 700;
        line-height: 1.25;
    }

    .run-activity-date {
        flex: 0 0 auto;
        margin-left: 1rem;
        font-size: 0.875rem;
    }

    .run-metric-label,
    .run-metric-value {
        display: block;
    }

    .run-metric-label {
        color: var(--muted) !important;
        font-size: 0.75rem;
        line-height: 1.35;
    }

    .run-metric-value {
        margin: 0;
        color: var(--ink) !important;
        line-height: 1.35;
    }

    .run-map-shell {
        border-radius: 0.42rem;
        overflow: hidden;
        border: 1px solid color-mix(in srgb, var(--line) 74%, transparent);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .run-empty-card p {
        margin: 0;
    }

    @media (max-width: 640px) {
        .run-effort-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .run-section-kicker {
            display: block;
        }

        .run-section-kicker span {
            display: block;
            margin-top: 0.35rem;
            text-align: left;
        }
    }
</style>

