<script>
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/themeToggle.svelte';
</script>


<div class="flex flex-wrap items-center justify-between w-full">
    <div class="flex flex-wrap gap-x-1">
        <a href="/" class="nav-link transition-all duration-150 {$page.url.pathname === '/' ? 'active' : ''}">
            <span tabindex="0" role="text"> [kalkalkal.xyz] </span>
        </a>
        <p class="nav-separator inline sm:invisible sm:block sm:pr-0">•</p>
        <a href="/cv" class="nav-link transition-all duration-150 {$page.url.pathname === '/cv' ? 'active' : ''}">
            <span tabindex="0" role="text"> [cv] </span>
        </a>
        <p class="nav-separator inline sm:invisible sm:block sm:pr-0">•</p>
        <a href="/runs" class="nav-link transition-all duration-150 {$page.url.pathname === '/runs' ? 'active' : ''}">
            <span tabindex="0" role="text"> [runs] </span>
        </a>
        <p class="nav-separator inline sm:invisible sm:block sm:pr-0">•</p>
        <a href="/reads" class="nav-link transition-all duration-150 {$page.url.pathname === '/reads' ? 'active' : ''}">
            <span tabindex="0" role="text"> [reads] </span>
        </a>
    </div>
    
    <ThemeToggle />
</div>

<style>
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
</style>