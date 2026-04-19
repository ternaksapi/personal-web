<script>
    import Header from '$lib/header.svelte'

    export let form
</script>

<svelte:head>
    <title>Admin Login | Yusuf Haikal</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-lg lg:max-w-lg">
    <Header />

    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <h1 class="text-3xl font-bold mb-4">Admin Login</h1>
        <p class="mb-6 text-slate-400 text-sm leading-relaxed">
            Use the private admin password to add new entries to the reading list
            without opening the Supabase dashboard.
        </p>

        {#if form?.error}
            <div class="w-full mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {form.error}
            </div>
        {/if}

        <form method="POST" class="w-full max-w-lg rounded-md bg-slate-700 bg-opacity-30 p-5 space-y-4">
            <label class="flex flex-col gap-2">
                <span class="text-sm text-slate-300">Password</span>
                <input
                    class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    placeholder="Enter admin password"
                    required
                />
            </label>

            <button
                type="submit"
                class="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-400"
            >
                Continue
            </button>
        </form>
    </div>
</div>
