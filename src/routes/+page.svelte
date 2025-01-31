<script>
    import Header from "$lib/header.svelte";
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
                <img class="max-w-[180px]" src="/front.jpeg" alt="hi.jpeg">
                <div id="typing-container" class="text-xl text-[#decff1]">
                    <span id="typing-text"></span>
                    <span class="cursor">|</span>
                </div>
                <li>I am a penultimate Computer Science student at Universitas Indoesia, currently in my 6th semester.</li>
                <li>I have a keen interest in Data Science and Machine Learning, but I am also open to other fields.</li>
                <li>Outside of my studies, I am a big fan of reading, running, Formula 1, and the I like to watch trending movies on letterboxd.</li>
                <li>If anything you saw interested you, feel free to contact me :)</li>
            </div>
            <div class="flex h-full flex-wrap items-end justify-end space-x-1">
                <a href="https://www.linkedin.com/in/muhammad-yusuf-haikal/"><img class="max-w-[20px]" src="/linkedin.png" alt="linkedin.png"></a>
                <p class="inline sm:invisible sm:block sm:pr-0">_</p>
                <a href="https://github.com/ternaksapi"><img class="max-w-[20px]" src="/github.png" alt="github.png"></a>
                <p class="inline sm:invisible sm:block sm:pr-0">_</p>
                <a href="https://www.instagram.com/ysfhaikal/"><img class="max-w-[20px]" src="/instagram.png" alt="instagram.png"></a>
            </div>
        </ul>
    </div>
</div>
<style>

</style>