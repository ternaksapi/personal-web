<script>
    import { page } from '$app/stores';

    $: code = $page.url.searchParams.get('code') || '';
</script>

<svelte:head>
    <title>Spotify Callback</title>
</svelte:head>

<section class="callback-shell">
    <h1>Spotify callback</h1>

    {#if code}
        <p>Authorization code received.</p>
        <pre>npm run spotify:exchange -- {code}</pre>
    {:else}
        <p>No authorization code found in this URL.</p>
    {/if}
</section>

<style>
    .callback-shell {
        width: min(100%, 42rem);
    }

    pre {
        overflow-x: auto;
        border: 1px solid currentColor;
        border-radius: 0.375rem;
        padding: 1rem;
        white-space: pre-wrap;
    }
</style>
