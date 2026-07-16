export type CompletenessIssueType = 'missing' | 'risk' | 'format';

export type CompletenessIssue = {
  id: string;
  type: CompletenessIssueType;
  typeLabel: string;
  title: string;
  excerpt: string;
  searchText: string;
  pageHint?: number;
  suggestion: string;
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
