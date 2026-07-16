import type { Comment } from '../types/comment';
import type { FieldAnchor } from '../types/completeness';

export function commentToAnchor(comment: Comment): FieldAnchor {
  return {
    issueId: comment.id,
    pageNumber: comment.pageNumber,
    rect: comment.rect,
    markerLabel: '',
    category: 'comment',
  };
}

export function commentToMarkerIssue(comment: Comment) {
  return {
    id: comment.id,
    type: 'comment',
    title: comment.selectedText,
    anchor: commentToAnchor(comment),
  };
}
