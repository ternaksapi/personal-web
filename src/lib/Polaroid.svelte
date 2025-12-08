<script>
    export let src = '';
    export let alt = '';
    export let caption = '';
    export let rotation = 0; // degrees to rotate (-15 to 15 works well)
    export let size = '150px'; // default size for the image
</script>

<div 
    class="polaroid-wrapper"
    style="transform: rotate({rotation}deg); width: calc({size} + 1rem);"
>
    <div class="polaroid-frame">
        <img 
            {src} 
            {alt} 
            loading="lazy" 
            class="polaroid-image"
            style="width: {size}; height: {size};"
        />
        {#if caption}
            <span class="polaroid-caption">{caption}</span>
        {/if}
    </div>
</div>

<style>
    .polaroid-wrapper {
        flex-shrink: 0;
        overflow: hidden;
        border-radius: 2px;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 10px 15px -3px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .polaroid-wrapper:hover {
        transform: rotate(0deg) scale(1.05) !important;
        box-shadow: 
            0 10px 25px -5px rgba(0, 0, 0, 0.2),
            0 8px 10px -5px rgba(0, 0, 0, 0.1);
    }

    .polaroid-frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem;
        padding-bottom: 0.75rem;
        width: fit-content;
    }

    /* Dark theme */
    :global([data-theme="dark"]) .polaroid-frame {
        background-color: #1f1f1f;
        color: #ffffff;
    }

    /* Light theme */
    :global([data-theme="light"]) .polaroid-frame {
        background-color: #fafafa;
        color: #1a1a1a;
    }

    .polaroid-image {
        aspect-ratio: 1 / 1;
        width: 100%;
        height: auto;
        object-fit: cover;
        filter: none !important;
    }

    .polaroid-caption {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        white-space: nowrap;
        font-family: 'PPMondwest', monospace;
        font-style: italic;
    }
</style>
