<script>
    import Header from "$lib/header.svelte";
    
    // Store your reading materials as data
    const reads = [
        {
            id: 1,
            title: "The Gig Economy: Jobs, Benefits, and Dangers",
            author: "Wired Staff",
            url: "https://www.wired.com/story/gig-economy-jobs-benefits-dangers/",
            description: "Examines the rise of the gig economy, highlighting its flexibility and income opportunities alongside challenges like job insecurity, lack of benefits, and regulatory concerns.",
            tags: ["gig-economy", "work", "economics"],
            dateAdded: "2025-06-02",
            category: "Economics",
            readTime: "25 min",
            favorite: false
        },

        {
            id: 2,
            title: "Finding the best sleep tracker",
            author: "Andrej Karpathy",
            url: "https://karpathy.bearblog.dev/finding-the-best-sleep-tracker/",
            description: "A detailed exploration of sleep tracking devices and apps, evaluating their accuracy, usability, and effectiveness in optimizing sleep quality based on personal experiments and data.",
            tags: ["sleep", "technology", "health"],
            dateAdded: "2025-06-02",
            category: "Health",
            readTime: "18 min",
            favorite: false
        },

        {
            id: 3,
            title: "What I learned gathering thousands of nootropic ratings",
            author: "Troof",
            url: "https://troof.blog/posts/nootropics/",
            description: "An analysis of 36,163 nootropic ratings from 2,802 users, exploring effectiveness and side effects through a recommender system, revealing insights on cognitive enhancers like Dexedrine and meditation.",
            tags: ["nootropics", "cognitive-enhancement", "data-analysis"],
            dateAdded: "2025-06-02",
            category: "Science",
            readTime: "20 min",
            favorite: false
        },

        {
            id: 4,
            title: "Rule Genius In, Not Out",
            author: "Scott Alexander",
            url: "https://slatestarcodex.com/2019/02/26/rule-genius-in-not-out/",
            description: "Explores how to identify genius by focusing on evidence of exceptional ability rather than dismissing potential based on flaws, using historical examples like Einstein and Ramanujan.",
            tags: ["genius", "talent", "psychology"],
            dateAdded: "2025-06-02",
            category: "Psychology",
            readTime: "15 min",
            favorite: false
        },
        {
            id: 5,
            title: "Everyone Is Cheating Their Way Through Collegee",
            author: "James D. Walsh",
            url: "https://nymag.com/intelligencer/article/openai-chatgpt-ai-cheating-education-college-students-school.html",
            description: "Investigates the impact of AI tools like ChatGPT on education, exploring how students use them for cheating, the challenges for educators, and potential ways to integrate AI constructively in classrooms.",
            tags: ["artificial-intelligence", "education", "ethics"],
            dateAdded: "2025-06-02",
            category: "Education",
            readTime: "22 min",
            favorite: false
        },
        {
            id: 6,
            title: "For Danantara, Indonesia’s $900bn Sovereign Fund, I Choose Hope",
            author: "Guinandra Jatikusuma",
            url: "https://medium.com/@guinandra/for-danantara-indonesias-900bn-sovereign-fund-i-choose-hope-245c8039ca7d",
            description: "Discusses Indonesia’s ambitious $900 billion sovereign wealth fund, Danantara, highlighting its potential to drive economic growth and innovation while addressing challenges like governance and transparency.",
            tags: ["sovereign-fund", "economics", "indonesia"],
            dateAdded: "2025-06-02",
            category: "Economics",
            readTime: "20 min",
            favorite: false
        },
        {
            id: 7,
            title: "AI",
            author: "Sam Altman",
            url: "https://blog.samaltman.com/ai",
            description: "Sam Altman predicts (2016) that AI will revolutionize industries, enhance productivity, and create new opportunities, while also emphasizing the need for responsible development and ethical considerations.",
            tags: ["artificial-intelligence", "technology", "future"],
            dateAdded: "2025-06-02",
            category: "Technology",
            readTime: "15 min",
            favorite: false
        },
        {
            id: 8,
            title: "National IQs Are Valid",
            author: "Cremieux",
            url: "https://www.cremieux.xyz/p/national-iqs-are-valid",
            description: "Argues for the validity of national IQ estimates, examining their predictive power for economic and social outcomes, while addressing criticisms and methodological challenges in IQ research.",
            tags: ["iq", "psychology", "data-analysis"],
            dateAdded: "2025-06-02",
            category: "Psychology",
            readTime: "25 min",
            favorite: false
        },
        {
            id: 9,
            title: "Conservatives Aren't Stupid",
            author: "Emil Kirkegaard",
            url: "https://www.emilkirkegaard.com/p/conservatives-arent-stupid",
            description: "Challenges the stereotype that conservatives are less intelligent, presenting data on cognitive abilities across political ideologies and arguing for more nuanced understanding of political beliefs.",
            tags: ["politics", "psychology", "intelligence"],
            dateAdded: "2025-06-02",
            category: "Psychology",
            readTime: "20 min",
            favorite: false
        },
        {
            id: 10,
            title: "NASA's 10 Rules for Developing Safety-Critical Code",
            author: "Gerard J. Holzmann",
            url: "https://www.cs.otago.ac.nz/cosc345/resources/nasa-10-rules.htm",
            description: "Outlines NASA's 10 rules for writing reliable, safety-critical software, emphasizing simplicity, verifiability, and rigorous testing to ensure robust code in high-stakes environments.",
            tags: ["programming", "software-engineering", "safety"],
            dateAdded: "2025-06-02",
            category: "Technical",
            readTime: "12 min",
            favorite: false
        },
        {
            id: 11,
            title: "Optimality is the tiger, and agents are its teeth",
            author: "Eliezer Yudkowsky",
            url: "https://www.lesswrong.com/posts/kpPnReyBC54KESiSn/optimality-is-the-tiger-and-agents-are-its-teeth",
            description: "Explores the concept of optimality in AI systems, likening it to a powerful force that shapes agent behavior, with implications for alignment and safety in advanced AI development.",
            tags: ["artificial-intelligence", "alignment", "philosophy"],
            dateAdded: "2025-06-02",
            category: "Philosophy",
            readTime: "18 min",
            favorite: false
        },
        {
            id: 12,
            title: "Another Problem With AI Confinement: Ordinary CPUs Can Work",
            author: "Roman Yampolskiy",
            url: "https://www.lesswrong.com/posts/ddPu9yh65yLmMzxep/another-problem-with-ai-confinement-ordinary-cpus-can-work",
            description: "Discusses challenges in AI confinement, highlighting how standard CPUs can potentially bypass containment measures, raising concerns for ensuring the safety of advanced AI systems.",
            tags: ["artificial-intelligence", "safety", "security"],
            dateAdded: "2025-06-02",
            category: "Technology",
            readTime: "15 min",
            favorite: false
        },
        {
            id: 13,
            title: "The Gods of Straight Lines",
            author: "Narrative Ark",
            url: "https://www.narrativeark.xyz/p/the-gods-of-straight-lines",
            description: "A poetic exploration of humanity's obsession with order and linear progress, contrasting it with the chaotic beauty of nature and questioning the cost of rigid systems.",
            tags: ["philosophy", "culture", "society"],
            dateAdded: "2025-06-02",
            category: "Philosophy",
            readTime: "20 min",
            favorite: false
        },
        {
            id: 14,
            title: "Friendly And Hostile Analogies For AI",
            author: "Scott Alexander",
            url: "https://www.astralcodexten.com/p/friendly-and-hostile-analogies-for",
            description: "Examines how different analogies for AI shape our understanding and expectations, comparing optimistic 'friendly' metaphors with cautionary 'hostile' ones to highlight their impact on AI development and safety.",
            tags: ["artificial-intelligence", "philosophy", "ethics"],
            dateAdded: "2025-06-02",
            category: "Philosophy",
            readTime: "22 min",
            favorite: false
        },
        {
            id: 15,
            title: "By Default, Capital Will Matter More Than Ever After AGI",
            author: "Katja Grace",
            url: "https://www.lesswrong.com/posts/KFFaKu27FNugCHFmh/by-default-capital-will-matter-more-than-ever-after-agi",
            description: "Argues that post-AGI, capital will dominate economic and power dynamics due to automation's scale, unless deliberate interventions prioritize human labor or redistribute resources.",
            tags: ["artificial-intelligence", "economics", "future"],
            dateAdded: "2025-06-02",
            category: "Economics",
            readTime: "18 min",
            favorite: false
        },
        {
            id: 16,
            title: "How Wile E. Coyote Explains the World",
            author: "Kyle Wagner",
            url: "https://deadspin.com/how-wile-e-coyote-explains-the-world-1752248034/",
            description: "Uses Wile E. Coyote's relentless, futile pursuits as a metaphor for human ambition, failure, and resilience, reflecting on how his comedic struggles mirror societal and personal endeavors.",
            tags: ["culture", "philosophy", "humor"],
            dateAdded: "2025-06-02",
            category: "Philosophy",
            readTime: "15 min",
            favorite: false
        },
        {
            id: 17,
            title: "The Scaling Hypothesis",
            author: "Gwern Branwen",
            url: "https://gwern.net/scaling-hypothesis",
            description: "Explores the idea that scaling up AI models with more compute, data, and parameters can lead to emergent capabilities, driving progress toward general intelligence without fundamental algorithmic changes.",
            tags: ["artificial-intelligence", "machine-learning", "scaling"],
            dateAdded: "2025-06-02",
            category: "Technology",
            readTime: "25 min",
            favorite: false
        },

    ];
    
    // Filter and sort functionality
    let selectedCategory = "All";
    let searchTerm = "";
    
    // Pagination
    let currentPage = 0;
    const itemsPerPage = 5;
    
    $: categories = ["All", ...new Set(reads.map(read => read.category))];
    
    $: filteredReads = reads.filter(read => {
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

