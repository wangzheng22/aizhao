/**
 * 构建相对路径静态站并打包，便于解压后通过本地/内网 HTTP 分享给他人预览。
 *
 * Usage: npm run build:share
 */
import { execSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const outDir = join(root, 'share-preview');
const zipPath = join(root, 'share-preview.zip');
const PREVIEW_PORT = 4173;

const readme = `智能招标文件编制 — 静态预览包
================================

【最重要】不要双击 index.html！浏览器会拦截脚本，页面会空白。

【Mac 用户】
  双击「启动预览.command」，会自动打开浏览器。

【Windows 用户】
  双击「启动预览.bat」（需已安装 Python）。

【或手动】在本文件夹打开终端，执行：
  python3 -m http.server ${PREVIEW_PORT}
  浏览器访问 http://127.0.0.1:${PREVIEW_PORT}/

【上传给他人】
  发整个 share-preview 文件夹或 share-preview.zip；
  对方同样用上面的方式启动，或部署到公司内网静态服务器。

生成命令：npm run build:share
`;

const howToOpenHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>如何打开预览</title>
  <style>
    body { font-family: -apple-system, "PingFang SC", sans-serif; max-width: 520px; margin: 48px auto; padding: 0 20px; color: #262626; line-height: 1.6; }
    h1 { font-size: 20px; }
    .warn { background: #fff7e6; border: 1px solid #ffd591; padding: 12px 14px; border-radius: 6px; margin: 16px 0; }
    ol { padding-left: 1.2em; }
    li { margin: 8px 0; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>请先启动本地预览，再访问页面</h1>
  <div class="warn">直接双击 <strong>index.html</strong> 无法正常显示（浏览器安全限制）。</div>
  <p><strong>Mac：</strong>双击 <strong>启动预览.command</strong></p>
  <p><strong>Windows：</strong>双击 <strong>启动预览.bat</strong>（需 Python）</p>
  <p>或在本目录终端执行：</p>
  <ol>
    <li><code>python3 -m http.server ${PREVIEW_PORT}</code></li>
    <li>浏览器打开 <code>http://127.0.0.1:${PREVIEW_PORT}/</code></li>
  </ol>
  <p>详细说明见 <strong>分享说明.txt</strong></p>
</body>
</html>
`;

const macLauncher = `#!/bin/bash
cd "$(dirname "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  osascript -e 'display alert "未找到 python3，请先安装 Python 3" as critical'
  exit 1
fi
PORT=${PREVIEW_PORT}
while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done
echo "正在启动预览 http://127.0.0.1:\${PORT}/"
python3 -m http.server "$PORT" &
SRV_PID=$!
sleep 1
open "http://127.0.0.1:\${PORT}/"
echo ""
echo "预览已打开。关闭本窗口将停止服务。"
read -r -p "按回车键结束预览…"
kill "$SRV_PID" 2>/dev/null
`;

const winLauncher = `@echo off
cd /d "%~dp0"
set PORT=${PREVIEW_PORT}
where python >nul 2>nul
if errorlevel 1 (
  echo 未找到 Python，请安装 Python 3 后重试。
  pause
  exit /b 1
)
echo 正在启动预览 http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"
python -m http.server %PORT%
`;

const requiredPaths = [
  'index.html',
  'documents/sample-bidding-doc.pdf',
  'brand-logo.png',
  'icons/ai-badge.png',
];

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

run('npm run build -- --base ./');

if (!existsSync(distDir)) {
  console.error('dist/ 未生成');
  process.exit(1);
}

for (const rel of requiredPaths) {
  if (!existsSync(join(distDir, rel))) {
    console.error(`构建不完整，缺少 dist/${rel}`);
    process.exit(1);
  }
}

writeFileSync(join(distDir, '分享说明.txt'), readme, 'utf8');
writeFileSync(join(distDir, '如何打开.html'), howToOpenHtml, 'utf8');
writeFileSync(join(distDir, '启动预览.command'), macLauncher, 'utf8');
writeFileSync(join(distDir, '启动预览.bat'), winLauncher, 'utf8');
chmodSync(join(distDir, '启动预览.command'), 0o755);

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(distDir, outDir, { recursive: true });
chmodSync(join(outDir, '启动预览.command'), 0o755);

if (existsSync(zipPath)) rmSync(zipPath);

try {
  run(`cd "${root}" && zip -r -q share-preview.zip share-preview`);
  console.log('\n已生成：');
  console.log(`  文件夹  ${outDir}`);
  console.log(`  压缩包  ${zipPath}`);
  console.log('\n请双击 share-preview/启动预览.command 打开（不要直接双击 index.html）');
} catch {
  console.log('\n已生成文件夹（未打包 zip，可手动压缩 share-preview/）：');
  console.log(`  ${outDir}`);
}
