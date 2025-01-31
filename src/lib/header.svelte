<script>
    // Get the current path to determine which link is active
    import { page } from '$app/stores';
</script>

<div class="flex flex-wrap gap-x-1">
    <a href="/" class="transition-all duration-150 {$page.url.pathname === '/' ? 'bg-white text-[#000758]' : 'text-[#decff1] hover:bg-white hover:text-[#000758]'}">
        <span tabindex="0" role="text"> [kalkalkal.xyz] </span>
    </a>
    <p class="inline sm:invisible sm:block sm:pr-0 text-[#decff1]">•</p>
    <a href="/cv" class="transition-all duration-150 {$page.url.pathname === '/cv' ? 'bg-white text-[#000758]' : 'text-[#decff1] hover:bg-white hover:text-[#000758]'}">
        <span tabindex="0" role="text"> [cv] </span>
    </a>
</div>
<style>
</style>