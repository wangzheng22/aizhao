import { useEffect, useRef } from 'react';
import type { Comment } from '../../types/comment';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import { CommentCard } from './CommentCard';
import './CommentsPanel.css';

type CommentsPanelProps = {
  open: boolean;
  comments: Comment[];
  activeCommentId: string | null;
  draftCommentId: string | null;
  onClose: () => void;
  onCommentClick: (comment: Comment) => void;
  onCommentContentChange: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
  onLayoutSettled?: () => void;
};

export function CommentsPanel({
  open,
  comments,
  activeCommentId,
  draftCommentId,
  onClose,
  onCommentClick,
  onCommentContentChange,
  onCommentDelete,
  onLayoutSettled,
}: CommentsPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const orderedComments = sortIssuesByDocumentOrder(
    comments.map((comment) => ({
      ...comment,
      anchor: {
        issueId: comment.id,
        pageNumber: comment.pageNumber,
        rect: comment.rect,
        markerLabel: '评',
        category: 'comment' as const,
      },
    })),
  );

  useEffect(() => {
    if (!open || !draftCommentId || !bodyRef.current) return;

    const card = bodyRef.current.querySelector<HTMLElement>(`[data-card-id="${draftCommentId}"]`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [open, draftCommentId, comments.length]);

  return (
    <aside
      className={`comments-panel ${open ? 'comments-panel--open' : ''}`}
      aria-label="评论"
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'width') {
          onLayoutSettled?.();
        }
      }}
    >
      <div className="comments-panel__header">
        <div className="comments-panel__title-wrap">
          <h2 className="comments-panel__title">评论</h2>
          <span className="comments-panel__count">{comments.length}</span>
          <span className="comments-panel__unit">项</span>
        </div>
        <button type="button" className="comments-panel__close" aria-label="关闭评论面板" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div ref={bodyRef} className="comments-panel__body">
        {orderedComments.length === 0 && (
          <p className="comments-panel__empty">选中正文后点击「添加评论」即可创建评论</p>
        )}
        {orderedComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            active={activeCommentId === comment.id}
            autoFocus={draftCommentId === comment.id}
            onClick={() => onCommentClick(comment)}
            onContentChange={(content) => onCommentContentChange(comment.id, content)}
            onDelete={() => onCommentDelete(comment.id)}
          />
        ))}
      </div>
    </aside>
  );
}
