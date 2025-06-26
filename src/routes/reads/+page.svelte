<script>
    import Header from "$lib/header.svelte";
    import { supabase } from '$lib/supabase.js';
    import { onMount } from 'svelte';
    
    // Get data from the server load function
    export let data;
    
    let reads = data.reads || [];
    
    // Filter and sort functionality
    let selectedCategory = "All";
    let searchTerm = "";
    
    // Pagination
    let currentPage = 0;
    const itemsPerPage = 5;
    
    // Transform the data to match your original format
    $: transformedReads = reads.map(read => ({
        id: read.id,
        title: read.title,
        author: read.author,
        url: read.url,
        description: read.description,
        tags: read.tags || [],
        dateAdded: read.date_added,
        category: read.category,
        readTime: read.read_time,
        favorite: read.favorite
    }));
    
    $: categories = ["All", ...new Set(transformedReads.map(read => read.category))];
    
    $: filteredReads = transformedReads.filter(read => {
        const matchesCategory = selectedCategory === "All" || read.category === selectedCategory;
        const matchesSearch = read.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            read.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            read.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    }).sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    // Pagination calculations
    $: totalPages = Math.ceil(filteredReads.length / itemsPerPage);
    $: paginatedReads = filteredReads.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );
    
    // Reset to first page when filters change
    $: if (selectedCategory || searchTerm) {
        currentPage = 0;
    }
    
    function goToPage(page) {
        currentPage = page;
    }
    
    function nextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
        }
    }
    
    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
        }
    }
    
    // Function to refresh data
    async function refreshReads() {
        const { data: newReads, error } = await supabase
            .from('reads')
            .select('*')
            .order('date_added', { ascending: false });
            
        if (!error && newReads) {
            reads = newReads;
        }
    }
</script>

<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-lg lg:max-w-lg">
    <Header />
    
    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <h1 class="text-3xl font-bold mb-4">Reading List</h1>
        
        <div class="mb-6 text-slate-400 text-sm leading-relaxed">
            <p>A collection of texts that I found to be interesting. These pieces may not necessarily represent my views, but I found them fascinating enough to bookmark and revisit.</p>
        </div>
        
        <!-- Search and Filter -->
        <div class="w-full mb-6 space-y-4">
            <input
                type="text"
                placeholder="Search articles..."
                bind:value={searchTerm}
                class="w-full px-4 py-2 rounded-md bg-slate-700 bg-opacity-50 text-slate-200 placeholder-slate-400 border border-slate-600 focus:border-orange-500 focus:outline-none"
            />
            
            <div class="flex flex-wrap gap-2">
                {#each categories as category}
                    <button
                        class="px-3 py-1 rounded-full text-sm transition-all"
                        class:bg-orange-500={selectedCategory === category}
                        class:text-white={selectedCategory === category}
                        class:bg-slate-700={selectedCategory !== category}
                        class:bg-opacity-50={selectedCategory !== category}
                        class:text-slate-300={selectedCategory !== category}
                        class:hover:bg-opacity-70={selectedCategory !== category}
                        on:click={() => selectedCategory = category}
                    >
                        {category}
                    </button>
                {/each}
            </div>
        </div>
        
        <!-- Articles List - now using paginatedReads instead of filteredReads -->
        <div class="w-full space-y-4">
            {#each paginatedReads as read (read.id)}
                <article class="bg-slate-700 bg-opacity-30 p-5 rounded-md hover:bg-opacity-40 transition-all group">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
                                    <a href={read.url} target="_blank" rel="noopener noreferrer" class="hover:underline">
                                        {read.title}
                                    </a>
                                </h3>
                                {#if read.favorite}
                                    <span class="text-yellow-400">⭐</span>
                                {/if}
                            </div>
                            <p class="text-sm text-slate-400 mb-2">by {read.author}</p>
                        </div>
                        <div class="flex flex-col items-end text-xs text-slate-500">
                            <span>{read.readTime}</span>
                            <span>{new Date(read.dateAdded).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <p class="text-slate-300 mb-3 text-sm leading-relaxed">{read.description}</p>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex flex-wrap gap-1">
                            {#each read.tags as tag}
                                <span class="px-2 py-1 bg-slate-600 bg-opacity-50 text-xs rounded-md text-slate-300">
                                    #{tag}
                                </span>
                            {/each}
                        </div>
                        
                        <span class="text-xs text-slate-400 bg-slate-600 bg-opacity-30 px-2 py-1 rounded-md">
                            {read.category}
                        </span>
                    </div>
                </article>
            {/each}
        </div>
        
        {#if paginatedReads.length === 0}
            <div class="w-full text-center py-10">
                <p class="text-slate-400">No articles found matching your criteria.</p>
            </div>
        {/if}
        
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
    </div>
</div>

<style>
    .reads {
        text-align: center;
        display: block;
        margin: 20px auto;
    }
</style>

