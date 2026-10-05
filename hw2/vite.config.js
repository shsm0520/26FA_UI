import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { copySharedFavicon } from '../shared-favicon.mjs'

copySharedFavicon(import.meta.url)

// Build with relative asset paths so each app works under /folder-name/.
// Example: project1/dist can be served from https://host/project1/.
export default defineConfig({
  base: './',
  plugins: [svelte()],
})
