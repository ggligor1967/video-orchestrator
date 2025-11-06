import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    svelte({
      // Suppress a11y warnings during development (plugin-level, not compiler)
      onwarn: (warning, handler) => {
        if (warning.code && warning.code.startsWith("a11y_")) return;
        handler(warning);
      },
    }),
  ],

  // Use relative paths for Tauri
  base: "./",

  // Tauri expects a fixed port, will fail if that port is not available
  server: {
    port: 1421,
    strictPort: true,
    host: "127.0.0.1",
  },

  // To make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],

  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
