<svelte:head>
    <title>Works</title>
</svelte:head>

<script>
    import Header from "$lib/header.svelte";
    import Polaroid from "$lib/Polaroid.svelte";
    import ProjectCard from "$lib/ProjectCard.svelte";
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
                    <a href="https://drive.google.com/file/d/1QVSQq1eNA03CTcw3C1AFiAIePjJgidVq/view?usp=sharing">
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
        <Polaroid 
            src="front.jpg" 
            alt="Muhammad Yusuf Haikal" 
            rotation={3}
            size="100px"
        />
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
                <div class="hover:none mt-2 text-sm text-xs text-slate-400">cGPA: 3.55</div>
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
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Deep Learning
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Data Mining
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Information Retrieval Systems
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
                        <h3 class="gap-x-2 text-lg font-semibold sm:text-lg">Otoritas Jasa Keuangan</h3>   
                    </div>
                </div>
                <div class="flex items-start justify-between gap-x-2 gap-y-2 text-slate-400">
                    <div class="flex flex-col">
                        <h4 class="text-sm leading-none">Junior Supervisor, Digital Services and Cybersecurity Specialist Group</h4>
                        <p class="text-xs text-slate-500 mt-1">Jakarta, Indonesia</p>
                    </div>
                    <div class="hidden text-nowrap text-xs tabular-nums text-slate-500 sm:block sm:text-sm">July 2025 - November 2025</div>
                </div>
                <div class="hover:none mt-2 text-xs text-slate-400">
                    Built a Cloud Audit System with RAG pipeline for regulatory compliance across AWS, GCP, and Azure, enabling accurate evidence lookups from cloud documentation. Developed a comprehensive Cloud Security Checklist consolidating major compliance frameworks. Additionally created machine learning prototypes for credit scoring to explore modeling approaches and interpretability.
                </div>
                <div class="hover:none flex items-center">
                    <div class="hidden flex-wrap justify-start gap-1 py-2 sm:flex print:hidden">
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Cloud
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Cybersecurity
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            RAG
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            AWS
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            GCP
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Azure
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Credit Scoring
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Crypto/Digital Assets
                        </div>
                        <div class="focus:ring-ring inline-flex items-center text-nowrap rounded-md border border-transparent bg-slate-700 bg-opacity-50 px-2 py-0.5 align-middle text-xs font-semibold text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                            Regulatory Compliance
                        </div>
                    </div>
                </div>
                <div class="relative h-[200px] mt-4 mb-2 w-full">
                    <div class="absolute left-0 top-[10px]">
                        <Polaroid 
                            src="/ojk1.jpeg" 
                            alt="OJK Internship" 
                            rotation={-8}
                            size="140px"
                        />
                    </div>
                    <div class="absolute left-1/2 -translate-x-1/2 top-[25px]">
                        <Polaroid 
                            src="/ojk2.jpeg" 
                            alt="OJK Internship" 
                            rotation={5}
                            size="140px"
                        />
                    </div>
                    <div class="absolute right-0 top-0">
                        <Polaroid 
                            src="/ojk3.jpeg" 
                            alt="OJK Internship" 
                            rotation={-3}
                            size="140px"
                        />
                    </div>
                </div>
            </div>
            <div class="flex flex-col space-y-2 mb-6">
                <div class="flex items-start justify-between gap-x-2 gap-y-2 text-slate-400">
                    <div class="inline-flex flex-wrap items-center justify-between gap-x-2 gap-y-2 font-semibold">
                        <h3 class="gap-x-2 text-lg font-semibold sm:text-lg">Faculty of Computer Science, Universitas Indonesia</h3>   
                    </div>
                </div>
                <div class="flex items-start justify-between gap-x-2 gap-y-2 text-slate-400">
                    <div class="flex flex-col">
                        <h4 class="text-sm leading-none">Teaching Assistant of Advanced Programming</h4>
                        <p class="text-xs text-slate-500 mt-1">Depok, Indonesia</p>
                    </div>
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
                            Maintainability
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
                    <div class="flex flex-col">
                        <h4 class="text-sm leading-none">Teaching Assistant of Automata and Theory of Languages, International Program</h4>
                        <p class="text-xs text-slate-500 mt-1">Depok, Indonesia</p>
                    </div>
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
        <div class="flex flex-col space-y-2">
            <ProjectCard 
                title="Stocksboard"
                description="A Python-based stock screening and backtesting platform that combines technical analysis, machine learning optimization techniques, and interactive visualization to find profitable swing trading opportunities in IDX stocks."
                previewImage="/sb.png"
            />
            <ProjectCard 
                title="Heat-Safe Route Generator"
                description="A route-planning tool that calculates safer walking paths by integrating temperature data, heat-risk indices, and geospatial mapping. The system recommends alternative routes that minimize heat exposure, improving user comfort and safety in hot environments."
                href="http://ristek.link/heatsafe"
                previewImage="/hs.png"
            />
            <ProjectCard 
                title="Cloud Audit Dashboard"
                description="A monitoring dashboard that automates cloud asset auditing by aggregating configuration, compliance, and usage data from multiple cloud services. Built to help users identify misconfigurations, track security posture, and generate real-time insights for governance and operational decisions."
                href="https://ristek.link/cloudaudit"
            />
            <ProjectCard 
                title="AI Report Generator"
                description="Developed a Next.js-based AI report generator for Klinik Pintar, utilizing RAG with PostgreSQL, pgvector, and Google text embeddings to enable business analysts to create schema-driven reports."
                href="ristek.link/aireport"
                previewImage="/kp.png"
            />
            <ProjectCard 
                title="Food Commodity Price Forecasting Model"
                description="Developed a time series model using LightGBM to predict food commodity prices across Indonesian provinces, integrating Google Trends and weather data."
                href="https://ristek.link/datividia9"
                previewImage="/fc.png"
            />
            <ProjectCard 
                title="Tanam"
                description="Led a team to design Tanam, a digital solution for farmers to adapt to climate change, using user research, personas, and high-fidelity prototypes."
                href="http://ristek.link/TanamPrototype"
                previewImage="/phone placeholder.png"
            />
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