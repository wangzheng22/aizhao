import { useCallback, useEffect, useState } from 'react';
import type { FieldAnchorRect } from '../types/completeness';
import { getScrollContainer } from '../utils/issueVisibility';

export type PdfTextSelection = {
  text: string;
  pageNumber: number;
  rect: FieldAnchorRect;
  clientRect: DOMRect;
};

function getPageElement(node: Node | null) {
  let current: Node | null = node;

  while (current) {
    if (current instanceof HTMLElement && current.dataset.page) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}

function isSelectionInTextLayer(range: Range) {
  const node = range.commonAncestorContainer;
  const element =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;

  return !!element?.closest('.pdf-page__text-layer');
}

function getPageRenderScale(pageElement: HTMLElement) {
  const surface = pageElement.querySelector<HTMLElement>('.pdf-page__surface');
  const baseWidth = Number(pageElement.dataset.baseWidth);
  if (!surface || !baseWidth) return 1;
  return surface.clientWidth / baseWidth;
}

function getSelectionState(viewer: HTMLElement): PdfTextSelection | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const text = selection.toString().replace(/\s+/g, ' ').trim();
  if (text.length < 1) {
    return null;
  }

  if (!viewer.contains(range.commonAncestorContainer)) {
    return null;
  }

  if (!isSelectionInTextLayer(range)) {
    return null;
  }

  const pageElement = getPageElement(range.commonAncestorContainer);
  if (!pageElement) {
    return null;
  }

  const pageNumber = Number(pageElement.dataset.page);
  if (!pageNumber) {
    return null;
  }

  const surface = pageElement.querySelector<HTMLElement>('.pdf-page__surface');
  if (!surface) {
    return null;
  }

  const renderScale = getPageRenderScale(pageElement);
  const surfaceRect = surface.getBoundingClientRect();
  const selectionRect = range.getBoundingClientRect();

  if (selectionRect.width < 1 || selectionRect.height < 1) {
    return null;
  }

  const rect: FieldAnchorRect = {
    x: (selectionRect.left - surfaceRect.left) / renderScale,
    y: (selectionRect.top - surfaceRect.top) / renderScale,
    width: selectionRect.width / renderScale,
    height: selectionRect.height / renderScale,
  };

  return {
    text,
    pageNumber,
    rect,
    clientRect: selectionRect,
  };
}

export function usePdfTextSelection(viewerRef: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<PdfTextSelection | null>(null);

  const refreshSelection = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      setSelection(null);
      return;
    }

    setSelection(getSelectionState(viewer));
  }, [viewerRef]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      const viewer = viewerRef.current;
      if (!viewer?.contains(event.target as Node)) return;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(refreshSelection);
      });
    };

    const handleKeyUp = () => {
      window.requestAnimationFrame(refreshSelection);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('selectionchange', refreshSelection);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('selectionchange', refreshSelection);
    };
  }, [viewerRef, refreshSelection]);

  useEffect(() => {
    const scrollEl = getScrollContainer(viewerRef.current);
    const handleScroll = () => {
      window.requestAnimationFrame(refreshSelection);
    };

    scrollEl?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', refreshSelection);

    return () => {
      scrollEl?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', refreshSelection);
    };
  }, [viewerRef, refreshSelection]);

  return { selection, clearSelection };
}
