import type { PDFDocumentProxy } from 'pdfjs-dist';
import { findNeedleInText } from './textSearchInDocument';

export type EditableDocLine = {
  text: string;
  fontSize: number;
  /** Left edge in PDF points */
  x: number;
  /** Top edge in PDF points */
  y: number;
  /** Line width in PDF points */
  width: number;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  /** Gap from previous line bottom (PDF points), for flow fallback */
  gapBefore: number;
};

export type EditableDocPage = {
  pageNumber: number;
  width: number;
  height: number;
  /** Content bounding box used for page chrome */
  contentBox: { left: number; right: number; top: number; bottom: number };
  lines: EditableDocLine[];
};

export type EditableDocument = {
  pages: EditableDocPage[];
};

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  hasEOL?: boolean;
  fontName?: string;
};

function isTextItem(item: unknown): item is PdfTextItem {
  return typeof item === 'object' && item !== null && 'str' in item;
}

function isBoldFont(fontName?: string) {
  if (!fontName) return false;
  return /bold|black|heavy|semibold|medium/i.test(fontName);
}

/**
 * Extract PDF text into line-based pages with layout metrics close to the original.
 */
export async function extractEditableDocument(pdf: PDFDocumentProxy): Promise<EditableDocument> {
  const pages: EditableDocPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    type Raw = {
      text: string;
      fontSize: number;
      x: number;
      y: number;
      width: number;
      bold: boolean;
    };
    const raws: Raw[] = [];

    for (const item of textContent.items) {
      if (!isTextItem(item) || !item.str) continue;
      // Skip obvious noise / out-of-page glyphs
      const [, , , , x, yPdf] = item.transform;
      const fontSize = Math.hypot(item.transform[2], item.transform[3]) || 12;
      const width = item.width ?? fontSize * item.str.length * 0.5;
      if (x + width < -50 || x > viewport.width + 50) continue;

      raws.push({
        text: item.str,
        fontSize,
        x,
        y: viewport.height - yPdf - fontSize,
        width,
        bold: isBoldFont(item.fontName),
      });
    }

    raws.sort((a, b) => a.y - b.y || a.x - b.x);

    const yTolerance = 3.2;
    type LineBuf = {
      texts: string[];
      fontSize: number;
      x: number;
      y: number;
      lastX: number;
      right: number;
      bold: boolean;
    };
    const buffers: LineBuf[] = [];

    for (const raw of raws) {
      const current = buffers[buffers.length - 1];
      if (current && Math.abs(current.y - raw.y) <= Math.max(yTolerance, raw.fontSize * 0.28)) {
        const gap = raw.x - current.lastX;
        // Keep intentional letter-spacing / word gaps from the PDF
        if (gap > raw.fontSize * 0.12) {
          const spaces = Math.max(1, Math.round(gap / (raw.fontSize * 0.35)));
          current.texts.push(' '.repeat(Math.min(spaces, 8)));
        }
        current.texts.push(raw.text);
        current.lastX = raw.x + raw.width;
        current.right = Math.max(current.right, raw.x + raw.width);
        current.fontSize = Math.max(current.fontSize, raw.fontSize);
        current.bold = current.bold || raw.bold;
        // Prefer the topmost y of the cluster
        current.y = Math.min(current.y, raw.y);
      } else {
        buffers.push({
          texts: [raw.text],
          fontSize: raw.fontSize,
          x: raw.x,
          y: raw.y,
          lastX: raw.x + raw.width,
          right: raw.x + raw.width,
          bold: raw.bold,
        });
      }
    }

    const lines: EditableDocLine[] = [];
    let prevBottom = 0;

    for (const buf of buffers) {
      const text = buf.texts.join('').replace(/[ \t]+\n/g, '\n').replace(/\s+$/g, '');
      if (!text.trim()) continue;

      const width = Math.max(buf.right - buf.x, buf.fontSize);
      const center = buf.x + width / 2;
      const pageCenter = viewport.width / 2;
      const leftMargin = 70;
      const rightEdge = viewport.width - 70;

      let align: EditableDocLine['align'] = 'left';
      if (Math.abs(center - pageCenter) < 36 && buf.x > leftMargin + 40) {
        align = 'center';
      } else if (buf.x > pageCenter && buf.right > rightEdge - 30) {
        align = 'right';
      }

      const gapBefore = lines.length === 0 ? buf.y : Math.max(0, buf.y - prevBottom);

      lines.push({
        text,
        fontSize: buf.fontSize,
        x: buf.x,
        y: buf.y,
        width,
        align,
        bold: buf.bold || buf.fontSize >= 15,
        gapBefore,
      });

      prevBottom = buf.y + buf.fontSize;
    }

    const contentLeft = lines.length ? Math.min(...lines.map((line) => line.x)) : 90;
    const contentRight = lines.length
      ? Math.max(...lines.map((line) => line.x + line.width))
      : viewport.width - 90;
    const contentTop = lines.length ? Math.min(...lines.map((line) => line.y)) : 42;
    const contentBottom = lines.length
      ? Math.max(...lines.map((line) => line.y + line.fontSize))
      : viewport.height - 60;

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      contentBox: {
        left: contentLeft,
        right: contentRight,
        top: contentTop,
        bottom: contentBottom,
      },
      lines,
    });
  }

  return { pages };
}

export type IssueMarkCategory =
  | 'completeness'
  | 'smart-review'
  | 'comment'
  | 'field-ok'
  | 'field-missing'
  | 'field-issue';

export type IssueMarkSpec = {
  id: string;
  searchText: string;
  category: IssueMarkCategory;
  /** 优先在该页定位，避免目录/他章同名片段误匹配 */
  pageHint?: number;
};

/**
 * Escape HTML and wrap the first occurrence of each searchText with a mark span.
 */
export function buildMarkedHtml(
  plainText: string,
  marks: IssueMarkSpec[],
  applied: Record<string, string> = {},
  pageNumber?: number,
): string {
  type Segment =
    | { type: 'text'; value: string }
    | { type: 'mark'; id: string; category: IssueMarkSpec['category']; value: string; applied: boolean };

  let segments: Segment[] = [{ type: 'text', value: plainText }];
  const pageMarks = marks.filter(
    (mark) => !mark.pageHint || pageNumber === undefined || mark.pageHint === pageNumber,
  );
  const orderedMarks = [...pageMarks].sort((a, b) => b.searchText.length - a.searchText.length);

  for (const mark of orderedMarks) {
    const needle = mark.searchText;
    if (!needle) continue;

    const next: Segment[] = [];
    let found = false;

    for (const seg of segments) {
      if (seg.type === 'mark' || found) {
        next.push(seg);
        continue;
      }

      const hit = findNeedleInText(seg.value, needle);
      if (!hit) {
        next.push(seg);
        continue;
      }

      found = true;
      const before = seg.value.slice(0, hit.start);
      const matched = seg.value.slice(hit.start, hit.start + hit.length);
      const after = seg.value.slice(hit.start + hit.length);
      if (before) next.push({ type: 'text', value: before });

      const appliedText = applied[mark.id];
      next.push({
        type: 'mark',
        id: mark.id,
        category: mark.category,
        value: appliedText ?? matched,
        applied: Boolean(appliedText),
      });

      if (after) next.push({ type: 'text', value: after });
    }

    segments = next;
  }

  return segments
    .map((seg) => {
      if (seg.type === 'text') return escapeHtml(seg.value);
      const appliedClass = seg.applied ? ' editable-doc__mark--applied' : '';
      return `<mark data-issue-id="${escapeAttr(seg.id)}" class="editable-doc__mark editable-doc__mark--${seg.category}${appliedClass}" contenteditable="false">${escapeHtml(seg.value)}</mark>`;
    })
    .join('');
}

function wrapPlainLineWithMark(
  linePlain: string,
  hit: { start: number; length: number },
  mark: IssueMarkSpec,
  applied: Record<string, string>,
): string {
  const matched = linePlain.slice(hit.start, hit.start + hit.length);
  const appliedText = applied[mark.id];
  const value = appliedText ?? matched;
  const before = escapeHtml(linePlain.slice(0, hit.start));
  const after = escapeHtml(linePlain.slice(hit.start + hit.length));
  const appliedClass = appliedText ? ' editable-doc__mark--applied' : '';
  return `${before}<mark data-issue-id="${escapeAttr(mark.id)}" class="editable-doc__mark editable-doc__mark--${mark.category}${appliedClass}" contenteditable="false">${escapeHtml(value)}</mark>${after}`;
}

function collectMarkIdsFromHtml(html: string): string[] {
  const ids: string[] = [];
  const re = /data-issue-id="([^"]+)"/g;
  let match = re.exec(html);
  while (match) {
    ids.push(match[1]);
    match = re.exec(html);
  }
  return ids;
}

function applyMarksToPlainLine(
  linePlain: string,
  marks: IssueMarkSpec[],
  applied: Record<string, string>,
  pageNumber: number,
): { html: string; placedIds: string[] } {
  const html = buildMarkedHtml(linePlain, marks, applied, pageNumber);
  return { html, placedIds: collectMarkIdsFromHtml(html) };
}

/**
 * 按 PDF 行分别打 mark，避免 join('\\n') 后 split 弄断 HTML。
 * 同一行可叠加多个 mark（投标邀请等长段落常为单行）。
 */
export function buildPageLinesMarkedHtml(
  lines: string[],
  marks: IssueMarkSpec[],
  applied: Record<string, string> = {},
  pageNumber: number,
  options?: { ignorePageHint?: boolean },
): string[] {
  const pageMarks = marks
    .filter(
      (mark) =>
        options?.ignorePageHint || !mark.pageHint || mark.pageHint === pageNumber,
    )
    .sort((a, b) => b.searchText.length - a.searchText.length);

  const plainLines = [...lines];
  const htmlLines: string[] = plainLines.map((line) => escapeHtml(line));
  const placed = new Set<string>();

  for (let i = 0; i < plainLines.length; i += 1) {
    const available = pageMarks.filter(
      (mark) => !placed.has(mark.id) && findNeedleInText(plainLines[i], mark.searchText),
    );
    if (!available.length) continue;

    const { html, placedIds } = applyMarksToPlainLine(
      plainLines[i],
      available,
      applied,
      pageNumber,
    );
    placedIds.forEach((id) => placed.add(id));
    htmlLines[i] = html;
  }

  for (const mark of pageMarks) {
    if (placed.has(mark.id)) continue;

    for (let i = 0; i < plainLines.length - 1; i += 1) {
      const combined = `${plainLines[i]} ${plainLines[i + 1]}`;
      const crossHit = findNeedleInText(combined, mark.searchText);
      if (!crossHit) continue;

      const firstLen = plainLines[i].length;
      if (crossHit.start >= firstLen) continue;

      const endOnFirst = Math.min(firstLen, crossHit.start + crossHit.length);
      const hitOnFirst = { start: crossHit.start, length: endOnFirst - crossHit.start };
      const available = pageMarks.filter(
        (item) =>
          !placed.has(item.id) &&
          (item.id === mark.id || findNeedleInText(plainLines[i], item.searchText)),
      );
      const { html, placedIds } = applyMarksToPlainLine(
        plainLines[i],
        available,
        applied,
        pageNumber,
      );
      if (!placedIds.includes(mark.id)) {
        htmlLines[i] = wrapPlainLineWithMark(plainLines[i], hitOnFirst, mark, applied);
        placed.add(mark.id);
      } else {
        htmlLines[i] = html;
        placedIds.forEach((id) => placed.add(id));
      }
      break;
    }
  }

  for (const mark of pageMarks) {
    if (placed.has(mark.id)) continue;
    const joined = plainLines.join(' ');
    const hit = findNeedleInText(joined, mark.searchText);
    if (!hit) continue;

    let cursor = 0;
    for (let i = 0; i < plainLines.length; i += 1) {
      const line = plainLines[i];
      const lineStart = cursor;
      const lineEnd = cursor + line.length;
      if (hit.start >= lineStart && hit.start < lineEnd) {
        const available = pageMarks.filter(
          (item) =>
            !placed.has(item.id) &&
            (item.id === mark.id || findNeedleInText(line, item.searchText)),
        );
        const { html, placedIds } = applyMarksToPlainLine(line, available, applied, pageNumber);
        placedIds.forEach((id) => placed.add(id));
        htmlLines[i] = html;
        break;
      }
      cursor = lineEnd + 1;
    }
  }

  return htmlLines;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
