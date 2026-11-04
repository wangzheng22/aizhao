/**
 * 从 Excel 抽提结果表生成 src/data/chapterExtractRows.ts
 * 用法: node scripts/import-chapter-extract-xlsx.mjs <path-to.xlsx>
 *
 * 默认列映射：B=章节，C=抽提字段，D=抽提信息（首行可为表头，含「章节/字段」等关键字时自动跳过）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error('请传入 xlsx 路径，例如: node scripts/import-chapter-extract-xlsx.mjs ./抽提结果.xlsx');
  process.exit(1);
}

let XLSX;
try {
  XLSX = require('xlsx');
} catch {
  console.error('请先安装 xlsx: npm install -D xlsx');
  process.exit(1);
}

const workbook = XLSX.readFile(path.resolve(xlsxPath));
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });

const dataRows = rows.filter((row) => {
  const b = String(row[1] ?? '').trim();
  const c = String(row[2] ?? '').trim();
  if (!b || !c) return false;
  if (/章节|字段|抽提/.test(b) && /字段|抽提|信息/.test(c)) return false;
  return true;
});

const lines = dataRows.map((row) => {
  const chapter = String(row[1] ?? '').trim().replace(/'/g, "\\'");
  const fieldName = String(row[2] ?? '').trim().replace(/'/g, "\\'");
  const extractedValue = String(row[3] ?? '').trim().replace(/'/g, "\\'");
  return `  { chapter: '${chapter}', fieldName: '${fieldName}', extractedValue: '${extractedValue}' },`;
});

const out = `import type { ChapterExtractRow } from '../types/chapterReview';

/** 由 scripts/import-chapter-extract-xlsx.mjs 自动生成，请勿手改 */
export const chapterExtractRows: ChapterExtractRow[] = [
${lines.join('\n')}
];
`;

const target = path.join(__dirname, '../src/data/chapterExtractRows.ts');
fs.writeFileSync(target, out, 'utf8');
console.log(`已写入 ${dataRows.length} 行 -> ${target}`);
