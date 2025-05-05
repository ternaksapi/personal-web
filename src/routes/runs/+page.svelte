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
    const stats = data?.stats || { totalRuns: 0, totalDistance: '0.0', longestRun: '0.0', year: new Date().getFullYear() };
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
    
    // Set up intersection observer to only render maps when they're near the viewport
    onMount(() => {
        if (!browser) return;
        
        function setupObserver() {
            // Wait for DOM to update
            tick().then(() => {
                const mapContainers = document.querySelectorAll('.map-container');
                
                if (!mapContainers.length) return;
                
                const observer = new IntersectionObserver((entries) => {
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
                    observer.observe(container);
                });
            });
        }
        
        // Initial setup
        setupObserver();
        
        // Setup observer again when page changes
        $: if (currentPage !== undefined) {
            tick().then(setupObserver);
        }
    });
</script>

<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-lg lg:max-w-lg">
    <Header />
    
    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <h1 class="text-3xl font-bold mb-6">{stats?.year || new Date().getFullYear()} Running Stats</h1>
        
        {#if error}
            <div class="w-full text-center py-10 text-slate-300">
                <p>{error}</p>
            </div>
        {:else}
            <!-- Stats cards -->
            <div class="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-slate-700 bg-opacity-50 p-4 rounded-md">
                    <h3 class="text-sm text-slate-400 mb-1">Total Runs</h3>
                    <p class="text-2xl font-bold text-slate-200">{stats.totalRuns}</p>
                </div>
                <div class="bg-slate-700 bg-opacity-50 p-4 rounded-md">
                    <h3 class="text-sm text-slate-400 mb-1">Total Distance</h3>
                    <p class="text-2xl font-bold text-slate-200">{stats.totalDistance} km</p>
                </div>
                <div class="bg-slate-700 bg-opacity-50 p-4 rounded-md">
                    <h3 class="text-sm text-slate-400 mb-1">Longest Run</h3>
                    <p class="text-2xl font-bold text-slate-200">{stats.longestRun} km</p>
                </div>
            </div>
            
            <!-- Activity list with pagination -->
            <div class="w-full">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">{stats?.year || new Date().getFullYear()} Activities</h2>
                    {#if totalPages > 1}
                        <div class="text-sm text-slate-400">
                            Page {currentPage + 1} of {totalPages}
                        </div>
                    {/if}
                </div>
                
                {#if activities.length === 0}
                    <div class="bg-slate-700 bg-opacity-30 p-8 rounded-md text-center">
                        <p class="text-slate-300">No running activities found for {stats?.year || new Date().getFullYear()}</p>
                    </div>
                {:else}
                    <div class="space-y-6">
                        {#each paginatedActivities as activity, index (activity.id)}
                            <div class="bg-slate-700 bg-opacity-30 p-4 rounded-md hover:bg-opacity-40 transition-all">
                                <div class="flex justify-between items-start">
                                    <h3 class="font-semibold text-lg">{activity.name}</h3>
                                    <span class="text-sm text-slate-400">{activity.date}</span>
                                </div>
                                <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
                                    <div>
                                        <span class="text-xs text-slate-400">Distance</span>
                                        <p class="text-slate-200">{activity.distance} km</p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-slate-400">Time</span>
                                        <p class="text-slate-200">{activity.time}</p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-slate-400">Pace</span>
                                        <p class="text-slate-200">{activity.pace} /km</p>
                                    </div>
                                    <div>
                                        <span class="text-xs text-slate-400">Elevation</span>
                                        <p class="text-slate-200">{activity.elevation} m</p>
                                    </div>
                                </div>
                                
                                <!-- Map section (always shown but loaded lazily) -->
                                <div class="mt-3 map-container" data-activity-id={activity.id}>
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
    /* Remove unused style */
    /* .runs {
        text-align: center;
        display: block;
        margin: 20px auto;
    } */
</style>

