type MarkerIssueLike = {
  type: string;
  anchor?: {
    markerLabel?: string;
    category?: 'completeness' | 'smart-review' | 'comment';
  };
};

const COMPLETENESS_MARKER_LABELS: Record<string, string> = {
  missing: '缺',
  risk: '审',
  format: '格',
};

export function getIssueMarkerLabel(issue: MarkerIssueLike): string {
  if (issue.anchor?.category === 'smart-review') {
    return '审';
  }

  if (issue.anchor?.category === 'comment') {
    return '';
  }

  if (issue.anchor?.category === 'completeness') {
    return COMPLETENESS_MARKER_LABELS[issue.type] ?? issue.anchor.markerLabel ?? '！';
  }

  return issue.anchor?.markerLabel ?? '！';
}

export function getSmartReviewMarkerClass(): string {
  return 'page-issue-marker--smart-review';
}
