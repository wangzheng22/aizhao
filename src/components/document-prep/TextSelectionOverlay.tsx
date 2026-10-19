import { useLayoutEffect, useState } from 'react';
import type { PdfTextSelection } from '../../hooks/usePdfTextSelection';
import type { EditableSelection } from './EditableDocumentViewer';
import { TextSelectionToolbar } from './TextSelectionToolbar';
import './TextSelectionOverlay.css';

type SelectionLike = Pick<PdfTextSelection, 'pageNumber' | 'rect' | 'clientRect'> | EditableSelection;

type TextSelectionOverlayProps = {
  selection: SelectionLike;
  workspaceRef: React.RefObject<HTMLElement | null>;
  viewerRef: React.RefObject<HTMLElement | null>;
  onAddComment: () => void;
  onAiWrite: () => void;
};

type ToolbarPosition = {
  top: number;
  left: number;
};

type HighlightBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function getPageElement(pageNumber: number) {
  return (
    document.getElementById(`doc-page-${pageNumber}`) ||
    document.getElementById(`pdf-page-${pageNumber}`)
  );
}

function getToolbarPosition(selection: SelectionLike, workspace: HTMLElement): ToolbarPosition | null {
  const workspaceRect = workspace.getBoundingClientRect();

  if ('clientRect' in selection && selection.clientRect) {
    return {
      top: selection.clientRect.bottom - workspaceRect.top + 8,
      left: selection.clientRect.left - workspaceRect.left + selection.clientRect.width / 2,
    };
  }

  if (!('rect' in selection)) return null;

  const pageElement = getPageElement(selection.pageNumber);
  if (!pageElement) return null;

  const surface =
    pageElement.querySelector<HTMLElement>('.editable-doc__page-body') ||
    pageElement.querySelector<HTMLElement>('.pdf-page__surface');
  if (!surface) return null;

  const surfaceRect = surface.getBoundingClientRect();
  const baseWidth = Number(pageElement.dataset.baseWidth) || surface.clientWidth;
  const renderScale = surface.clientWidth / baseWidth;

  return {
    top:
      surfaceRect.top -
      workspaceRect.top +
      selection.rect.y * renderScale +
      selection.rect.height * renderScale +
      8,
    left:
      surfaceRect.left -
      workspaceRect.left +
      selection.rect.x * renderScale +
      (selection.rect.width * renderScale) / 2,
  };
}

function getHighlightBoxes(selection: SelectionLike, workspace: HTMLElement): HighlightBox[] {
  const workspaceRect = workspace.getBoundingClientRect();
  const pageElement = getPageElement(selection.pageNumber);
  if (!pageElement) return [];

  const pageRect = pageElement.getBoundingClientRect();

  if ('pageRects' in selection && selection.pageRects?.length) {
    return selection.pageRects.map((rect) => ({
      top: pageRect.top - workspaceRect.top + rect.y,
      left: pageRect.left - workspaceRect.left + rect.x,
      width: rect.width,
      height: rect.height,
    }));
  }

  if ('clientRect' in selection && selection.clientRect) {
    const rect = selection.clientRect;
    return [
      {
        top: rect.top - workspaceRect.top,
        left: rect.left - workspaceRect.left,
        width: rect.width,
        height: rect.height,
      },
    ];
  }

  if ('rect' in selection) {
    const surface =
      pageElement.querySelector<HTMLElement>('.editable-doc__page-body') ||
      pageElement.querySelector<HTMLElement>('.pdf-page__surface');
    if (!surface) return [];
    const surfaceRect = surface.getBoundingClientRect();
    const baseWidth = Number(pageElement.dataset.baseWidth) || surface.clientWidth;
    const renderScale = surface.clientWidth / baseWidth;
    return [
      {
        top: surfaceRect.top - workspaceRect.top + selection.rect.y * renderScale,
        left: surfaceRect.left - workspaceRect.left + selection.rect.x * renderScale,
        width: Math.max(selection.rect.width * renderScale, 2),
        height: Math.max(selection.rect.height * renderScale, 2),
      },
    ];
  }

  return [];
}

export function TextSelectionOverlay({
  selection,
  workspaceRef,
  viewerRef,
  onAddComment,
  onAiWrite,
}: TextSelectionOverlayProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [highlights, setHighlights] = useState<HighlightBox[]>([]);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      setPosition(null);
      setHighlights([]);
      return undefined;
    }

    const update = () => {
      setPosition(getToolbarPosition(selection, workspace));
      setHighlights(getHighlightBoxes(selection, workspace));
    };

    update();

    const frameId = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    const scrollEl =
      viewerRef.current?.querySelector('.editable-doc') ||
      viewerRef.current?.querySelector('.pdf-viewer');
    scrollEl?.addEventListener('scroll', update, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', update);
      scrollEl?.removeEventListener('scroll', update);
    };
  }, [selection, workspaceRef, viewerRef]);

  if (!position) return null;

  return (
    <>
      {highlights.map((box, index) => (
        <div
          key={`${box.top}-${box.left}-${index}`}
          className="text-selection-highlight"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
          }}
          aria-hidden="true"
        />
      ))}
      <TextSelectionToolbar
        anchor={position}
        workspaceRef={workspaceRef}
        onAddComment={onAddComment}
        onAiWrite={onAiWrite}
      />
    </>
  );
}
