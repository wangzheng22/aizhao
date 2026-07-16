import { useLayoutEffect, useState } from 'react';
import type { FieldAnchor } from '../../types/completeness';
import { PageIssueMarker } from './PageIssueMarker';
import './PageIssueMarkersOverlay.css';

type MarkerPosition = {
  top: number;
  visible: boolean;
};

type OverlayIssue = {
  id: string;
  type: string;
  title: string;
  anchor?: FieldAnchor;
};

type PageIssueMarkersOverlayProps = {
  viewerRef: React.RefObject<HTMLElement | null>;
  issues: OverlayIssue[];
  inlineIssueId: string | null;
  layoutVersion?: number;
  active?: boolean;
  getMarkerClass?: (issue: OverlayIssue) => string;
  onIssueClick: (issue: OverlayIssue) => void;
};

export function PageIssueMarkersOverlay({
  viewerRef,
  issues,
  inlineIssueId,
  layoutVersion = 0,
  active = true,
  getMarkerClass,
  onIssueClick,
}: PageIssueMarkersOverlayProps) {
  const [positions, setPositions] = useState<Record<string, MarkerPosition>>({});

  useLayoutEffect(() => {
    if (!active) {
      setPositions({});
      return undefined;
    }

    const updatePositions = () => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      const viewerRect = viewer.getBoundingClientRect();
      const nextPositions: Record<string, MarkerPosition> = {};

      for (const issue of issues) {
        if (!issue.anchor) continue;

        const anchor = document.querySelector<HTMLElement>(`[data-marker-anchor-id="${issue.id}"]`);
        if (!anchor) continue;

        const anchorRect = anchor.getBoundingClientRect();
        const visible = anchorRect.bottom >= viewerRect.top && anchorRect.top <= viewerRect.bottom;
        const top = anchorRect.top + anchorRect.height / 2 - viewerRect.top;

        nextPositions[issue.id] = { top, visible };
      }

      setPositions(nextPositions);
    };

    updatePositions();

    const frameId = window.requestAnimationFrame(updatePositions);
    const retryId = window.setTimeout(updatePositions, 320);

    const scrollEl = viewerRef.current?.querySelector('.pdf-viewer');
    const pagesEl = viewerRef.current?.querySelector('.pdf-viewer__pages');
    scrollEl?.addEventListener('scroll', updatePositions, { passive: true });
    window.addEventListener('resize', updatePositions);

    const observer = new ResizeObserver(updatePositions);
    const mutationObserver = new MutationObserver(updatePositions);

    if (viewerRef.current) {
      observer.observe(viewerRef.current);
    }

    pagesEl?.addEventListener('scroll', updatePositions, { passive: true });
    mutationObserver.observe(pagesEl ?? scrollEl ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(retryId);
      scrollEl?.removeEventListener('scroll', updatePositions);
      pagesEl?.removeEventListener('scroll', updatePositions);
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [issues, viewerRef, layoutVersion, active]);

  if (!active) return null;

  return (
    <div className="page-issue-markers-overlay" aria-hidden={false}>
      {issues.map((issue) => {
        if (!issue.anchor) return null;

        const position = positions[issue.id];
        if (!position?.visible) return null;

        return (
          <PageIssueMarker
            key={issue.id}
            issue={issue}
            active={inlineIssueId === issue.id}
            top={position.top}
            markerClass={getMarkerClass?.(issue)}
            onClick={onIssueClick}
          />
        );
      })}
    </div>
  );
}
