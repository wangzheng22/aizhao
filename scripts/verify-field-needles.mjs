import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

globalThis.DOMMatrix = class {
  multiplySelf() {
    return this;
  }
  preMultiplySelf() {
    return this;
  }
  invertSelf() {
    return this;
  }
};

function findNeedleInText(haystack, needle) {
  const trimmed = needle.trim();
  if (!trimmed) return null;
  const direct = haystack.indexOf(trimmed);
  if (direct >= 0) return { start: direct, length: trimmed.length };
  const compactHay = haystack.replace(/\s+/g, '');
  const compactNeedle = trimmed.replace(/\s+/g, '');
  if (compactNeedle.length >= 4 && compactHay.includes(compactNeedle)) {
    return { start: 0, length: trimmed.length };
  }
  return null;
}

/** Simplified line extraction matching extractEditableDocument clustering */
async function extractLines(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();
  const raws = [];
  for (const item of textContent.items) {
    if (!item.str) continue;
    const [, , , , x, yPdf] = item.transform;
    const fontSize = Math.hypot(item.transform[2], item.transform[3]) || 12;
    const width = item.width ?? fontSize * item.str.length * 0.5;
    raws.push({
      text: item.str,
      fontSize,
      x,
      y: viewport.height - yPdf - fontSize,
      width,
    });
  }
  raws.sort((a, b) => a.y - b.y || a.x - b.x);
  const yTolerance = 3.2;
  const buffers = [];
  for (const raw of raws) {
    const current = buffers[buffers.length - 1];
    if (current && Math.abs(current.y - raw.y) <= Math.max(yTolerance, raw.fontSize * 0.28)) {
      const gap = raw.x - current.lastX;
      if (gap > raw.fontSize * 0.12) {
        const spaces = Math.max(1, Math.round(gap / (raw.fontSize * 0.35)));
        current.texts.push(' '.repeat(Math.min(spaces, 8)));
      }
      current.texts.push(raw.text);
      current.lastX = raw.x + raw.width;
    } else {
      buffers.push({
        texts: [raw.text],
        lastX: raw.x + raw.width,
        y: raw.y,
      });
    }
  }
  return buffers.map((b) => b.texts.join(''));
}

const pdf = await getDocument({
  data: new Uint8Array(readFileSync('./public/documents/sample-bidding-doc.pdf')),
  useWorkerFetch: false,
  isEvalSupported: false,
}).promise;

const tests = [
  [9, '项目名称：黄州区档案馆新馆及数字档案馆建设项目'],
  [9, '预算金额：A 包密集架 96.7595 万元'],
  [9, '2026 年 02 月 26 日 09 点 30 分'],
  [13, '财政性资金：2492045'],
  [13, '2.5 项目名称 黄州区档案馆新馆及数字档案馆建设项目'],
  [13, '2.6 项目地点 黄州区'],
  [11, '截止时间：2025'],
  [14, '投标截止时间 详见第一章'],
  [62, '质保期内，中标人应提供'],
];

for (const [pageHint, needle] of tests) {
  const lines = await extractLines(pdf, pageHint);
  const joined = lines.join(' ');
  const pageHit = findNeedleInText(joined, needle);
  const lineHit = lines.some((l) => findNeedleInText(l, needle));
  console.log(
    pageHint,
    pageHit ? 'PAGE' : '---',
    lineHit ? 'LINE' : '---',
    needle.slice(0, 50),
  );
  if (!pageHit) {
    const snippet = joined.slice(0, 200);
    console.log('  snippet:', snippet);
  }
}
