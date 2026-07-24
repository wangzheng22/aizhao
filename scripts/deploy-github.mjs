/**
 * Deploy dist/ into the existing aizhao GitHub Pages site under /aiping/.
 * (Same hosting as 智能招文编: https://wangzheng22.github.io/aizhao/)
 *
 * Usage:
 *   npm run deploy:github
 *
 * Keeps a local cache at .gh-pages-cache/ to avoid re-cloning the large Pages branch.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PAGES_REPO = process.env.GIT_REPO || 'git@github.com:wangzheng22/aizhao.git'
const SITE_PATH = 'aiping'
const PUBLIC_URL = 'https://wangzheng22.github.io/aizhao/aiping/'
const CACHE_DIR = join(process.cwd(), '.gh-pages-cache')

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts })
}

function capture(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts }).trim()
}

console.log('Building with base /aizhao/aiping/ ...')
run('npm run build')

const distDir = join(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  console.error('dist/ not found after build.')
  process.exit(1)
}

if (!existsSync(join(CACHE_DIR, '.git'))) {
  console.log('Cloning gh-pages into .gh-pages-cache (first time only)...')
  rmSync(CACHE_DIR, { recursive: true, force: true })
  run(`git clone --depth 1 --branch gh-pages "${PAGES_REPO}" "${CACHE_DIR}"`)
} else {
  console.log('Updating .gh-pages-cache ...')
  try {
    run('git fetch --depth 1 origin gh-pages', { cwd: CACHE_DIR })
    run('git reset --hard origin/gh-pages', { cwd: CACHE_DIR })
  } catch {
    console.warn('Cache update failed, re-cloning...')
    rmSync(CACHE_DIR, { recursive: true, force: true })
    run(`git clone --depth 1 --branch gh-pages "${PAGES_REPO}" "${CACHE_DIR}"`)
  }
}

const target = join(CACHE_DIR, SITE_PATH)
rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(distDir, target, { recursive: true })
writeFileSync(join(CACHE_DIR, '.nojekyll'), '')

run('git add -A', { cwd: CACHE_DIR })
const dirty = capture('git status --porcelain', { cwd: CACHE_DIR })
if (!dirty) {
  console.log('No changes to commit.')
  console.log(`访问：${PUBLIC_URL}`)
  process.exit(0)
}

run(
  'git -c user.name="github-pages" -c user.email="pages@local" commit -m "deploy: AI智能评标 -> /aiping/"',
  { cwd: CACHE_DIR },
)
run('git push origin HEAD:gh-pages', { cwd: CACHE_DIR })
console.log(`
部署完成。
访问：${PUBLIC_URL}
`)
