<script>
    import Header from '$lib/header.svelte'

    export let data
    export let form

    $: reads = data.reads || []
    $: values = form?.values || {}

    function formatDate(dateValue) {
        return new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }
</script>

<svelte:head>
    <title>Reads Admin | Yusuf Haikal</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10 sm:max-w-md md:max-w-lg lg:max-w-lg">
    <Header />

    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <div class="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold mb-3">Reads Admin</h1>
                <p class="text-slate-400 text-sm leading-relaxed">
                    Add new reading-list entries directly from the site. The form writes
                    to Supabase on the server, so nothing sensitive is exposed in the
                    browser.
                </p>
            </div>

            <form method="POST" action="?/logout">
                <button
                    type="submit"
                    class="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-all hover:border-slate-400 hover:text-white"
                >
                    Log out
                </button>
            </form>
        </div>

        {#if form?.error}
            <div class="w-full mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {form.error}
            </div>
        {/if}

        {#if form?.success}
            <div class="w-full mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {form.success}
            </div>
        {/if}

        {#if data.loadError}
            <div class="w-full mb-4 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                {data.loadError}
            </div>
        {/if}

        <form method="POST" action="?/create" class="w-full rounded-md bg-slate-700 bg-opacity-30 p-5 space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Title</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="title"
                        placeholder="What is the article called?"
                        value={values.title ?? ''}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2">
                    <span class="text-sm text-slate-300">Author</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="author"
                        placeholder="Who wrote it?"
                        value={values.author ?? ''}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2">
                    <span class="text-sm text-slate-300">Category</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="category"
                        placeholder="Essay, AI, Philosophy..."
                        value={values.category ?? ''}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">URL</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="url"
                        name="url"
                        placeholder="https://example.com/article"
                        value={values.url ?? ''}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Description</span>
                    <textarea
                        class="min-h-[140px] w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        name="description"
                        placeholder="Why is this worth reading?"
                        required
                    >{values.description ?? ''}</textarea>
                </label>

                <label class="flex flex-col gap-2">
                    <span class="text-sm text-slate-300">Read time</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="read_time"
                        placeholder="8 min read"
                        value={values.readTime ?? ''}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2">
                    <span class="text-sm text-slate-300">Tags</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="tags"
                        placeholder="ai, cognition, essay"
                        value={values.tags ?? ''}
                    />
                </label>
            </div>

            <label class="flex items-center gap-3 text-sm text-slate-300">
                <input
                    class="h-4 w-4 rounded border-slate-500 bg-slate-800 text-orange-500 focus:ring-orange-500"
                    type="checkbox"
                    name="favorite"
                    checked={values.favorite ?? false}
                />
                Mark as favorite
            </label>

            <button
                type="submit"
                class="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-400"
            >
                Add to reading list
            </button>
        </form>

        <div class="mt-8 w-full">
            <h2 class="mb-4 text-xl font-bold">Recent Entries</h2>

            {#if reads.length === 0}
                <div class="rounded-md bg-slate-700 bg-opacity-20 px-4 py-4 text-sm text-slate-400">
                    No reads found yet.
                </div>
            {:else}
                <div class="space-y-3">
                    {#each reads as read}
                        <article class="rounded-md bg-slate-700 bg-opacity-20 p-4">
                            <div class="mb-2 flex items-start justify-between gap-4">
                                <div>
                                    <h3 class="text-base font-semibold text-slate-100">
                                        <a href={read.url} target="_blank" rel="noopener noreferrer" class="hover:underline">
                                            {read.title}
                                        </a>
                                    </h3>
                                    <p class="text-sm text-slate-400">
                                        by {read.author} · {read.category}
                                    </p>
                                </div>

                                <div class="text-right text-xs text-slate-500">
                                    <div>{read.read_time}</div>
                                    <div>{formatDate(read.date_added)}</div>
                                </div>
                            </div>

                            <p class="mb-3 text-sm leading-relaxed text-slate-300">
                                {read.description}
                            </p>

                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div class="flex flex-wrap items-center gap-2">
                                    {#if read.favorite}
                                        <span class="rounded-md bg-yellow-500 bg-opacity-20 px-2 py-1 text-xs text-yellow-300">
                                            Favorite
                                        </span>
                                    {/if}

                                    {#each read.tags || [] as tag}
                                        <span class="rounded-md bg-slate-600 bg-opacity-40 px-2 py-1 text-xs text-slate-300">
                                            #{tag}
                                        </span>
                                    {/each}
                                </div>

                                <form method="POST" action="?/delete">
                                    <input type="hidden" name="id" value={read.id} />
                                    <input type="hidden" name="title" value={read.title} />
                                    <button
                                        type="submit"
                                        class="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 transition-all hover:border-red-400 hover:bg-red-500/10 hover:text-red-200"
                                    >
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </article>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
