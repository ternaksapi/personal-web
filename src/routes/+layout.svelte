<script>
    import "../styles/global.css";
</script>

<main class="body flex h-full min-h-screen w-full flex-col items-center justify-start p-8 pt-16 sm:pt-16 text-sm sm:p-16">
    <slot></slot>
</main>
<footer>
    <p> Made with ❤️ and SvelteKit</p>
</footer>
<style>
    footer {
        text-align: center;
        display: block;
        margin: 20px auto;
        font-size: 10px;    
    }
</style>