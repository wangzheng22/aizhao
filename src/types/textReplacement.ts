import type { FieldAnchorRect, IssueCategory } from './completeness';

/** In-viewer text replacement after applying an AI suggestion */
export type AppliedTextReplacement = {
  issueId: string;
  text: string;
  pageNumber: number;
  rect: FieldAnchorRect;
  category?: IssueCategory;
};
