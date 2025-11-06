import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
const config = {
  preprocess: vitePreprocess(),

  compilerOptions: {
    // Tauri-specific compiler options
    hydratable: false,
  },
};

export default config;
