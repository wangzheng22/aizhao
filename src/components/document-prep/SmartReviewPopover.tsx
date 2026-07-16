import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { getScrollContainer, isElementInContainer } from '../../utils/issueVisibility';
import { SmartReviewCard } from './SmartReviewCard';
import './PageIssuePopover.css';

type SmartReviewPopoverProps = {
  issue: ResolvedSmartReviewIssue | null;
  workspaceRef: React.RefObject<HTMLElement | null>;
  viewerRef: React.RefObject<HTMLElement | null>;
  suggestionEdit?: SuggestionEditHandlers;
  onClose: () => void;
};

type PopoverPosition = {
  top: number;
  left: number;
};

const POPOVER_ESTIMATED_WIDTH = 320;

function getMarkerElement(issueId: string) {
  return document.querySelector<HTMLElement>(`[data-page-marker-id="${issueId}"]`);
}

export function SmartReviewPopover({
  issue,
  workspaceRef,
  viewerRef,
  suggestionEdit,
  onClose,
}: SmartReviewPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!issue || !workspaceRef.current) {
      setPosition(null);
      setVisible(false);
      return undefined;
    }

    let frameId = 0;

    const updatePosition = () => {
      const workspace = workspaceRef.current;
      const scrollContainer = getScrollContainer(viewerRef.current);
      const marker = getMarkerElement(issue.id);
      const popover = popoverRef.current;

      if (!workspace || !scrollContainer || !marker) {
        setPosition(null);
        setVisible(false);
        return;
      }

      if (!isElementInContainer(marker, scrollContainer)) {
        setPosition(null);
        setVisible(false);
        return;
      }

      const workspaceRect = workspace.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      const popoverWidth = popover?.getBoundingClientRect().width || POPOVER_ESTIMATED_WIDTH;
      const popoverHeight = popover?.getBoundingClientRect().height || 260;

      let left = markerRect.left - workspaceRect.left - popoverWidth - 12;
      let top = markerRect.top - workspaceRect.top + markerRect.height / 2 - popoverHeight / 2;

      if (left < 12) {
        left = markerRect.right - workspaceRect.left + 10;
      }

      const maxLeft = workspaceRect.width - popoverWidth - 12;
      const maxTop = workspaceRect.height - popoverHeight - 12;

      left = Math.min(Math.max(left, 12), Math.max(maxLeft, 12));
      top = Math.min(Math.max(top, 12), Math.max(maxTop, 12));

      setPosition({ top, left });
      setVisible(true);

      if (!popover) {
        frameId = window.requestAnimationFrame(updatePosition);
      }
    };

    updatePosition();

    const scrollEl = getScrollContainer(viewerRef.current);
    scrollEl?.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    const observer = new ResizeObserver(updatePosition);
    if (workspaceRef.current) observer.observe(workspaceRef.current);
    if (scrollEl) observer.observe(scrollEl);

    return () => {
      window.cancelAnimationFrame(frameId);
      scrollEl?.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [issue, workspaceRef, viewerRef]);

  useEffect(() => {
    if (!issue) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (getMarkerElement(issue.id)?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [issue, onClose]);

  if (!issue) return null;

  return (
    <div
      ref={popoverRef}
      className="page-issue-popover"
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        visibility: visible && position ? 'visible' : 'hidden',
        pointerEvents: visible && position ? 'auto' : 'none',
      }}
      role="dialog"
      aria-label={`${issue.title}详情`}
      aria-hidden={!visible || !position}
    >
      <div className="page-issue-popover__header">
        <span className="page-issue-popover__title">问题详情</span>
        <button type="button" className="page-issue-popover__close" aria-label="关闭" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <SmartReviewCard issue={issue} active interactive={false} suggestionEdit={suggestionEdit} />
    </div>
  );
}
