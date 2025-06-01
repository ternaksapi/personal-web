import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Create a writable store for theme
function createThemeStore() {
    const { subscribe, set, update } = writable('dark');

    return {
        subscribe,
        toggle: () => update(theme => theme === 'dark' ? 'light' : 'dark'),
        set,
        init: () => {
            if (browser) {
                // Check localStorage first, then system preference
                const stored = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const initialTheme = stored || (systemPrefersDark ? 'dark' : 'light');
                
                set(initialTheme);
                document.documentElement.setAttribute('data-theme', initialTheme);
                
                // Save to localStorage whenever theme changes
                return subscribe(theme => {
                    localStorage.setItem('theme', theme);
                    document.documentElement.setAttribute('data-theme', theme);
                });
            }
        }
    };
}

export const theme = createThemeStore();