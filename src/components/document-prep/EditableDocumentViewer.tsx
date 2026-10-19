import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { FieldAnchor } from '../../types/completeness';
import {
  buildMarkedHtml,
  extractEditableDocument,
  type EditableDocument,
  type IssueMarkSpec,
} from '../../utils/extractEditableDocument';
import './EditableDocumentViewer.css';

export type EditableSelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EditableSelection = {
  text: string;
  pageNumber: number;
  clientRect: DOMRect;
  pageRects?: EditableSelectionRect[];
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

function formatPageHtml(markedJoined: string, lines: { fontSize: number; x: number }[]) {
  const parts = markedJoined.split('\n');
  return parts
    .map((part, index) => {
      const line = lines[index];
      const fontSize = line ? Math.max(12, Math.min(line.fontSize * 1.15, 22)) : 14;
      const indent = line ? Math.max(0, Math.min(line.x * 0.35, 120)) : 0;
      const isTitle = fontSize >= 18;
      return `<p class="editable-doc__line${isTitle ? ' editable-doc__line--title' : ''}" style="font-size:${fontSize}px;padding-left:${indent}px">${part || '&nbsp;'}</p>`;
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
    if (!doc) return;

    const fingerprint = `${doc.pages.length}:${marks.map((m) => m.id).join(',')}`;
    if (hydratedKeyRef.current === fingerprint) return;
    hydratedKeyRef.current = fingerprint;

    doc.pages.forEach((page) => {
      const body = bodyRefs.current[page.pageNumber];
      if (!body) return;
      const plain = page.lines.map((line) => line.text).join('\n');
      const marked = buildMarkedHtml(plain, marks, appliedTexts);
      body.innerHTML = formatPageHtml(marked, page.lines);
    });
  }, [doc, marks, appliedTexts]);

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

    const refresh = () => {
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

      const pageNumber = Number(pageEl?.dataset.page) || 1;
      const clientRect = range.getBoundingClientRect();
      if (clientRect.width < 1 || clientRect.height < 1) {
        onSelectionChange(null);
        return;
      }

      const pageRects =
        pageEl != null
          ? Array.from(range.getClientRects())
              .filter((rect) => rect.width >= 1 && rect.height >= 1)
              .map((rect) => {
                const pageRect = pageEl.getBoundingClientRect();
                return {
                  x: rect.left - pageRect.left,
                  y: rect.top - pageRect.top,
                  width: rect.width,
                  height: rect.height,
                };
              })
          : undefined;

      onSelectionChange({ text, pageNumber, clientRect, pageRects });
    };

    const onMouseUp = () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(refresh));
    };

    document.addEventListener('selectionchange', refresh);
    root.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('selectionchange', refresh);
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
        {doc.pages.map((page) => (
          <section
            key={page.pageNumber}
            id={`doc-page-${page.pageNumber}`}
            data-page={page.pageNumber}
            className="editable-doc__page"
          >
            <div
              ref={(node) => setBodyRef(page.pageNumber, node)}
              className="editable-doc__page-body"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            />
            <span className="editable-doc__page-label">第 {page.pageNumber} 页</span>
          </section>
        ))}
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
