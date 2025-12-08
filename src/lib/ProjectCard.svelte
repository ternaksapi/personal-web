<script>
    export let title = '';
    export let description = '';
    export let href = '';
    export let previewImage = '/laptop placeholder.png';
</script>

<a href={href} target="_blank" rel="noopener noreferrer" class="project-card">
    <div class="project-content">
        <h3 class="project-title">{title}</h3>
        <p class="project-description">{description}</p>
    </div>
    <div class="project-preview">
        <img src={previewImage} alt="{title} preview" class="laptop-image" />
    </div>
</a>

<style>
    .project-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
        gap: 1rem;
        text-decoration: none;
        border: 1px solid transparent;
    }

    .project-card:hover {
        border-color: rgba(100, 116, 139, 0.3);
    }

    :global([data-theme="dark"]) .project-card:hover {
        background-color: rgba(30, 41, 59, 0.5);
    }

    :global([data-theme="light"]) .project-card:hover {
        background-color: rgba(241, 245, 249, 0.8);
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
        line-height: 1.5;
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
    }

    .laptop-image {
        width: 100%;
        height: auto;
        max-height: 90px;
        object-fit: contain;
        filter: none !important;
    }

    @media (max-width: 480px) {
        .project-card {
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
