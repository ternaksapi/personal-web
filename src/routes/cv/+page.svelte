<script>
    import Header from "$lib/header.svelte";
</script>

<div class="transition-all duration-[2000ms] h-full w-full sm:space-y-15 max-w-md space-y-10  sm:max-w-md md:max-w-lg lg:max-w-lg ">
    <Header />
    <section class="flex w-full max-w-lg flex-col items-start justify-between gap-x-10 gap-y-8 sm:flex-row print:flex-row">
        <div class="space-y-4 flex-1">
            <h1 class="text-2xl font-bold">
                <span tabindex="0" role="text">Muhammad Yusuf Haikal</span>
            </h1>
            <!---->
            <p class="max-w-md text-sm text-slate-300">
                <span tabindex="0" role="text">Computer Science Student</span>
            </p>
            <!---->
            <a class="align-baseline text-xs leading-none text-slate-500 transition-colors hover:text-slate-200" target="_blank" href="https://maps.app.goo.gl/LHsbFfPdi8RG8uWw5">
                <span tabindex="0" role="text">Depok, Indonesia</span>
                <!---->
            </a>
            <div class='flex flex-wrap gap-x-2 pt-1 text-sm text-slate-500 print:hidden'>
                <div class='ring-offset-background focus-visible:ring-ring flex flex-col items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:inline-flex print:hidden'>
                    <a href="https://drive.google.com/file/d/1yt0c7Gyb8ZOdWaMyym6_XuZdZAmUGA0p/view?usp=sharing">
                        <span tabindex="0" role="text">[Resume]</span>
                        <!---->
                    </a>
                </div>
                <div class=' ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'>
                    <a href="mailto:yusufhaikaln7@gmail.com">
                        <span tabindex="0" role="text">[Email]</span>
                        <!---->
                    </a>
                </div>
                <div class='ring-offset-background focus-visible:ring-ring flex flex-col items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:inline-flex print:hidden'>
                    <a href="https://www.linkedin.com/in/muhammad-yusuf-haikal/">
                        <span tabindex="0" role="text">[LinkedIn]</span>
                        <!---->
                    </a>
                </div>
                <div class='ring-offset-background focus-visible:ring-ring flex flex-col items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:inline-flex print:hidden'>
                    <a href="https://github.com/ternaksapi">
                        <span tabindex="0" role="text">[GitHub]</span>
                        <!---->
                    </a>
                </div>
            </div>
        </div>
        <img src="front.jpeg" alt="me.jpg" class="max-h-36 sm:max-h-36">
    </section>
    <article class="max-w-lg">
        <section class="print-force-new-page flex min-h-0 scroll-mb-16 flex-col gap-y-3">
            <h2 class="text-xl font-bold">Education</h2>
            <div class="rounded-lg text-slate-100">
                <div class="flex flex-col space-y-2">
                    <div class="flex items-center justify-between gap-x-2 text-slate-400">
                        <h3 class="text-lg font-semibold sm:text-lg">Universitas Indonesia</h3>
                        <div class="hidden text-xs tabular-nums text-slate-500 sm:block sm:text-nowrap sm:text-sm">2022 - 2026 (Expected)</div>
                    </div>
                </div>
                <div class="hover:none mt-2 text-sm text-xs text-slate-400">cGPA: 3.49</div>
                <div class="hover:none mt-2 text-sm text-xs text-slate-500">Bachelor's Degree in Computer Science</div>
                <div class="hover:none flex items-center">
                    <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Foundations of Programming 1 
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Calculus 1
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Discrete Mathematics 1
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Introduction to Digital System
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Foundations of Programming 2
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Calculus 2
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Discrete Mathematics 2
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Scientific Writing & Research Methodology
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Introduction to Computer Organization
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Linear Algebra
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Platform Based Programming
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Operating System
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Data Structures and Algorithms
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Numerical Analysis
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Database
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Advanced Programming
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Human-Computer Interaction
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Statistics and Probability
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Automata and Theory of Languages
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Design and Analysis of Algorithms
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Computer Networks
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Introduction to Artificial Intelligence and Data Science
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Software Engineering
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Embedded System
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </article>
 <article class="max-w-lg">
    <section class="print-force-new-page flex min-h-0 scroll-mb-16 flex-col gap-y-3">
        <h2 class="text-xl font-bold">Experience</h2>
        <div class="rounded-lg text-slate-100">
            <div class="flex flex-col space-y-2 mb-6">
                <div class="flex items-start justify-between gap-x-2 gap-y-2 text-slate-400">
                    <div class="inline-flex flex-wrap items-center justify-between gap-x-2 gap-y-2 font-semibold">
                        <h3 class="gap-x-2 text-lg font-semibold sm:text-lg">Faculty of Computer Science, Universitas Indonesia</h3>   
                    </div>
                </div>
                <div class="flex items-start justify-between gap-x-2 gap-y-2 text-slate-400">
                    <h4 class="text-sm leading-none">Teaching Assistant of Advanced Programming </h4>
                    <div class="hidden text-nowrap text-xs tabular-nums text-slate-500 sm:block sm:text-sm">Jan 2025 - June 2025</div>
                </div>
                <div class="hover:none mt-2 text-xs text-slate-400">
                    Assist the lecturer in teaching the course, help students with their assignments, and provide feedback on their group project.
                </div>
                <div class="hover:none flex items-center">
                    <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Coding Standards
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Continuous Integration & DevOps
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Maintainabilty
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            OO Principles
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Test Driven Development & Refactoring
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Concurrency
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Maintainability
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Design Patterns
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Software Architecture
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            High-Level Networking
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Asynchronous Programming
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Deployment & Monitoring
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col space-y-2"> 
                <div class="flex items-start justify-between gap-x-2 gap-y-2 text-slate-400">
                    <h4 class="text-sm leading-none">Teaching Assistant of Automata and Theory of Languages, International Program </h4>
                    <div class="hidden text-nowrap text-xs tabular-nums text-slate-500 sm:block sm:text-sm">Aug 2024 - Dec 2024</div>
                </div>
                <div class="hover:none mt-2 text-xs text-slate-400">
                   Under Ir. Suryana Setiawan, M.Sc., Ph.D., I assisted and provide assignments feedback for 36 international program students in the course of Automata and Theory of Languages.
                </div>
                <div class="hover:none flex items-center">
                    <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Strings, Languages, and Operations
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Regular Languages
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Regular Expressions
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Deterministic Finite Automata
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Non-Deterministic Finite Automata
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Kleene's Theorem
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Pumping Lemma
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Context-Free Grammars
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Pushdown Automata
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Turing Machines
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Context-Free Languages
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Chomsky Hierarchy
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Decision Problems
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</article>
<article class="max-w-lg">
    <section class="print-force-new-page flex min-h-0 scroll-mb-16 flex-col gap-y-3">
        <h2 class="text-xl font-bold">Projects</h2>
        <div class="rounded-lg text-slate-100">
            <div class="flex flex-col space-y-2">
                <div class="flex items-center gap-x-2">
                    <h3 class="text-lg font-semibold">Personal Website</h3>
                    <a href="https://kalkalkal.xyz" target="_blank" class="rounded-full bg-slate-700 p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </div>
                <p class="text-sm text-slate-400">Created this website since it didn't sit right with me that people are using instagram the same way they use LinkedIn.</p>
                <div class="hover:none flex items-center">
                    <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            SvelteKit
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            TailwindCSS
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col space-y-2">
            <div class="flex items-center gap-x-2">
                <h3 class="text-lg font-semibold">Global Terrorism Data Analysis and Machine Learning Model</h3>
                <a href="http://ristek.link/NotebookGTHaikal" target="_blank" class="rounded-full bg-slate-700 p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
            <p class="text-sm text-slate-400">Created an Exploratory Data Analysis using a slightly modified version of the Global Terrorism Database, which consisted of 33,140 records and 135 columns. In this project, I created two different machine learning model, one for predicting the target type for a given record, and another one for predicting the amount of damages caused by a terrorist attack. Also created a clustering model to group the data with Hierarchical Agglomerative Clustering and K-Means using values from elbow method, silhoutte score, and cluster dendogram</p>
            <div class="hover:none flex items-center">
                <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Python
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Machine Learning
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">  
                        Data Visualization
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Data Preprocessing
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Data Analysis
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Clustering
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col space-y-2">
            <div class="flex items-center gap-x-2">
                <h3 class="text-lg font-semibold">Intelligent Lighting System</h3>
                <a href="https://github.com/JokoTech-SiNam24/IntelligentLighting" target="_blank" class="rounded-full bg-slate-700 p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
            <p class="text-sm text-slate-400">For my final project in the Embedded System course, I created an intelligent lighting system using LDR Sensor, PIR Sensor, and the XMEGA-A3BU XPLAINED microcontroller. The system is able to detect the presence of a person and adjust the lighting intensity based on the amount of ambient light detected.</p>
            <div class="hover:none flex items-center">
                <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        AVR
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">  
                        Embedded System
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        XMEGA-A3BU XPLAINED
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        LDR Sensor
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        PIR Sensor
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col space-y-2">
            <div class="flex items-center gap-x-2">
                <h3 class="text-lg font-semibold">Tanam</h3>
                <a href="http://ristek.link/TanamPrototype" target="_blank" class="rounded-full bg-slate-700 p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
            <p class="text-sm text-slate-400">Tanam is a digital solution proposed by me and my team in the Human-Computer Interaction final project, designed to help farmers and agricultural experts adapt to the challenges of climate change, such as unpredictable rainfall and extreme temperatures that threaten crop productivity. 
                As the project lead, I guided the team through a structured design process, starting with problem identification using the Value Proposition Canvas, followed by user research through interviews with five agriculture professionals. 
                Insights from these interviews shaped our user personas, user journey mapping, and task analysis, which informed the development of key application features. We then structured the Information Architecture, created wireframes, and refined 
                them into a High Fidelity Design to ensure an intuitive and effective user experience. By combining research-driven design with user-centered development, Tanam aims to support sustainable agriculture in an era of climate uncertainty.</p>
            <div class="hover:none flex items-center">
                <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Figma
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        User Research
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        User Experience Design
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Information Architecture
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"> 
                        High Fidelity Design
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"> 
                        User Persona
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"> 
                        User Journey Mapping
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"> 
                        Task Analysis
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"> 
                        Wireframe
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col space-y-2">
            <div class="flex items-center gap-x-2">
                <h3 class="text-lg font-semibold">HeyMart</h3>
                <a href="https://github.com/advpro-2024-a13" target="_blank" class="rounded-full bg-slate-700 p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
            <p class="text-sm text-slate-400">HeyMart is a web application designed to simplify daily shopping for users while helping supermarket administrators manage and sell their products efficiently. For this project, I contributed to the design and implementation of product handling. 
                HeyMart follows a microservices architecture, ensuring scalability and maintainability, and applies software engineering best practices such as SOLID principles, design patterns, and secure coding. The application integrates REST APIs for seamless communication between services 
                and leverages CI/CD pipelines, automated deployment, and monitoring tools to enhance reliability. With a focus on user experience and operational efficiency, HeyMart provides a streamlined and secure shopping ecosystem for both consumers and store owners.</p>
            <div class="hover:none flex items-center">
                <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Java
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Spring Boot
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Microservices
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        REST API
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Docker
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        SonarQube
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        CI/CD
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        SOLID Principles
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        Design Patterns
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col space-y-2">
            <div class="flex items-center gap-x-2">
                <h3 class="text-lg font-semibold">Pacilflix</h3>
                <a href="https://github.com/Basis-Data-A10/Pacilflix-A10" target="_blank" class="rounded-full bg-slate-700 p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
            <p class="text-sm text-slate-400">Pacilflix is a comprehensive streaming platform designed as a final project for my Database course, 
                utilizing PostgreSQL as its primary database management system. The platform offers a wide range of features, including user authentication, 
                trailer and show browsing, user reviews, download management, and favorite lists. Users can register, log in, and explore a curated list of top 
                shows and movies, with detailed information available for each title. The system supports user interactions such as adding reviews, managing subscriptions, 
                and organizing favorite content. Additionally, Pacilflix includes administrative functionalities for managing contributors and subscription packages. 
                The project emphasizes robust database design and implementation, ensuring efficient data handling and user experience.</p>
            <div class="hover:none flex items-center">
                <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        DBMS
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        PostgreSQL
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        HTML
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        CSS
                    </div>
                    <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                        JavaScript
                    </div>
                </div>
            </div>
        </div>
        
    </section>
</article>
</div>

<style>
    .about {
        text-align: center;
        display: block;
        margin: 20px auto;
    }
</style>