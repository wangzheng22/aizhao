import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { FieldAnchor, FieldAnchorRect } from '../../types/completeness';
import { PdfPage } from './PdfPage';
import './PdfDocumentViewer.css';

type ViewerIssue = {
  id: string;
  type: string;
  anchor?: FieldAnchor;
};

type PdfDocumentViewerProps = {
  pdf: PDFDocumentProxy;
  numPages: number;
  anchors?: FieldAnchor[];
  markerIssues?: ViewerIssue[];
  activeIssueId?: string | null;
  focusedIssueId?: string | null;
  showHighlights?: boolean;
  layoutVersion?: number;
  enableTextSelection?: boolean;
  textSelection?: { pageNumber: number; rect: FieldAnchorRect } | null;
};

function measurePageWidth(viewer: HTMLElement) {
  const pages = viewer.querySelector<HTMLElement>('.pdf-viewer__pages');
  const available = pages?.clientWidth ?? viewer.clientWidth;
  return Math.min(Math.max(available, 480), 920);
}

export function PdfDocumentViewer({
  pdf,
  numPages,
  anchors = [],
  markerIssues = [],
  activeIssueId = null,
  focusedIssueId = null,
  showHighlights = false,
  layoutVersion = 0,
  enableTextSelection = false,
  textSelection = null,
}: PdfDocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(860);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    let frameId = 0;

    const updateWidth = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const nextWidth = measurePageWidth(node);
        setPageWidth((current) => (current === nextWidth ? current : nextWidth));
      });
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    const pages = node.querySelector('.pdf-viewer__pages');
    if (pages) {
      observer.observe(pages);
    }

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [layoutVersion]);

  return (
    <div ref={containerRef} className="pdf-viewer">
      <div className="pdf-viewer__pages">
        {Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;
          const pageMarkerIssues = markerIssues.filter((issue) => issue.anchor?.pageNumber === pageNumber);
          const highlights = anchors
            .filter((anchor) => anchor.pageNumber === pageNumber)
            .map((anchor) => ({
              ...anchor,
              active: anchor.issueId === activeIssueId,
              focused: anchor.issueId === focusedIssueId,
            }));

          return (
            <PdfPage
              key={pageNumber}
              pdf={pdf}
              pageNumber={pageNumber}
              width={pageWidth}
              highlights={highlights}
              showHighlights={showHighlights}
              markerIssues={pageMarkerIssues}
              enableTextSelection={enableTextSelection}
              selectionHighlight={
                textSelection?.pageNumber === pageNumber ? textSelection.rect : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
