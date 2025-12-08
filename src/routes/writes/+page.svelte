<script>
    import Header from "$lib/header.svelte";
    import ArticleCard from "$lib/ArticleCard.svelte";
    
    export let data;
    
    $: articles = data.articles || [];
    
    // Pagination
    let currentPage = 0;
    const itemsPerPage = 5;
    
    $: totalPages = Math.ceil(articles.length / itemsPerPage);
    $: paginatedArticles = articles.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );
    
    function goToPage(page) {
        currentPage = page;
        scrollToTop();
    }
    
    function nextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            scrollToTop();
        }
    }
    
    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            scrollToTop();
        }
    }
    
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
</script>

<svelte:head>
    <title>Writes | Yusuf Haikal</title>
    <meta name="description" content="Articles and thoughts by Muhammad Yusuf Haikal on technology, AI, and software development." />
</svelte:head>

<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-lg lg:max-w-lg">
    <Header />
    
    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <h1 class="text-3xl font-bold mb-4">Writes</h1>
        
        <div class="mb-6 text-slate-400 text-sm leading-relaxed">
            <p>These writings are mostly topics that I thought had many questions about. Articles are published on <a href="https://medium.com/@yusufhaikall" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:text-orange-300 underline">Medium</a>.</p>
        </div>
        
        {#if paginatedArticles.length > 0}
            <div class="w-full grid gap-6">
                {#each paginatedArticles as article}
                    <ArticleCard 
                        title={article.title}
                        excerpt={article.excerpt}
                        image={article.image}
                        href={article.href}
                        date={article.date}
                        readTime={article.readTime}
                    />
                {/each}
            </div>
            
            <!-- Pagination controls -->
            {#if totalPages > 1}
                <div class="mt-8 w-full flex justify-center items-center space-x-2">
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
                    
                    {#each Array(totalPages) as _, i}
                        <button 
                            class="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                            class:bg-orange-500={currentPage === i}
                            class:text-white={currentPage === i}
                            class:text-slate-400={currentPage !== i}
                            class:hover:bg-slate-700={currentPage !== i}
                            class:hover:bg-opacity-50={currentPage !== i}
                            class:hover:text-slate-200={currentPage !== i}
                            on:click={() => goToPage(i)}
                            aria-label={`Go to page ${i + 1}`}
                            aria-current={currentPage === i ? 'page' : undefined}
                        >
                            {i + 1}
                        </button>
                    {/each}
                    
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
        {:else}
            <div class="w-full text-center py-10">
                <p class="text-slate-400">No articles found. Check back soon!</p>
            </div>
        {/if}
    </div>
</div>
