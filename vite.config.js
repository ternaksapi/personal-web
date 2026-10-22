import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['preview.kalkalkal.xyz']
	},
	ssr: { noExternal: ['@lucide/svelte'] }
});
