<script>
    export let title = '';
    export let description = '';
    export let href = '';
    export let previewImage = '/laptop placeholder.png';
</script>

<a href={href} target="_blank" rel="noopener noreferrer" class="project-card">
    <div class="card-border"></div>
    <div class="card-content">
        <div class="project-content">
            <h3 class="project-title">{title}</h3>
            <p class="project-description">{description}</p>
        </div>
        <div class="project-preview">
            <img src={previewImage} alt="{title} preview" class="preview-image" />
        </div>
    </div>
</a>

<style>
    .project-card {
        position: relative;
        display: block;
        border-radius: 0.75rem;
        text-decoration: none;
        overflow: visible;
        transition: transform 0.4s ease, box-shadow 0.4s ease, z-index 0s;
        z-index: 1;
    }

    .project-card:hover {
        transform: translateY(-4px);
        z-index: 50;
    }

    /* Dark mode glow on hover */
    :global([data-theme="dark"]) .project-card:hover {
        box-shadow: 
            0 0 25px rgba(148, 163, 184, 0.2),
            0 0 50px rgba(148, 163, 184, 0.1),
            0 20px 40px rgba(0, 0, 0, 0.3);
    }

    /* Light mode glow on hover */
    :global([data-theme="light"]) .project-card:hover {
        box-shadow: 
            0 0 25px rgba(100, 116, 139, 0.15),
            0 0 40px rgba(100, 116, 139, 0.08),
            0 20px 40px rgba(0, 0, 0, 0.08);
    }

    /* Subtle border on hover */
    .card-border {
        position: absolute;
        inset: 0;
        border-radius: 0.75rem;
        border: 1px solid rgba(148, 163, 184, 0.3);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .project-card:hover .card-border {
        opacity: 1;
    }



    .card-content {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-radius: 0.75rem;
        gap: 1.25rem;
        z-index: 1;
    }

    /* Dark mode card background */
    :global([data-theme="dark"]) .card-content {
        background: linear-gradient(
            135deg,
            rgba(30, 41, 59, 0.8) 0%,
            rgba(15, 23, 42, 0.9) 100%
        );
        border: 1px solid rgba(148, 163, 184, 0.1);
    }

    :global([data-theme="dark"]) .project-card:hover .card-content {
        background: linear-gradient(
            135deg,
            rgba(30, 41, 59, 0.95) 0%,
            rgba(15, 23, 42, 1) 100%
        );
        border-color: rgba(148, 163, 184, 0.2);
    }

    /* Light mode card background */
    :global([data-theme="light"]) .card-content {
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(241, 245, 249, 0.95) 100%
        );
        border: 1px solid rgba(100, 116, 139, 0.1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    :global([data-theme="light"]) .project-card:hover .card-content {
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(248, 250, 252, 1) 100%
        );
        border-color: rgba(100, 116, 139, 0.2);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .project-content {
        flex: 1;
        min-width: 0;
    }

    .project-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        line-height: 1.3;
        transition: color 0.3s ease;
    }

    :global([data-theme="dark"]) .project-title {
        color: #f1f5f9;
    }

    :global([data-theme="light"]) .project-title {
        color: #1e293b;
    }

    .project-description {
        font-size: 0.875rem;
        margin: 0;
        line-height: 1.6;
    }

    :global([data-theme="dark"]) .project-description {
        color: #94a3b8;
    }

    :global([data-theme="light"]) .project-description {
        color: #64748b;
    }

    .project-preview {
        flex-shrink: 0;
        width: 140px;
        transition: transform 0.4s ease;
    }

    .project-card:hover .project-preview {
        transform: scale(1.4) rotate(5deg) translateX(10px) translateY(-10px);
        z-index: 10;
    }

    .preview-image {
        width: 100%;
        height: auto;
        max-height: 90px;
        object-fit: contain;
        filter: none !important;
        transition: max-height 0.4s ease;
    }

    .project-card:hover .preview-image {
        max-height: 150px;
    }

    @media (max-width: 480px) {
        .card-content {
            flex-direction: column;
            align-items: flex-start;
        }

        .project-preview {
            width: 100%;
            max-width: 180px;
            margin-top: 0.75rem;
        }
    }
</style>
