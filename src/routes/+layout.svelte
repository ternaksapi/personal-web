<script>
    import "../styles/global.css";
    import { navigating } from '$app/stores';
    import { fade } from 'svelte/transition';
    import { theme } from '$lib/theme.js';
    import { onMount } from 'svelte';

    onMount(() => {
        theme.init();
    });
</script>

{#if $navigating}
    <div class="navigation-progress" transition:fade={{ duration: 150 }}>
        <div class="progress-bar"></div>
    </div>
{/if}

<main class="body flex h-full min-h-screen w-full flex-col items-center justify-start p-8 pt-16 sm:pt-16 text-sm sm:p-16">
    <slot></slot>
</main>
<footer>
    <p> Made with ❤️ and SvelteKit</p>
</footer>

<style>
    footer {
        text-align: center;
        display: block;
        margin: 20px auto;
        font-size: 10px;    
    }

    .navigation-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        z-index: 1000;
        pointer-events: none;
    }

    .progress-bar {
        height: 100%;
        width: 0;
        background: linear-gradient(to right, #6366f1, #818cf8);
        animation: progress-animation 1.5s ease-in-out infinite;
    }

    @keyframes progress-animation {
        0% {
            width: 0%;
            opacity: 1;
        }
        50% {
            width: 70%;
            opacity: 0.8;
        }
        100% {
            width: 100%;
            opacity: 0;
        }
    }
</style>