import type { ReviewBasis } from './reviewCard';

export type CompletenessIssueType = 'missing' | 'risk' | 'format';

export type CompletenessIssue = {
  id: string;
  type: CompletenessIssueType;
  typeLabel: string;
  title: string;
  /** 问题原因 */
  reason: string;
  excerpt: string;
  searchText: string;
  pageHint?: number;
  bases: ReviewBasis[];
  suggestion: string;
  /** Alternate suggestions used by「重新生成」demo */
  suggestionVariants?: string[];
  status: 'open' | 'passed';
};

export type FieldAnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type IssueCategory = 'completeness' | 'smart-review' | 'comment';

export type FieldAnchor = {
  issueId: string;
  pageNumber: number;
  rect: FieldAnchorRect;
  markerLabel: string;
  category?: IssueCategory;
};

export type ResolvedCompletenessIssue = CompletenessIssue & {
  anchor?: FieldAnchor;
};
