import type { FieldAnchorRect } from './completeness';

export type Comment = {
  id: string;
  selectedText: string;
  content: string;
  authorName: string;
  createdAt: string;
  pageNumber: number;
  rect: FieldAnchorRect;
  searchText?: string;
  pageHint?: number;
  isDraft?: boolean;
};

export type CommentDraft = {
  selectedText: string;
  pageNumber: number;
  rect: FieldAnchorRect;
};
