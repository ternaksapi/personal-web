<script>
    import { theme } from '$lib/theme.js';
    import { onMount } from 'svelte';

    onMount(() => {
        theme.init();
    });

    function toggleTheme() {
        theme.toggle();
    }
</script>

<button
    on:click={toggleTheme}
    class="theme-toggle transition-all duration-150 hover:bg-opacity-70"
    aria-label="Toggle theme"
    title="Toggle between light and dark mode"
>
    {#if $theme === 'dark'}
        <!-- Sun icon for switching to light mode -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    {:else}
        <!-- Moon icon for switching to dark mode -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    {/if}
</button>

<style>
    .theme-toggle {
        padding: 8px;
        border-radius: 6px;
        border: 1px solid;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Dark theme styles */
    :global([data-theme="dark"]) .theme-toggle {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    :global([data-theme="dark"]) .theme-toggle:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    /* Light theme styles */
    :global([data-theme="light"]) .theme-toggle {
        color: #000000;
        border-color: rgba(0, 0, 0, 0.2);
    }
    
    :global([data-theme="light"]) .theme-toggle:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>