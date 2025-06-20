import { defineConfig } from 'vite'

export default defineConfig({
  // Tauri expects a static bundle
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },  // Vite options tailored for Tauri development
  clearScreen: false,
  // Use a different port to avoid conflicts
  server: {
    port: 1421,
    strictPort: false, // Allow Vite to find an available port if 1421 is taken
  },
  // Env variables starting with VITE_ will be exposed to your frontend code
  envPrefix: ['VITE_', 'TAURI_'],
})
