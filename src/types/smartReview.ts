import type { FieldAnchor } from './completeness';
import type { ReviewBasis } from './reviewCard';

export type SmartReviewIssueType = 'risk' | 'optimization';

export type SmartReviewIssue = {
  id: string;
  type: SmartReviewIssueType;
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
  issueCategory: string;
};

export type ResolvedSmartReviewIssue = SmartReviewIssue & {
  anchor?: FieldAnchor;
};
