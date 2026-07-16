/**
 * Deploy dist/ to the `gh-pages` branch for Gitee Pages.
 *
 * Usage:
 *   GITEE_REPO=https://gitee.com/<user>/<repo>.git npm run deploy:gitee
 *
 * Or set remote `gitee` first:
 *   git remote add gitee https://gitee.com/<user>/<repo>.git
 *   npm run deploy:gitee
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, cpSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist/ not found. Run npm run build first.');
  process.exit(1);
}

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function capture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

let remote = process.env.GITEE_REPO || '';
if (!remote) {
  try {
    remote = capture('git remote get-url gitee');
  } catch {
    try {
      remote = capture('git remote get-url origin');
    } catch {
      remote = '';
    }
  }
}

if (!remote) {
  console.error(`
请先配置 Gitee 仓库地址，任选一种：

  1) export GITEE_REPO=https://gitee.com/<你的用户名>/<仓库名>.git
     npm run deploy:gitee

  2) git remote add gitee https://gitee.com/<你的用户名>/<仓库名>.git
     npm run deploy:gitee
`);
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), 'gitee-pages-'));
console.log('Deploying to', remote, '(branch: gh-pages)');
console.log('Work dir:', work);

try {
  cpSync(distDir, work, { recursive: true });
  run('git init', { cwd: work });
  run('git checkout -b gh-pages', { cwd: work });
  run('git add -A', { cwd: work });
  run('git -c user.name="gitee-pages" -c user.email="pages@local" commit -m "deploy: gitee pages"', {
    cwd: work,
  });
  run(`git push -f "${remote}" gh-pages`, { cwd: work });
  console.log(`
部署完成。接下来在 Gitee 仓库页面：
  服务 → Gitee Pages → 部署分支选 gh-pages，目录选 / → 启动
完成后访问：
  https://<用户名>.gitee.io/<仓库名>/
`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
