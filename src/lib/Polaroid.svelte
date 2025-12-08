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
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    /* Dark mode - visible glow effect */
    :global([data-theme="dark"]) .polaroid-wrapper {
        box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.25),
            0 0 40px rgba(147, 197, 253, 0.2),
            0 0 60px rgba(147, 197, 253, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    :global([data-theme="dark"]) .polaroid-wrapper:hover {
        transform: rotate(0deg) scale(1.05) !important;
        box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.35),
            0 0 60px rgba(147, 197, 253, 0.3),
            0 0 80px rgba(147, 197, 253, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Light mode - traditional dark shadow */
    :global([data-theme="light"]) .polaroid-wrapper {
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }

    :global([data-theme="light"]) .polaroid-wrapper:hover {
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
