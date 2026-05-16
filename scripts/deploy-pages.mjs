import { execSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

process.env.STREAMHUB_PAGES_BASE = '/11-StreamHub/'
console.log('[deploy-pages] building with base', process.env.STREAMHUB_PAGES_BASE)
execSync('npm run build', { stdio: 'inherit', cwd: root })
execSync('npx --yes gh-pages -d dist -m "Deploy StreamHub"', { stdio: 'inherit', cwd: root })
