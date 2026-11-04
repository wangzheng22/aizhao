import type { IssueMarkCategory } from './extractEditableDocument';
import { findNeedleInText } from './textSearchInDocument';

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

export function findDocumentMarkElement(markId: string, pageHint?: number): HTMLElement | null {
  if (pageHint) {
    const inPage = document.querySelector<HTMLElement>(
      `#doc-page-${pageHint} .editable-doc__mark[data-issue-id="${CSS.escape(markId)}"]`,
    );
    if (inPage) return inPage;
  }
  return document.querySelector<HTMLElement>(
    `.editable-doc__mark[data-issue-id="${CSS.escape(markId)}"]`,
  );
}

type ApplyMarkOptions = {
  markId: string;
  newText: string;
  searchText?: string;
  pageHint?: number;
  category?: IssueMarkCategory;
};

/** 更新已有 mark，或在正文中检索并包裹 mark 后写入建议文本 */
export function applyMarkReplacement({
  markId,
  newText,
  searchText,
  pageHint,
  category = 'field-missing',
}: ApplyMarkOptions): boolean {
  const existing = findDocumentMarkElement(markId, pageHint);
  if (existing) {
    existing.textContent = newText;
    existing.classList.add('editable-doc__mark--applied');
    return true;
  }

  if (!searchText?.trim()) return false;

  const pages = pageHint
    ? [document.getElementById(`doc-page-${pageHint}`)].filter(Boolean)
    : Array.from(document.querySelectorAll<HTMLElement>('.editable-doc__page'));

  for (const pageEl of pages) {
    if (!pageEl) continue;
    const lines = pageEl.querySelectorAll<HTMLElement>('.editable-doc__line');
    for (const lineEl of lines) {
      const plain = lineEl.textContent ?? '';
      const hit = findNeedleInText(plain, searchText);
      if (!hit) continue;

      const before = escapeHtml(plain.slice(0, hit.start));
      const after = escapeHtml(plain.slice(hit.start + hit.length));
      const markHtml = `<mark data-issue-id="${escapeAttr(markId)}" class="editable-doc__mark editable-doc__mark--${category} editable-doc__mark--applied" contenteditable="false">${escapeHtml(newText)}</mark>`;
      lineEl.innerHTML = `${before}${markHtml}${after}`;
      return true;
    }
  }

  return false;
}
