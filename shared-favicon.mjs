import { copyFileSync, mkdirSync } from 'node:fs'

// Keep icon2.png at the repository root as the only maintained source.
// Vite loads this configuration for both the development server and builds.
export function copySharedFavicon(configUrl) {
  const publicDir = new URL('./public/', configUrl)
  mkdirSync(publicDir, { recursive: true })
  for (const filename of ['favicon.png', 'icon.png']) {
    copyFileSync(new URL('./icon2.png', import.meta.url), new URL(filename, publicDir))
  }
}
