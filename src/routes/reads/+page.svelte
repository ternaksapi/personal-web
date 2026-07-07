<script>
    import Header from "$lib/header.svelte";

    export let data;

    let reads = data.reads || [];
    let selectedTopic = "All";
    let searchTerm = "";
    let currentPage = 0;
    let previousFilterSignature = "";

    const itemsPerPage = 5;

    function sourceDomainFor(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return '';
        }
    }

    function topicsFor(read) {
        const topics = read.tags || [];

        if (topics.length > 0) {
            return topics;
        }

        return read.category ? [read.category] : [];
    }

    function searchableText(read) {
        return [
            read.title,
            read.author,
            read.description,
            read.note,
            read.sourceDomain,
            ...read.topics
        ].join(' ').toLowerCase();
    }

    $: transformedReads = reads.map(read => ({
        id: read.id,
        title: read.title,
        author: read.author,
        url: read.url,
        description: read.description,
        note: read.note || '',
        topics: topicsFor(read),
        sourceDomain: read.source_domain || sourceDomainFor(read.url),
        dateAdded: read.date_added,
        favorite: read.favorite
    }));

    $: topics = [
        "All",
        ...new Set(transformedReads.flatMap(read => read.topics))
    ];

    $: filteredReads = transformedReads
        .filter(read => {
            const matchesTopic = selectedTopic === "All" || read.topics.includes(selectedTopic);
            const matchesSearch = searchableText(read).includes(searchTerm.toLowerCase());

            return matchesTopic && matchesSearch;
        })
        .sort((a, b) => {
            if (a.favorite !== b.favorite) {
                return a.favorite ? -1 : 1;
            }

            return new Date(b.dateAdded) - new Date(a.dateAdded);
        });

    $: totalPages = Math.ceil(filteredReads.length / itemsPerPage);
    $: paginatedReads = filteredReads.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    $: filterSignature = `${selectedTopic}:${searchTerm}`;
    $: if (filterSignature !== previousFilterSignature) {
        currentPage = 0;
        previousFilterSignature = filterSignature;
    }

    function selectTopic(topic) {
        selectedTopic = topic;
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

<svelte:head>
    <title>Reading List</title>
</svelte:head>

<div class="reads-shell transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-xl lg:max-w-2xl">
    <Header />

    <div class="flex h-full w-full flex-col items-start">
        <h1 class="text-3xl font-bold mb-4">Reading List</h1>

        <div class="reads-intro mb-6 text-sm leading-relaxed">
            <p>A shelf of things I found worth keeping around. The summaries are intentionally short; the note is the part that says why it stuck.</p>
        </div>

        <div class="shelf-controls w-full mb-8 space-y-4">
            <input
                type="text"
                placeholder="Search the shelf..."
                bind:value={searchTerm}
                class="shelf-search w-full"
            />

            <div class="topic-filters flex gap-2">
                {#each topics as topic}
                    <button
                        class={selectedTopic === topic ? 'selected-topic' : ''}
                        on:click={() => selectTopic(topic)}
                    >
                        {topic}
                    </button>
                {/each}
            </div>
        </div>

        <div class="read-stack w-full">
            {#each paginatedReads as read (read.id)}
                <article class={`read-card ${read.favorite ? 'is-favorite' : ''} ${read.note ? 'has-note' : ''}`}>
                    {#if read.note}
                        <div class="saved-note">
                            <p class="note-label">why this stayed</p>
                            <p>{read.note}</p>
                        </div>
                    {/if}

                    <div class="read-meta">
                        <span class="read-source">{read.sourceDomain || 'unknown source'}</span>
                        {#if read.favorite}
                            <span class="favorite-marker">favorite</span>
                        {/if}
                    </div>

                    <h3 class="read-title">
                        <a href={read.url} target="_blank" rel="noopener noreferrer">
                            {read.title}
                        </a>
                    </h3>

                    <p class="read-author">by {read.author}</p>
                    <p class="read-summary">{read.description}</p>

                    {#if read.topics.length > 0}
                        <div class="topic-labels">
                            {#each read.topics as topic}
                                <span>{topic}</span>
                            {/each}
                        </div>
                    {/if}
                </article>
            {/each}
        </div>

        {#if paginatedReads.length === 0}
            <div class="empty-state w-full text-center py-10">
                <p>No reads found matching your criteria.</p>
            </div>
        {/if}

        {#if totalPages > 1}
            <div class="pagination-row mt-8 flex justify-center items-center space-x-2">
                <button
                    class="page-arrow"
                    on:click={prevPage}
                    disabled={currentPage === 0}
                    aria-label="Previous page"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <button
                    class={currentPage === 0 ? 'active-page' : ''}
                    on:click={() => goToPage(0)}
                    aria-label="Go to page 1"
                    aria-current={currentPage === 0 ? 'page' : undefined}
                >
                    1
                </button>

                {#if currentPage > 2}
                    <span class="page-gap">...</span>
                {/if}

                {#each Array(totalPages) as _, i}
                    {@const pageNum = i}
                    {#if pageNum !== 0 && pageNum !== totalPages - 1 &&
                        (pageNum === currentPage - 1 ||
                          pageNum === currentPage ||
                          pageNum === currentPage + 1)}
                        <button
                            class={currentPage === pageNum ? 'active-page' : ''}
                            on:click={() => goToPage(pageNum)}
                            aria-label={`Go to page ${pageNum + 1}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                            {pageNum + 1}
                        </button>
                    {/if}
                {/each}

                {#if currentPage < totalPages - 3}
                    <span class="page-gap">...</span>
                {/if}

                {#if totalPages > 1}
                    <button
                        class={currentPage === totalPages - 1 ? 'active-page' : ''}
                        on:click={() => goToPage(totalPages - 1)}
                        aria-label={`Go to page ${totalPages}`}
                        aria-current={currentPage === totalPages - 1 ? 'page' : undefined}
                    >
                        {totalPages}
                    </button>
                {/if}

                <button
                    class="page-arrow"
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
    .reads-shell {
        --card: #ffffff;
        --card-soft: #f8fafc;
        --ink: #111827;
        --muted: #64748b;
        --line: #d6dce5;
        --accent: #ff6b00;
        --note-paper: #fff1a8;
        --note-ink: #2b2113;
        --shadow: rgba(15, 23, 42, 0.12);
        --gloss: rgba(255, 255, 255, 0.72);
        --gloss-soft: rgba(255, 255, 255, 0.34);
        --fade: rgba(15, 23, 42, 0.04);
    }

    :global([data-theme="dark"]) .reads-shell {
        --card: #0b1220;
        --card-soft: #111827;
        --ink: #f8fafc;
        --muted: #94a3b8;
        --line: #334155;
        --note-paper: #f6d66d;
        --note-ink: #221a0d;
        --shadow: rgba(0, 0, 0, 0.42);
        --gloss: rgba(255, 255, 255, 0.13);
        --gloss-soft: rgba(255, 255, 255, 0.07);
        --fade: rgba(0, 0, 0, 0.2);
    }

    .reads-intro p,
    .empty-state p,
    .page-gap {
        color: var(--muted);
    }

    .shelf-controls {
        border-block: 1px solid var(--line);
        padding-block: 1rem;
    }

    .shelf-search {
        border: 1px solid var(--line) !important;
        border-radius: 0.375rem;
        background: var(--card) !important;
        color: var(--ink) !important;
        padding: 0.75rem 1rem;
        outline: none;
    }

    .shelf-search::placeholder {
        color: var(--muted) !important;
    }

    .shelf-search:focus {
        border-color: var(--accent) !important;
        box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.18);
    }

    .topic-filters {
        flex-wrap: nowrap;
        max-width: 100%;
        overflow-x: auto;
        padding-bottom: 0.2rem;
        scrollbar-width: thin;
    }

    .topic-filters button,
    .pagination-row button {
        flex: 0 0 auto;
        border: 1px solid var(--line);
        border-radius: 0.375rem;
        background: var(--card);
        color: var(--muted) !important;
        padding: 0.35rem 0.7rem;
        font-size: 0.875rem;
        line-height: 1.3;
        white-space: nowrap;
        transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    .topic-filters button:hover,
    .pagination-row button:hover {
        border-color: var(--accent);
        color: var(--ink) !important;
        transform: translateY(-1px);
    }

    .topic-filters button.selected-topic,
    .pagination-row button.active-page {
        background: var(--ink);
        border-color: var(--ink);
        color: var(--card) !important;
    }

    .read-stack {
        display: grid;
        gap: 1.15rem;
    }

    .read-card {
        isolation: isolate;
        position: relative;
        border: 1px solid var(--line);
        border-radius: 0.5rem;
        background: linear-gradient(180deg, var(--card), var(--card-soft));
        box-shadow: 0 16px 34px -28px var(--shadow);
        color: var(--ink);
        padding: 1.15rem;
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    .read-card::before {
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

    .read-card > * {
        position: relative;
        z-index: 1;
    }

    .read-card.has-note {
        margin-top: 1.2rem;
    }

    .read-card::after {
        content: "";
        display: block;
        clear: both;
    }

    .read-card.is-favorite {
        border-color: rgba(255, 107, 0, 0.45);
    }

    .read-card:hover {
        border-color: rgba(255, 107, 0, 0.55);
        box-shadow: 0 26px 50px -30px var(--shadow);
        transform: translateY(-2px);
    }

    .read-card p,
    .read-card a,
    .read-card span {
        color: inherit;
    }

    .read-meta,
    .topic-labels,
    .note-label {
        letter-spacing: 0;
        text-transform: uppercase;
    }

    .read-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        justify-content: space-between;
        color: var(--muted);
        font-size: 0.78rem;
        line-height: 1.35;
    }

    .read-source,
    .favorite-marker {
        color: var(--accent) !important;
    }

    .read-title {
        margin: 0.95rem 0 0.35rem;
        color: var(--ink);
        font-size: 1.35rem;
        line-height: 1.22;
    }

    .read-title a {
        color: inherit !important;
        text-decoration-color: transparent;
        text-decoration-thickness: 0.08em;
        text-underline-offset: 0.18em;
        transition: text-decoration-color 0.2s ease;
    }

    .read-title a:hover {
        text-decoration-color: var(--accent);
    }

    .read-author {
        margin: 0 0 0.9rem;
        color: var(--muted) !important;
        font-size: 0.95rem;
    }

    .read-summary {
        margin: 0;
        color: var(--ink) !important;
        font-size: 0.98rem;
        line-height: 1.58;
    }

    .saved-note {
        position: relative;
        z-index: 2;
        float: right;
        width: min(42%, 22rem);
        margin: -2.45rem 0 0.9rem 1.2rem;
        border: 1px solid rgba(120, 92, 30, 0.2);
        border-radius: 0.25rem;
        background: var(--note-paper);
        box-shadow: 0 14px 22px -18px rgba(0, 0, 0, 0.42);
        color: var(--note-ink);
        padding: 0.75rem 0.9rem;
        transform: rotate(-1.2deg);
    }

    .saved-note::before {
        content: "";
        position: absolute;
        top: -0.45rem;
        left: 1.1rem;
        width: 3.25rem;
        height: 0.75rem;
        border: 1px solid rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.68);
        opacity: 0.86;
        transform: rotate(2.5deg);
    }

    .saved-note p {
        color: inherit !important;
    }

    .note-label {
        margin: 0 0 0.35rem;
        color: rgba(43, 33, 19, 0.68) !important;
        font-size: 0.75rem;
    }

    .saved-note p:last-child {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.45;
    }

    .topic-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 1.15rem;
        color: var(--muted);
        font-size: 0.72rem;
    }

    .topic-labels span {
        border: 1px solid var(--line);
        border-radius: 0.25rem;
        padding: 0.18rem 0.45rem;
        color: var(--muted) !important;
    }

    .pagination-row button {
        min-width: 2rem;
        min-height: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .pagination-row button:disabled {
        cursor: not-allowed;
        opacity: 0.38;
        transform: none;
    }

    @media (max-width: 640px) {
        .read-card {
            padding: 1rem;
        }

        .read-card.has-note {
            display: block;
            margin-top: 1.9rem;
            padding-top: 1rem;
        }

        .saved-note {
            position: relative;
            float: none;
            top: auto;
            right: auto;
            left: auto;
            width: auto;
            margin: -2.1rem 0 1rem;
            padding: 0.7rem 0.8rem;
        }

        .read-title {
            font-size: 1.2rem;
            line-height: 1.24;
        }
    }
</style>
