<script>
    export let title = '';
    export let excerpt = '';
    export let image = '';
    export let href = '';
    export let date = '';
    export let readTime = '';
</script>

<a href={href} target="_blank" rel="noopener noreferrer" class="article-card">
    <div class="card-image" style="background-image: url('{image}')"></div>
    <div class="glass-overlay"></div>
    <div class="card-content">
        <div class="card-meta">
            {#if date}
                <span class="date">{date}</span>
            {/if}
            {#if readTime}
                <span class="read-time">{readTime}</span>
            {/if}
        </div>
        <h3 class="card-title">{title}</h3>
        <p class="card-excerpt">{excerpt}</p>
    </div>
</a>

<style>
    .article-card {
        position: relative;
        display: block;
        border-radius: 1rem;
        overflow: hidden;
        text-decoration: none;
        height: 280px;
        transition: transform 0.4s ease, box-shadow 0.4s ease;
        border: none;
        outline: none;
    }

    :global([data-theme="dark"]) .article-card {
        background-color: #0f172a;
    }

    :global([data-theme="light"]) .article-card {
        background-color: #f8fafc;
    }

    .article-card:hover {
        transform: translateY(-6px);
    }

    :global([data-theme="dark"]) .article-card:hover {
        box-shadow: 
            0 0 30px rgba(148, 163, 184, 0.15),
            0 25px 50px rgba(0, 0, 0, 0.4);
    }

    :global([data-theme="light"]) .article-card:hover {
        box-shadow: 
            0 0 30px rgba(100, 116, 139, 0.1),
            0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .card-image {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        transition: transform 0.5s ease;
    }

    .article-card:hover .card-image {
        transform: scale(1.05);
    }

    .glass-overlay {
        position: absolute;
        inset: -1px;
        transition: backdrop-filter 0.4s ease, background 0.4s ease;
    }

    :global([data-theme="dark"]) .glass-overlay {
        box-shadow: inset 0 -3px 0 0 #0f172a;
        background: linear-gradient(
            to top,
            rgba(15, 23, 42, 1) -5%,
            rgba(15, 23, 42, 0.95) 5%,
            rgba(15, 23, 42, 0.8) 40%,
            rgba(15, 23, 42, 0.4) 100%
        );
        backdrop-filter: blur(2px);
    }

    :global([data-theme="light"]) .glass-overlay {
        box-shadow: inset 0 -3px 0 0 #f8fafc;
        background: linear-gradient(
            to top,
            rgba(255, 255, 255, 1) -5%,
            rgba(255, 255, 255, 0.95) 5%,
            rgba(255, 255, 255, 0.8) 40%,
            rgba(255, 255, 255, 0.4) 100%
        );
        backdrop-filter: blur(2px);
    }

    :global([data-theme="dark"]) .article-card:hover .glass-overlay {
        background: linear-gradient(
            to top,
            rgba(15, 23, 42, 1) -5%,
            rgba(15, 23, 42, 0.9) 5%,
            rgba(15, 23, 42, 0.6) 40%,
            rgba(15, 23, 42, 0.2) 100%
        );
        backdrop-filter: blur(1px);
    }

    :global([data-theme="light"]) .article-card:hover .glass-overlay {
        background: linear-gradient(
            to top,
            rgba(255, 255, 255, 1) -5%,
            rgba(255, 255, 255, 0.85) 5%,
            rgba(255, 255, 255, 0.5) 40%,
            rgba(255, 255, 255, 0.2) 100%
        );
        backdrop-filter: blur(1px);
    }

    .card-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        z-index: 1;
    }

    .card-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.75rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :global([data-theme="dark"]) .card-meta {
        color: #cbd5e1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }

    :global([data-theme="light"]) .card-meta {
        color: #475569;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
    }

    .card-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
        background-size: 0% 100%;
        background-repeat: no-repeat;
        background-position: left center;
        transition: background-size 0.4s ease, color 0.3s ease;
        padding: 0.1rem 0.25rem;
        margin-left: -0.25rem;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
    }

    .article-card:hover .card-title {
        background-size: 100% 100%;
    }

    /* Dark mode: dark highlight with white text */
    :global([data-theme="dark"]) .card-title {
        color: #f1f5f9;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        background-image: linear-gradient(90deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
    }

    :global([data-theme="dark"]) .article-card:hover .card-title {
        color: #f8fafc;
        text-shadow: none;
    }

    /* Light mode: slate highlight with dark text */
    :global([data-theme="light"]) .card-title {
        color: #1e293b;
        text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
        background-image: linear-gradient(90deg, rgba(148, 163, 184, 0.85) 0%, rgba(148, 163, 184, 0.85) 100%);
    }

    :global([data-theme="light"]) .article-card:hover .card-title {
        color: #0f172a;
        text-shadow: none;
    }

    .card-excerpt {
        font-size: 0.875rem;
        line-height: 1.6;
        margin: 0;
        background-size: 0% 100%;
        background-repeat: no-repeat;
        background-position: left center;
        transition: background-size 0.5s ease 0.1s, color 0.3s ease;
        padding: 0.1rem 0.25rem;
        margin-left: -0.25rem;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
    }

    .article-card:hover .card-excerpt {
        background-size: 100% 100%;
    }

    /* Dark mode: dark highlight with white text */
    :global([data-theme="dark"]) .card-excerpt {
        color: #cbd5e1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        background-image: linear-gradient(90deg, rgba(30, 41, 59, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%);
    }

    :global([data-theme="dark"]) .article-card:hover .card-excerpt {
        color: #e2e8f0;
        text-shadow: none;
    }

    /* Light mode: slate highlight with dark text */
    :global([data-theme="light"]) .card-excerpt {
        color: #475569;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
        background-image: linear-gradient(90deg, rgba(148, 163, 184, 0.65) 0%, rgba(148, 163, 184, 0.65) 100%);
    }

    :global([data-theme="light"]) .article-card:hover .card-excerpt {
        color: #1e293b;
        text-shadow: none;
    }
</style>
