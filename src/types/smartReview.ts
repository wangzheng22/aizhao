import type { FieldAnchor } from './completeness';

export type SmartReviewIssueType = 'risk' | 'optimization';

export type SmartReviewIssue = {
  id: string;
  type: SmartReviewIssueType;
  typeLabel: string;
  title: string;
  excerpt: string;
  searchText: string;
  pageHint?: number;
  suggestion: string;
  issueCategory: string;
};

export type ResolvedSmartReviewIssue = SmartReviewIssue & {
  anchor?: FieldAnchor;
};
