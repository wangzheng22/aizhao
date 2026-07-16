import type { FieldAnchor } from '../types/completeness';

export type ScrollSyncIssue = {
  id: string;
  anchor?: FieldAnchor;
};

export function getScrollContainer(viewerEl: HTMLElement | null) {
  if (!viewerEl) return null;
  return viewerEl.querySelector<HTMLElement>('.pdf-viewer') ?? viewerEl;
}

export function isElementInContainer(element: HTMLElement, container: HTMLElement) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return elementRect.bottom > containerRect.top && elementRect.top < containerRect.bottom;
}

export function getVisibleIssues(viewerEl: HTMLElement | null, issues: ScrollSyncIssue[]) {
  const container = getScrollContainer(viewerEl);
  if (!container) return [];

  return issues.filter((issue) => {
    if (!issue.anchor) return false;

    const anchor = document.querySelector<HTMLElement>(`[data-marker-anchor-id="${issue.id}"]`);
    if (!anchor) return false;

    return isElementInContainer(anchor, container);
  });
}

export function getNextVisibleIssueId(
  issues: ScrollSyncIssue[],
  currentIssueId: string,
  viewerEl: HTMLElement | null,
) {
  const visibleIssues = getVisibleIssues(viewerEl, issues);
  if (!visibleIssues.length) return null;

  if (visibleIssues.some((issue) => issue.id === currentIssueId)) {
    return currentIssueId;
  }

  const currentIndex = issues.findIndex((issue) => issue.id === currentIssueId);

  for (let index = currentIndex + 1; index < issues.length; index += 1) {
    const issue = issues[index];
    if (visibleIssues.some((visibleIssue) => visibleIssue.id === issue.id)) {
      return issue.id;
    }
  }

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const issue = issues[index];
    if (visibleIssues.some((visibleIssue) => visibleIssue.id === issue.id)) {
      return issue.id;
    }
  }

  return visibleIssues[0]?.id ?? null;
}

/** @deprecated Use getVisibleIssues */
export const getVisibleOpenIssues = getVisibleIssues;
