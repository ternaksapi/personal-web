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

        let element = document.getElementById('typing-text');
        if (element) element.textContent = currentText;

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
    <title>Muhammad Yusuf Haikal</title>
</svelte:head>
<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10  sm:max-w-md md:max-w-lg lg:max-w-lg ">
    <Header />
    <div class="flex h-full w-full max-w-lg flex-col items-start">
        <ul class="flex flex-col space-y-5">
            <h1 class="text-3xl font-bold"><span tabindex="0" role="text">Muhammad Yusuf Haikal</span>
            <!---->
            </h1>
            <a class="w-fit text-slate-300" href="mailto:yusufhaikaln7@gmail.com"><span tabindex="0" role="text">yusufhaikaln7@gmail.com</span>
            <!---->
            </a>
            <h3 class="text-slate-500"><span tabindex="0" role="text">Depok, Indonesia</span>
            <!---->
            </h3>
            <div class="flex h-full w-full max-w lg flex-col items-start space-y-4">
                <Polaroid 
                    src="/front.jpg" 
                    alt="Muhammad Yusuf Haikal" 
                    caption="that's me!" 
                    rotation={-3}
                />
                <div id="typing-container" class="text-xl greeting-text mt-4">
                    <span id="typing-text"></span>
                    <span class="cursor">|</span>
                </div>
                <li>I'm Muhammad Yusuf Haikal, a Computer Science student at Universitas Indonesia currently in my 8th semester.</li>
                <li>I'm driven by <a href="https://www.cs.ox.ac.uk/activities/ieg/e-library/sources/t_article.pdf" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-70">Turing's question—"Can machines think?"</a>—and the belief that today's AI tools let us build nearly anything we can imagine. I'm optimistic about how technology, especially AI, can bring more good to humanity and create positive change in the world.</li>
                <li>Always open to collaboration and new opportunities. Reach out at yusufhaikal7@gmail.com or connect on LinkedIn :)</li>
            </div>
            <div class="flex h-full flex-wrap items-end justify-end space-x-1">
                <a href="https://www.linkedin.com/in/muhammad-yusuf-haikal/">
                    <img class="max-w-[20px] icon" src="/linkedin.png" alt="linkedin.png">
                </a>
                <p class="inline sm:invisible sm:block sm:pr-0">_</p>
                <a href="https://github.com/ternaksapi">
                    <img class="max-w-[20px] icon" src="/github.png" alt="github.png">
                </a>
                <p class="inline sm:invisible sm:block sm:pr-0">_</p>
                <a href="https://medium.com/@yusufhaikall">
                    <img class="max-w-[20px] icon" src="/medium.png" alt="medium.png">
                </a>
                <p class="inline sm:invisible sm:block sm:pr-0">_</p>
                <a href="https://www.instagram.com/ysfhaikal/">
                    <img class="max-w-[20px] icon" src="/instagram.png" alt="instagram.png">
                </a>
            </div>
        </ul>
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