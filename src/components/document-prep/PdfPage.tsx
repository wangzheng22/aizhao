import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import type { FieldAnchor, FieldAnchorRect } from '../../types/completeness';
import type { AppliedTextReplacement } from '../../types/textReplacement';
import { PdfTextLayer } from './PdfTextLayer';

export type PageHighlight = FieldAnchor & {
  active: boolean;
  focused: boolean;
};

type PageIssue = {
  id: string;
  anchor?: FieldAnchor;
};

type PdfPageProps = {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  highlights?: PageHighlight[];
  showHighlights: boolean;
  markerIssues?: PageIssue[];
  textReplacements?: AppliedTextReplacement[];
  enableTextSelection?: boolean;
  selectionHighlight?: FieldAnchorRect | null;
  onHighlightClick?: (anchor: FieldAnchor) => void;
};

export function PdfPage({
  pdf,
  pageNumber,
  width,
  highlights = [],
  showHighlights,
  markerIssues = [],
  textReplacements = [],
  enableTextSelection = false,
  selectionHighlight = null,
  onHighlightClick,
}: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(1122);
  const [basePageWidth, setBasePageWidth] = useState(0);

  const renderScale = basePageWidth > 0 ? width / basePageWidth : 1;

  useEffect(() => {
    let cancelled = false;

    pdf.getPage(pageNumber).then((page) => {
      if (!cancelled) {
        setBasePageWidth(page.getViewport({ scale: 1 }).width);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  useEffect(() => {
    if (
      highlights.some((highlight) => highlight.active || highlight.focused) ||
      markerIssues.length > 0 ||
      (showHighlights && highlights.length > 0) ||
      textReplacements.length > 0 ||
      selectionHighlight
    ) {
      setVisible(true);
    }
  }, [highlights, markerIssues.length, showHighlights, textReplacements.length, selectionHighlight]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !canvasRef.current || width <= 0) return undefined;

    let cancelled = false;
    const canvas = canvasRef.current;

    async function renderPage() {
      const page = await pdf.getPage(pageNumber);
      if (cancelled || !canvasRef.current) return;

      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;

      const rotation = page.rotate || 0;
      const baseViewport = page.getViewport({ scale: 1, rotation });
      const scale = width / baseViewport.width;
      const viewport = page.getViewport({ scale, rotation });
      const context = canvas.getContext('2d');

      if (!context) return;

      // Reset canvas buffer to clear any leftover transforms from interrupted renders.
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      setHeight(viewport.height);
      setBasePageWidth(baseViewport.width);

      const renderTask = page.render({
        canvasContext: context,
        viewport,
        canvas,
      });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (error) {
        if ((error as { name?: string })?.name === 'RenderingCancelledException') {
          return;
        }
        throw error;
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [visible, pdf, pageNumber, width]);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page={pageNumber}
      data-base-width={basePageWidth || undefined}
      className="pdf-page"
      style={{ minHeight: height }}
    >
      <div className="pdf-page__surface" style={{ width, height }}>
        {visible ? (
          <>
            <canvas ref={canvasRef} className="pdf-page__canvas" />
            {enableTextSelection && (
              <PdfTextLayer pdf={pdf} pageNumber={pageNumber} width={width} visible={visible} />
            )}
          </>
        ) : (
          <div className="pdf-page__placeholder" style={{ height, width }} aria-hidden="true" />
        )}

        {showHighlights &&
          highlights.map((highlight) => {
            const replacement = textReplacements.find((item) => item.issueId === highlight.issueId);
            if (replacement) return null;

            const toneClass =
              highlight.category === 'smart-review'
                ? 'field-highlight--smart-review'
                : highlight.category === 'comment'
                  ? 'field-highlight--comment'
                  : 'field-highlight--completeness';

            return (
              <button
                key={highlight.issueId}
                type="button"
                data-issue-id={highlight.issueId}
                className={[
                  'field-highlight',
                  toneClass,
                  highlight.active ? 'field-highlight--active' : '',
                  highlight.focused ? 'field-highlight--focused' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  left: highlight.rect.x * renderScale,
                  top: highlight.rect.y * renderScale,
                  width: Math.max(highlight.rect.width * renderScale, 56),
                  height: Math.max(highlight.rect.height * renderScale, 26),
                }}
                aria-label="定位到审查项"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onHighlightClick?.(highlight);
                }}
              >
                <span className="field-highlight__box" aria-hidden="true" />
              </button>
            );
          })}

        {textReplacements.map((replacement) => {
          const boxWidth = Math.max(replacement.rect.width * renderScale, 56);
          const baseHeight = Math.max(replacement.rect.height * renderScale, 18);
          const fontSize = Math.max(Math.min(baseHeight * 0.78, 16), 11);
          const approxCharWidth = fontSize * 0.92;
          const charsPerLine = Math.max(1, Math.floor(boxWidth / approxCharWidth));
          const lineCount = Math.max(1, Math.ceil(replacement.text.length / charsPerLine));
          const boxHeight = Math.max(baseHeight, lineCount * fontSize * 1.35);
          const highlight = highlights.find((item) => item.issueId === replacement.issueId);

          return (
            <button
              key={`replace-${replacement.issueId}`}
              type="button"
              data-issue-id={replacement.issueId}
              className={[
                'field-text-replacement',
                highlight?.active ? 'field-text-replacement--active' : '',
                highlight?.focused ? 'field-text-replacement--focused' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: replacement.rect.x * renderScale,
                top: replacement.rect.y * renderScale,
                width: boxWidth,
                minHeight: boxHeight,
                fontSize: `${fontSize}px`,
                lineHeight: `${fontSize * 1.35}px`,
              }}
              aria-label="已替换的原文，点击定位审查项"
              title={replacement.text}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onHighlightClick?.({
                  issueId: replacement.issueId,
                  pageNumber: replacement.pageNumber,
                  rect: replacement.rect,
                  markerLabel: '',
                  category: replacement.category,
                });
              }}
            >
              {replacement.text}
            </button>
          );
        })}

        {markerIssues.map((issue) => {
          if (!issue.anchor) return null;

          return (
            <div
              key={`anchor-${issue.id}`}
              data-marker-anchor-id={issue.id}
              className="page-issue-anchor"
              style={{
                left: issue.anchor.rect.x * renderScale,
                top: issue.anchor.rect.y * renderScale,
                width: Math.max(issue.anchor.rect.width * renderScale, 56),
                height: Math.max(issue.anchor.rect.height * renderScale, 26),
              }}
              aria-hidden="true"
            />
          );
        })}

        {selectionHighlight && (
          <div
            className="text-selection-highlight text-selection-highlight--in-page"
            data-selection-highlight="true"
            style={{
              left: selectionHighlight.x * renderScale,
              top: selectionHighlight.y * renderScale,
              width: Math.max(selectionHighlight.width * renderScale, 2),
              height: Math.max(selectionHighlight.height * renderScale, 2),
            }}
            aria-hidden="true"
          />
        )}
      </div>
      <span className="pdf-page__label">第 {pageNumber} 页</span>
    </div>
  );
}
