import { useLayoutEffect, useState } from 'react';
import type { PdfTextSelection } from '../../hooks/usePdfTextSelection';
import { TextSelectionToolbar } from './TextSelectionToolbar';
import './TextSelectionOverlay.css';

type TextSelectionOverlayProps = {
  selection: PdfTextSelection;
  workspaceRef: React.RefObject<HTMLElement | null>;
  viewerRef: React.RefObject<HTMLElement | null>;
  onAddComment: () => void;
  onAiWrite: () => void;
};

type ToolbarPosition = {
  top: number;
  left: number;
};

function getToolbarPosition(
  selection: PdfTextSelection,
  workspace: HTMLElement,
): ToolbarPosition | null {
  const pageElement = document.getElementById(`pdf-page-${selection.pageNumber}`);
  const surface = pageElement?.querySelector<HTMLElement>('.pdf-page__surface');
  if (!pageElement || !surface) return null;

  const baseWidth = Number(pageElement.dataset.baseWidth);
  if (!baseWidth) return null;

  const renderScale = surface.clientWidth / baseWidth;
  const surfaceRect = surface.getBoundingClientRect();
  const workspaceRect = workspace.getBoundingClientRect();

  const highlightBottom =
    surfaceRect.top +
    selection.rect.y * renderScale +
    selection.rect.height * renderScale;
  const highlightCenterX =
    surfaceRect.left +
    selection.rect.x * renderScale +
    (selection.rect.width * renderScale) / 2;

  return {
    top: highlightBottom - workspaceRect.top + 8,
    left: highlightCenterX - workspaceRect.left,
  };
}

export function TextSelectionOverlay({
  selection,
  workspaceRef,
  viewerRef,
  onAddComment,
  onAiWrite,
}: TextSelectionOverlayProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      setPosition(null);
      return undefined;
    }

    const updatePosition = () => {
      setPosition(getToolbarPosition(selection, workspace));
    };

    updatePosition();

    const frameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    const scrollEl = viewerRef.current?.querySelector('.pdf-viewer');
    scrollEl?.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updatePosition);
      scrollEl?.removeEventListener('scroll', updatePosition);
    };
  }, [selection, workspaceRef, viewerRef]);

  if (!position) return null;

  return (
    <TextSelectionToolbar
      anchor={position}
      workspaceRef={workspaceRef}
      onAddComment={onAddComment}
      onAiWrite={onAiWrite}
    />
  );
}
