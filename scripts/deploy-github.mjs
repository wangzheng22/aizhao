/**
 * Deploy dist/ to the `gh-pages` branch for GitHub Pages.
 *
 * Usage:
 *   GIT_REPO=git@github.com:<user>/<repo>.git npm run deploy:github
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function capture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

let remote = process.env.GIT_REPO || process.env.GITHUB_REPO || '';
if (!remote) {
  for (const name of ['github', 'origin']) {
    try {
      remote = capture(`git remote get-url ${name}`);
      if (remote.includes('github.com')) break;
      remote = '';
    } catch {
      remote = '';
    }
  }
}

if (!remote) {
  console.error(`
请先配置 GitHub 仓库地址：
  git remote add github git@github.com:<你的用户名>/<仓库名>.git
  npm run deploy:github
`);
  process.exit(1);
}

console.log('Building with base /aizhao/ ...');
run('npm run build');

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist/ not found after build.');
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), 'github-pages-'));
console.log('Deploying to', remote, '(branch: gh-pages)');

try {
  cpSync(distDir, work, { recursive: true });
  writeFileSync(join(work, '.nojekyll'), '');
  run('git init', { cwd: work });
  run('git checkout -b gh-pages', { cwd: work });
  run('git add -A', { cwd: work });
  run('git -c user.name="github-pages" -c user.email="pages@local" commit -m "deploy: github pages"', {
    cwd: work,
  });
  run(`git push -f "${remote}" gh-pages`, { cwd: work });
  console.log(`
部署完成。
访问：https://wangzheng22.github.io/aizhao/
`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
