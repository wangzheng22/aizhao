import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { FieldAnchorRect } from '../types/completeness';
import { findNeedleInText } from './textSearchInDocument';

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
};

function isTextItem(item: unknown): item is PdfTextItem {
  return typeof item === 'object' && item !== null && 'str' in item;
}

function mergeRects(rects: FieldAnchorRect[]): FieldAnchorRect | null {
  if (!rects.length) return null;

  const x = Math.min(...rects.map((rect) => rect.x));
  const y = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.width));
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.height));

  return {
    x,
    y,
    width: maxX - x,
    height: maxY - y,
  };
}

function getMatchRects(
  items: PdfTextItem[],
  startIdx: number,
  endIdx: number,
  viewportHeight: number,
): FieldAnchorRect | null {
  let pos = 0;
  const rects: FieldAnchorRect[] = [];

  for (const item of items) {
    const len = item.str.length;
    const itemStart = pos;
    const itemEnd = pos + len;

    if (itemEnd > startIdx && itemStart < endIdx) {
      const [, , , , x, y] = item.transform;
      const fontHeight = Math.hypot(item.transform[2], item.transform[3]) || 12;
      const width = item.width || fontHeight * Math.max(item.str.length, 1) * 0.55;

      rects.push({
        x,
        y: viewportHeight - y - fontHeight,
        width,
        height: fontHeight * 1.25,
      });
    }

    pos += len;
  }

  return mergeRects(rects);
}

export async function findTextAnchor(
  pdf: PDFDocumentProxy,
  searchText: string,
  pageHint?: number,
): Promise<{ pageNumber: number; rect: FieldAnchorRect } | null> {
  const allPages = Array.from({ length: pdf.numPages }, (_, index) => index + 1);
  const pages = pageHint
    ? [pageHint, ...allPages.filter((pageNumber) => pageNumber !== pageHint)]
    : allPages;

  for (const pageNumber of pages) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items: PdfTextItem[] = [];

    for (const item of textContent.items) {
      if (isTextItem(item)) {
        items.push(item);
      }
    }

    const fullText = items.map((item) => item.str).join('');
    const hit = findNeedleInText(fullText, searchText);
    if (!hit) continue;
    const startIdx = hit.start;

    const viewport = page.getViewport({ scale: 1 });
    const rect = getMatchRects(items, startIdx, startIdx + hit.length, viewport.height);

    if (rect) {
      return { pageNumber, rect };
    }
  }

  return null;
}
