import type { FieldAnchor } from '../types/completeness';

export type IssueWithDocumentPosition = {
  id: string;
  anchor?: FieldAnchor;
  pageHint?: number;
};

function getIssueDocumentPosition(issue: IssueWithDocumentPosition) {
  return {
    pageNumber: issue.anchor?.pageNumber ?? issue.pageHint ?? Number.MAX_SAFE_INTEGER,
    y: issue.anchor?.rect.y ?? Number.MAX_SAFE_INTEGER,
    x: issue.anchor?.rect.x ?? Number.MAX_SAFE_INTEGER,
  };
}

export function sortIssuesByDocumentOrder<T extends IssueWithDocumentPosition>(issues: T[]): T[] {
  return [...issues].sort((left, right) => {
    const leftPos = getIssueDocumentPosition(left);
    const rightPos = getIssueDocumentPosition(right);

    if (leftPos.pageNumber !== rightPos.pageNumber) {
      return leftPos.pageNumber - rightPos.pageNumber;
    }

    if (leftPos.y !== rightPos.y) {
      return leftPos.y - rightPos.y;
    }

    if (leftPos.x !== rightPos.x) {
      return leftPos.x - rightPos.x;
    }

    return left.id.localeCompare(right.id);
  });
}
