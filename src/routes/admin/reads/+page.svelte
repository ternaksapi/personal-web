<script>
    import { enhance } from '$app/forms'
    import Header from '$lib/header.svelte'

    export let data
    export let form

    let suggesting = false
    let saving = false
    let editingId = form?.editId ? String(form.editId) : null
    let updatingId = null

    $: reads = data.reads || []
    $: values = form?.values || {}
    $: createValues = form?.editId ? {} : values
    $: if (form?.editId) {
        editingId = String(form.editId)
    }

    function trackSuggest() {
        suggesting = true

        return async ({ update }) => {
            try {
                await update()
            } finally {
                suggesting = false
            }
        }
    }

    function trackSave() {
        saving = true

        return async ({ update }) => {
            try {
                await update()
            } finally {
                saving = false
            }
        }
    }

    function trackUpdate(id) {
        updatingId = String(id)

        return async ({ result, update }) => {
            try {
                await update()

                if (result.type === 'success') {
                    editingId = null
                }
            } finally {
                updatingId = null
            }
        }
    }

    function toggleEdit(id) {
        const nextId = String(id)
        editingId = editingId === nextId ? null : nextId
    }

    function isEditing(read) {
        return editingId === String(read.id)
    }

    function formatDate(dateValue) {
        return new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    function getSourceDomain(read) {
        if (read.source_domain) {
            return read.source_domain
        }

        try {
            return new URL(read.url).hostname.replace(/^www\./, '')
        } catch {
            return ''
        }
    }

    function getTopics(read) {
        return read.tags || []
    }

    function topicValue(read) {
        return getTopics(read).join(', ')
    }

    function editValue(read, key, fallback = '') {
        if (form?.editId && String(form.editId) === String(read.id) && values[key] !== undefined) {
            return values[key] ?? ''
        }

        return fallback ?? ''
    }

    function editChecked(read) {
        if (form?.editId && String(form.editId) === String(read.id) && values.favorite !== undefined) {
            return values.favorite
        }

        return read.favorite
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
                    Paste a URL to generate a draft, then add the human part yourself.
                    Topics are just lightweight labels; your note is the actual taste signal.
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

        <form method="POST" action="?/suggest" use:enhance={trackSuggest} class="admin-panel mb-4 w-full space-y-3">
            <label class="flex flex-col gap-2">
                <span class="text-sm text-slate-300">Article URL</span>
                <input
                    class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    type="url"
                    name="url"
                    placeholder="https://example.com/article"
                    value={createValues.url ?? ''}
                    required
                />
            </label>

            <button
                type="submit"
                class="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-white disabled:cursor-wait disabled:opacity-70"
                disabled={suggesting}
            >
                {suggesting ? 'Generating...' : 'Generate draft'}
            </button>

            {#if suggesting}
                <p class="text-xs text-slate-500">
                    Reading the URL and drafting metadata. Some PDFs and long articles can take a bit.
                </p>
            {/if}
        </form>

        <form method="POST" action="?/create" use:enhance={trackSave} class="admin-panel w-full space-y-4">
            <input type="hidden" name="source_domain" value={createValues.sourceDomain ?? ''} />

            <div class="grid gap-4 sm:grid-cols-2">
                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">URL</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="url"
                        name="url"
                        placeholder="https://example.com/article"
                        value={createValues.url ?? ''}
                        required
                    />
                    {#if createValues.sourceDomain}
                        <span class="text-xs text-slate-500">source: {createValues.sourceDomain}</span>
                    {/if}
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Title</span>
                    <textarea
                        class="compact-textarea w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        name="title"
                        placeholder="What is the article called?"
                        required
                    >{createValues.title ?? ''}</textarea>
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Author</span>
                    <textarea
                        class="compact-textarea w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        name="author"
                        placeholder="Who wrote it?"
                        required
                    >{createValues.author ?? ''}</textarea>
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Read time</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="read_time"
                        placeholder="8 min read"
                        value={createValues.readTime ?? ''}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Summary</span>
                    <textarea
                        class="expanded-textarea min-h-[120px] w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        name="description"
                        placeholder="Short neutral summary"
                        required
                    >{createValues.description ?? ''}</textarea>
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Your note</span>
                    <textarea
                        class="expanded-textarea min-h-[100px] w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        name="note"
                        placeholder="Why did this make the shelf? Keep it short."
                    >{createValues.note ?? ''}</textarea>
                </label>

                <label class="flex flex-col gap-2 sm:col-span-2">
                    <span class="text-sm text-slate-300">Topics</span>
                    <input
                        class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        type="text"
                        name="topics"
                        placeholder="ai, systems, cognition"
                        value={createValues.topics ?? ''}
                    />
                    <span class="text-xs text-slate-500">Use at most three. These replace the old category/tag split.</span>
                </label>
            </div>

            <label class="flex items-center gap-3 text-sm text-slate-300">
                <input
                    class="h-4 w-4 rounded border-slate-500 bg-slate-800 text-orange-500 focus:ring-orange-500"
                    type="checkbox"
                    name="favorite"
                    checked={createValues.favorite ?? false}
                />
                Mark as favorite
            </label>

            <button
                type="submit"
                class="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-400 disabled:cursor-wait disabled:opacity-70"
                disabled={saving}
            >
                {saving ? 'Saving...' : 'Add to reading list'}
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
                        <article class="admin-entry">
                            <div class="mb-2 flex items-start justify-between gap-4">
                                <div>
                                    <h3 class="text-base font-semibold text-slate-100">
                                        <a href={read.url} target="_blank" rel="noopener noreferrer" class="hover:underline">
                                            {read.title}
                                        </a>
                                    </h3>
                                    <p class="text-sm text-slate-400">
                                        by {read.author}
                                        {#if getSourceDomain(read)}
                                            · {getSourceDomain(read)}
                                        {/if}
                                    </p>
                                </div>

                                <div class="text-right text-xs text-slate-500">
                                    <div>{read.read_time}</div>
                                    <div>{formatDate(read.date_added)}</div>
                                </div>
                            </div>

                            {#if read.note}
                                <p class="mb-3 border-l border-orange-400 border-opacity-60 pl-3 text-sm leading-relaxed text-slate-200">
                                    {read.note}
                                </p>
                            {/if}

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

                                    {#each getTopics(read) as topic}
                                        <span class="rounded-md bg-slate-600 bg-opacity-40 px-2 py-1 text-xs text-slate-300">
                                            {topic}
                                        </span>
                                    {/each}
                                </div>

                                <div class="flex items-center gap-2">
                                    <button
                                        type="button"
                                        class="rounded-md border border-slate-500/40 px-3 py-1 text-xs text-slate-300 transition-all hover:border-slate-300 hover:text-white"
                                        on:click={() => toggleEdit(read.id)}
                                    >
                                        {isEditing(read) ? 'Close' : 'Edit'}
                                    </button>

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
                            </div>

                            {#if isEditing(read)}
                                <form method="POST" action="?/update" use:enhance={() => trackUpdate(read.id)} class="admin-edit-panel mt-4 space-y-4">
                                    <input type="hidden" name="id" value={read.id} />
                                    <input type="hidden" name="source_domain" value={editValue(read, 'sourceDomain', read.source_domain || getSourceDomain(read))} />

                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">URL</span>
                                            <input
                                                class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                type="url"
                                                name="url"
                                                value={editValue(read, 'url', read.url)}
                                                required
                                            />
                                        </label>

                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">Title</span>
                                            <textarea
                                                class="compact-textarea w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                name="title"
                                                required
                                            >{editValue(read, 'title', read.title)}</textarea>
                                        </label>

                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">Author</span>
                                            <textarea
                                                class="compact-textarea w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                name="author"
                                                required
                                            >{editValue(read, 'author', read.author)}</textarea>
                                        </label>

                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">Read time</span>
                                            <input
                                                class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                type="text"
                                                name="read_time"
                                                value={editValue(read, 'readTime', read.read_time)}
                                                required
                                            />
                                        </label>

                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">Summary</span>
                                            <textarea
                                                class="expanded-textarea min-h-[120px] w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                name="description"
                                                required
                                            >{editValue(read, 'description', read.description)}</textarea>
                                        </label>

                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">Your note</span>
                                            <textarea
                                                class="expanded-textarea min-h-[100px] w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                name="note"
                                                placeholder="Why did this make the shelf?"
                                            >{editValue(read, 'note', read.note || '')}</textarea>
                                        </label>

                                        <label class="flex flex-col gap-2 sm:col-span-2">
                                            <span class="text-sm text-slate-300">Topics</span>
                                            <input
                                                class="w-full rounded-md border border-slate-600 bg-slate-800 bg-opacity-60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                                                type="text"
                                                name="topics"
                                                value={editValue(read, 'topics', topicValue(read))}
                                            />
                                        </label>
                                    </div>

                                    <label class="flex items-center gap-3 text-sm text-slate-300">
                                        <input
                                            class="h-4 w-4 rounded border-slate-500 bg-slate-800 text-orange-500 focus:ring-orange-500"
                                            type="checkbox"
                                            name="favorite"
                                            checked={editChecked(read)}
                                        />
                                        Mark as favorite
                                    </label>

                                    <div class="flex items-center gap-2">
                                        <button
                                            type="submit"
                                            class="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-400 disabled:cursor-wait disabled:opacity-70"
                                            disabled={updatingId === String(read.id)}
                                        >
                                            {updatingId === String(read.id) ? 'Updating...' : 'Update entry'}
                                        </button>

                                        <button
                                            type="button"
                                            class="rounded-md border border-slate-500/40 px-4 py-2 text-sm text-slate-300 transition-all hover:border-slate-300 hover:text-white"
                                            on:click={() => toggleEdit(read.id)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            {/if}
                        </article>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .admin-panel,
    .admin-entry,
    .admin-edit-panel {
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 0.45rem;
        background: rgba(51, 65, 85, 0.18);
    }

    .admin-panel {
        padding: 1.25rem;
    }

    .admin-entry {
        padding: 1rem;
    }

    .admin-edit-panel {
        padding: 1rem;
        background:
            linear-gradient(90deg, rgba(255, 107, 0, 0.12), transparent 0.4rem),
            rgba(15, 23, 42, 0.22);
    }

    .compact-textarea,
    .expanded-textarea {
        field-sizing: content;
        resize: vertical;
        overflow: hidden;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    .compact-textarea {
        min-height: 3.25rem;
        line-height: 1.45;
    }

    .expanded-textarea {
        line-height: 1.6;
    }

    form input:not([type="hidden"]):not([type="checkbox"]),
    form textarea {
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    form input:not([type="hidden"]):not([type="checkbox"]):focus,
    form textarea:focus {
        box-shadow:
            0 0 0 2px rgba(255, 107, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    :global([data-theme="light"]) .admin-panel,
    :global([data-theme="light"]) .admin-entry,
    :global([data-theme="light"]) .admin-edit-panel {
        border-color: rgba(100, 116, 139, 0.32);
        background: rgba(226, 232, 240, 0.46);
    }

    :global([data-theme="light"]) .admin-edit-panel {
        background:
            linear-gradient(90deg, rgba(255, 107, 0, 0.16), transparent 0.4rem),
            rgba(248, 250, 252, 0.72);
    }
</style>
