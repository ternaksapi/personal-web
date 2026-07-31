<script>
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/themeToggle.svelte';
</script>


<div class="site-header">
    <nav class="nav-strip" aria-label="Primary navigation">
        <a href="/" class="nav-link transition-all duration-150 {$page.url.pathname === '/' ? 'active' : ''}">
            [kalkalkal.xyz]
        </a>
        <span class="nav-separator inline sm:invisible sm:block sm:pr-0" aria-hidden="true">•</span>
        <a href="/cv" class="nav-link transition-all duration-150 {$page.url.pathname === '/cv' ? 'active' : ''}">
            [works]
        </a>
        <span class="nav-separator inline sm:invisible sm:block sm:pr-0" aria-hidden="true">•</span>
        <a href="/runs" class="nav-link transition-all duration-150 {$page.url.pathname === '/runs' ? 'active' : ''}">
            [runs]
        </a>
        <span class="nav-separator inline sm:invisible sm:block sm:pr-0" aria-hidden="true">•</span>
        <a href="/reads" class="nav-link transition-all duration-150 {$page.url.pathname === '/reads' ? 'active' : ''}">
            [reads]
        </a>
        <span class="nav-separator inline sm:invisible sm:block sm:pr-0" aria-hidden="true">•</span>
        <a href="/listens" class="nav-link transition-all duration-150 {$page.url.pathname === '/listens' ? 'active' : ''}">
            [listens]
        </a>
        <span class="nav-separator inline sm:invisible sm:block sm:pr-0" aria-hidden="true">•</span>
        <a href="/writes" class="nav-link transition-all duration-150 {$page.url.pathname === '/writes' ? 'active' : ''}">
            [writes]
        </a>
    </nav>
    
    <ThemeToggle />
</div>

<style>
    .site-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 1rem;
        width: 100%;
    }

    .nav-strip {
        display: flex;
        flex-wrap: wrap;
        column-gap: 0.25rem;
        min-width: 0;
    }

    /* Dark theme navigation styles */
    :global([data-theme="dark"]) .nav-link {
        color: #ffffff;
    }
    
    :global([data-theme="dark"]) .nav-link.active {
        background-color: #ffffff;
        color: #000000;
    }
    
    :global([data-theme="dark"]) .nav-link:hover {
        background-color: #ffffff;
        color: #000000;
    }
    
    :global([data-theme="dark"]) .nav-separator {
        color: #ffffff;
    }
    
    /* Light theme navigation styles */
    :global([data-theme="light"]) .nav-link {
        color: #000000;
    }
    
    :global([data-theme="light"]) .nav-link.active {
        background-color: #000000;
        color: #ffffff;
    }
    
    :global([data-theme="light"]) .nav-link:hover {
        background-color: #000000;
        color: #ffffff;
    }
    
    :global([data-theme="light"]) .nav-separator {
        color: #000000;
    }

    @media (max-width: 640px) {
        .site-header {
            align-items: center;
            gap: 0.75rem;
        }

        .nav-strip {
            flex-wrap: nowrap;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            padding-block: 0.2rem;
            white-space: nowrap;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
        }

        .nav-strip::-webkit-scrollbar {
            display: none;
        }

        .nav-link,
        .nav-separator {
            flex: 0 0 auto;
        }
    }
</style>
