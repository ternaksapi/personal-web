<script>
    import { page } from '$app/stores';
    import Header from "$lib/header.svelte";
</script>

<div class="flex h-full w-full flex-col items-center justify-start max-w-md sm:max-w-md md:max-w-lg lg:max-w-lg">
    <Header />
    <div class="flex flex-col items-center justify-center space-y-4 pt-16">
        <h1 class="text-4xl font-bold text-[#decff1]">{$page.status}</h1>
        <p class="text-xl text-[#decff1]">{$page.error?.message || 'Page not found'}</p>
        <a 
            href="/" 
            class="mt-4 text-[#decff1] hover:bg-white hover:text-[#000758] transition-all duration-150"
        >
            <span tabindex="0" role="text">[Go back home]</span>
        </a>
    </div>
</div> 