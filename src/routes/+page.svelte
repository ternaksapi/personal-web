<script>
    import Header from "$lib/header.svelte";
    import Polaroid from "$lib/Polaroid.svelte";
    import { onMount, onDestroy } from 'svelte';

    const greetings = ["Hello!", "Hola!", "Bonjour!", "Hallo!", "Ciao!"];
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingSpeed = 150;
    let typingTimer;

    function typeText() {
        const currentGreeting = greetings[currentIndex];
        
        if (isDeleting) {
            currentText = currentGreeting.substring(0, currentText.length - 1);
            typingSpeed = 100;
        } else {
            currentText = currentGreeting.substring(0, currentText.length + 1);
            typingSpeed = 150;
        }

        if (!isDeleting && currentText === currentGreeting) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % greetings.length;
            typingSpeed = 500; // Pause before next word
        }

        typingTimer = setTimeout(typeText, typingSpeed);
    }

    onMount(() => {
        // Reset state when component mounts
        currentIndex = 0;
        currentText = '';
        isDeleting = false;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            currentText = greetings[0];
            return;
        }

        typeText();
    });

    onDestroy(() => {
        // Clean up timer when component is destroyed
        if (typingTimer) {
            clearTimeout(typingTimer);
        }
    });
</script>
<svelte:head>
    <title>kalkalkal.xyz</title>
</svelte:head>
<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10  sm:max-w-md md:max-w-lg lg:max-w-lg ">
    <Header />
    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <div class="flex flex-col space-y-5">
            <h1 class="whitespace-nowrap text-[clamp(1.25rem,6.2vw,1.5rem)] font-bold sm:text-3xl">Muhammad Yusuf Haikal</h1>
            <a class="w-fit text-slate-300" href="mailto:yusufhaikaln7@gmail.com">yusufhaikaln7@gmail.com</a>
            <p class="text-slate-500">Jakarta, Indonesia</p>
            <div class="flex h-full w-full max-w-lg flex-col items-start space-y-4">
                <Polaroid 
                    src="/new_front.jpeg"
                    alt="Muhammad Yusuf Haikal in graduation attire"
                    caption="(un)officially graduated!"
                    rotation={-3}
                    zoom={1.18}
                />
                <div id="typing-container" class="text-xl greeting-text mt-4" aria-hidden="true">
                    <span id="typing-text">{currentText}</span>
                    <span class="cursor">|</span>
                </div>
                <p>I'm Haikal, a Computer Science graduate currently doing product + engineering @ Shopee under SPX Express.</p>
                <p>I build AI and data products. Driven by <a href="https://www.cs.ox.ac.uk/activities/ieg/e-library/sources/t_article.pdf" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-70">Turing's question</a> and the suspicion that intelligent systems can help people make genuinely better decisions.</p>
                <p>Reach me through my <a href="mailto:yusufhaikaln7@gmail.com" class="underline hover:opacity-70">email</a> or on <a href="https://www.linkedin.com/in/muhammad-yusuf-haikal/" class="underline hover:opacity-70">LinkedIn</a>.</p>
            </div>
            <div class="flex h-full flex-wrap items-end justify-end gap-3">
                <a class="inline-flex" href="https://www.linkedin.com/in/muhammad-yusuf-haikal/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
                    <img class="max-w-[20px] icon" src="/linkedin.png" alt="">
                </a>
                <a class="inline-flex" href="https://github.com/ternaksapi" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                    <img class="max-w-[20px] icon" src="/github.png" alt="">
                </a>
                <a class="inline-flex" href="https://medium.com/@yusufhaikall" target="_blank" rel="noopener noreferrer" aria-label="Medium profile">
                    <img class="max-w-[20px] icon" src="/medium.png" alt="">
                </a>
                <a class="inline-flex" href="https://www.instagram.com/ysfhaikal/" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile">
                    <img class="max-w-[20px] icon" src="/instagram.png" alt="">
                </a>
            </div>
        </div>
    </div>
</div>
<style>
    /* Theme-aware greeting text */
    :global([data-theme="dark"]) .greeting-text {
        color: #ffffff;
    }
    
    :global([data-theme="light"]) .greeting-text {
        color: #000000;
    }
    
    /* Ensure cursor follows the same color */
    :global([data-theme="dark"]) .greeting-text .cursor {
        color: #ffffff;
    }
    
    :global([data-theme="light"]) .greeting-text .cursor {
        color: #000000;
    }
</style>
