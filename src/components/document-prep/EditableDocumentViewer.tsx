import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { FieldAnchor } from '../../types/completeness';
import {
  buildMarkedHtml,
  extractEditableDocument,
  type EditableDocPage,
  type EditableDocument,
  type IssueMarkSpec,
} from '../../utils/extractEditableDocument';
import './EditableDocumentViewer.css';

/** Render width for A4-like pages (keeps ~1:1 with PDF point scale at 96dpi) */
export const EDITABLE_PAGE_WIDTH = 794;

export type EditableSelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EditableSelection = {
  text: string;
  pageNumber: number;
  /** Bounding box in viewport coordinates (toolbar anchor) */
  clientRect: DOMRect;
  /** Highlight boxes relative to the page element */
  pageRects: EditableSelectionRect[];
};

type EditableDocumentViewerProps = {
  pdf: PDFDocumentProxy;
  marks?: IssueMarkSpec[];
  appliedTexts?: Record<string, string>;
  activeIssueId?: string | null;
  focusedIssueId?: string | null;
  onIssueClick?: (issueId: string) => void;
  onSelectionChange?: (selection: EditableSelection | null) => void;
};

function formatPageHtml(markedJoined: string, page: EditableDocPage, scale: number) {
  const parts = markedJoined.split('\n');
  return parts
    .map((part, index) => {
      const line = page.lines[index];
      if (!line) return '';

      const fontSize = Math.max(9, line.fontSize * scale);
      const left = line.x * scale;
      const top = line.y * scale;
      // Keep enough width for wrapping when AI suggestions are longer than the original span
      const maxRight = page.width * scale - 36 * scale;
      const width = Math.max(line.width * scale + 4, Math.min(maxRight - left, page.width * scale * 0.82));
      const lineHeight = fontSize * (line.fontSize >= 20 ? 1.25 : 1.15);
      const classes = [
        'editable-doc__line',
        line.align !== 'left' ? `editable-doc__line--${line.align}` : '',
        line.fontSize >= 20 ? 'editable-doc__line--display' : '',
        line.fontSize >= 14 && line.fontSize < 20 ? 'editable-doc__line--heading' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<div class="${classes}" style="left:${left}px;top:${top}px;width:${width}px;font-size:${fontSize}px;line-height:${lineHeight}px;font-weight:${line.bold ? 700 : 400}">${part || '&nbsp;'}</div>`;
    })
    .join('');
}

export function EditableDocumentViewer({
  pdf,
  marks = [],
  appliedTexts = {},
  activeIssueId = null,
  focusedIssueId = null,
  onIssueClick,
  onSelectionChange,
}: EditableDocumentViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [doc, setDoc] = useState<EditableDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hydratedKeyRef = useRef<string>('');
  const appliedRef = useRef(appliedTexts);
  appliedRef.current = appliedTexts;

  useEffect(() => {
    let cancelled = false;
    hydratedKeyRef.current = '';

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const extracted = await extractEditableDocument(pdf);
        if (!cancelled) setDoc(extracted);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '文档解析失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pdf]);

  // Hydrate HTML once per document + marks fingerprint (do not rebuild after user edits)
  useEffect(() => {
    if (!doc) return undefined;

    const fingerprint = `${doc.pages.length}:${marks.map((m) => `${m.id}:${m.searchText}`).join('|')}`;
    if (hydratedKeyRef.current === fingerprint) return undefined;

    const hydrate = () => {
      let ready = true;
      doc.pages.forEach((page) => {
        if (!bodyRefs.current[page.pageNumber]) ready = false;
      });
      if (!ready) return false;

      hydratedKeyRef.current = fingerprint;
      doc.pages.forEach((page) => {
        const body = bodyRefs.current[page.pageNumber];
        if (!body) return;
        const scale = EDITABLE_PAGE_WIDTH / page.width;
        body.style.width = `${EDITABLE_PAGE_WIDTH}px`;
        body.style.height = `${page.height * scale}px`;
        const plain = page.lines.map((line) => line.text).join('\n');
        const marked = buildMarkedHtml(plain, marks, appliedRef.current);
        body.innerHTML = formatPageHtml(marked, page, scale);
      });
      return true;
    };

    if (hydrate()) return undefined;

    let attempts = 0;
    let frame = 0;
    const retry = () => {
      attempts += 1;
      if (hydrate() || attempts > 30) return;
      frame = window.requestAnimationFrame(retry);
    };
    frame = window.requestAnimationFrame(retry);
    return () => window.cancelAnimationFrame(frame);
  }, [doc, marks]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLElement>('.editable-doc__mark').forEach((el) => {
      const id = el.dataset.issueId;
      el.classList.toggle('editable-doc__mark--active', id === activeIssueId);
      el.classList.toggle('editable-doc__mark--focused', id === focusedIssueId);
    });
  }, [activeIssueId, focusedIssueId, doc, marks]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    Object.entries(appliedTexts).forEach(([issueId, text]) => {
      const el = root.querySelector<HTMLElement>(`.editable-doc__mark[data-issue-id="${CSS.escape(issueId)}"]`);
      if (!el) return;
      if (el.textContent !== text) el.textContent = text;
      el.classList.add('editable-doc__mark--applied');
    });
  }, [appliedTexts, doc, marks]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('.editable-doc__mark');
      if (!target || !root.contains(target)) return;
      const issueId = target.dataset.issueId;
      if (issueId) onIssueClick?.(issueId);
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [onIssueClick]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !onSelectionChange) return undefined;

    const commitSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        onSelectionChange(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) {
        onSelectionChange(null);
        return;
      }

      const text = selection.toString().replace(/\s+/g, ' ').trim();
      if (text.length < 1) {
        onSelectionChange(null);
        return;
      }

      const pageEl = (
        range.commonAncestorContainer instanceof Element
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement
      )?.closest<HTMLElement>('[data-page]');

      if (!pageEl) {
        onSelectionChange(null);
        return;
      }

      const pageNumber = Number(pageEl.dataset.page) || 1;
      const clientRect = range.getBoundingClientRect();
      if (clientRect.width < 1 || clientRect.height < 1) {
        onSelectionChange(null);
        return;
      }

      const pageRect = pageEl.getBoundingClientRect();
      const pageRects = Array.from(range.getClientRects())
        .filter((rect) => rect.width >= 1 && rect.height >= 1)
        .map((rect) => ({
          x: rect.left - pageRect.left,
          y: rect.top - pageRect.top,
          width: rect.width,
          height: rect.height,
        }));

      if (!pageRects.length) {
        onSelectionChange(null);
        return;
      }

      onSelectionChange({ text, pageNumber, clientRect, pageRects });
    };

    const onMouseUp = () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(commitSelection));
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.text-selection-toolbar')) return;
      if (root.contains(target)) {
        // New drag inside the document — hide previous toolbar until mouseup.
        onSelectionChange(null);
        return;
      }
      onSelectionChange(null);
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    root.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      root.removeEventListener('mouseup', onMouseUp);
    };
  }, [onSelectionChange]);

  const setBodyRef = useCallback((pageNumber: number, node: HTMLDivElement | null) => {
    bodyRefs.current[pageNumber] = node;
  }, []);

  if (loading) {
    return <div className="editable-doc editable-doc--status">正在解析招标文件为可编辑文档…</div>;
  }

  if (error) {
    return <div className="editable-doc editable-doc--status editable-doc--error">{error}</div>;
  }

  if (!doc) {
    return <div className="editable-doc editable-doc--status">暂无文档内容</div>;
  }

  return (
    <div ref={rootRef} className="editable-doc">
      <div className="editable-doc__pages">
        {doc.pages.map((page) => {
          const scale = EDITABLE_PAGE_WIDTH / page.width;
          const pageHeight = page.height * scale;

          return (
            <section
              key={page.pageNumber}
              id={`doc-page-${page.pageNumber}`}
              data-page={page.pageNumber}
              className="editable-doc__page"
              style={{ width: EDITABLE_PAGE_WIDTH, height: pageHeight }}
            >
              <div
                ref={(node) => setBodyRef(page.pageNumber, node)}
                className="editable-doc__page-body"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                style={{ width: EDITABLE_PAGE_WIDTH, height: pageHeight }}
              />
              <span className="editable-doc__page-label">第 {page.pageNumber} 页</span>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function scrollToEditableIssue(issueId: string) {
  const el = document.querySelector<HTMLElement>(
    `.editable-doc__mark[data-issue-id="${CSS.escape(issueId)}"]`,
  );
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return Boolean(el);
}

export function scrollToEditablePage(pageNumber: number) {
  document.getElementById(`doc-page-${pageNumber}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function getEditableIssueAnchor(issueId: string): FieldAnchor | null {
  const el = document.querySelector<HTMLElement>(
    `.editable-doc__mark[data-issue-id="${CSS.escape(issueId)}"]`,
  );
  const pageEl = el?.closest<HTMLElement>('[data-page]');
  if (!el || !pageEl) return null;

  const pageNumber = Number(pageEl.dataset.page) || 1;
  const pageRect = pageEl.getBoundingClientRect();
  const rect = el.getBoundingClientRect();

  return {
    issueId,
    pageNumber,
    rect: {
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
    },
    markerLabel: '',
    category: el.classList.contains('editable-doc__mark--smart-review')
      ? 'smart-review'
      : el.classList.contains('editable-doc__mark--comment')
        ? 'comment'
        : 'completeness',
  };
}
