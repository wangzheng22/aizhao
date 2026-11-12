/**
 * 打包整份源码（不含 node_modules / 构建产物），便于同事本地安装运行。
 *
 * Usage: npm run package:source
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = process.cwd();
const folderName = 'bidding-doc-prep-v3';
const zipName = `${folderName}-source.zip`;
const zipPath = join(root, zipName);
const readmePath = join(root, '源码分享说明.txt');

const readme = `智能招标文件编制 v3 — 源码包
================================

【环境要求】
  - Node.js 18+（推荐 20 LTS）
  - npm 9+

【首次运行】
  1. 解压本压缩包到任意目录
  2. 在终端进入解压后的 ${folderName} 目录，执行：
       npm install
       npm run dev
  3. 浏览器打开终端里显示的地址（一般为 http://localhost:5173/ 或 5176）

【常用命令】
  npm run dev            — 本地开发预览（热更新）
  npm run build          — 生产构建（输出 dist/）
  npm run build:share    — 生成静态预览包 share-preview.zip
  npm run package:source — 重新打包源码 zip

【给同事只看效果、不跑 Node】
  在项目里执行 npm run build:share，发送 share-preview.zip 即可。

【说明】
  - 本包不含 node_modules，对方需联网执行 npm install
  - 示例 PDF：public/documents/；首页资源：public/figma-home/

打包命令：npm run package:source
`;

writeFileSync(readmePath, readme, 'utf8');

const tempRoot = mkdtempSync(join(tmpdir(), 'bidding-src-'));
const staging = join(tempRoot, folderName);

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

try {
  const excludes = [
    'node_modules',
    'dist',
    'share-preview',
    '.git',
    zipName,
    'share-preview.zip',
  ]
    .map((name) => `--exclude=${name}`)
    .join(' ');

  run(`rsync -a ${excludes} "${root}/" "${staging}/"`);

  if (existsSync(zipPath)) rmSync(zipPath);
  run(`cd "${tempRoot}" && zip -r -q "${zipPath}" "${folderName}"`);

  const listing = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf8' });
  if (listing.includes('node_modules/')) {
    console.error('打包校验失败：仍包含 node_modules');
    process.exit(1);
  }

  const sizeMb = (readFileSync(zipPath).length / (1024 * 1024)).toFixed(1);
  console.log(`\n已生成源码压缩包（约 ${sizeMb} MB）：\n  ${zipPath}`);
  console.log('\n解压后为单个文件夹，内含「源码分享说明.txt」。');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
