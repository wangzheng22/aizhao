import { useEffect, useRef } from 'react';
import type { Comment } from '../../types/comment';
import './CommentCard.css';

type CommentCardProps = {
  comment: Comment;
  active?: boolean;
  autoFocus?: boolean;
  onClick?: () => void;
  onContentChange: (content: string) => void;
  onDelete: () => void;
};

export function CommentCard({
  comment,
  active = false,
  autoFocus = false,
  onClick,
  onContentChange,
  onDelete,
}: CommentCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus || !textareaRef.current) return;
    textareaRef.current.focus();
  }, [autoFocus]);

  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <article
      data-card-id={comment.id}
      className={[
        'comment-card',
        active ? 'comment-card--active' : '',
        comment.isDraft ? 'comment-card--draft' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="comment-card__top">
        <div className="comment-card__quote-wrap">
          <span className="comment-card__tag">评论</span>
          <p className="comment-card__quote">{comment.selectedText}</p>
        </div>
        <button
          type="button"
          className="comment-card__delete"
          aria-label="删除评论"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M11.25,1.75 C11.8022847,1.75 12.25,2.19771525 12.25,2.75 L12.25,3.9765625 L13.6875,3.9765625 C13.9981602,3.9765625 14.25,4.22840233 14.25,4.5390625 C14.25,4.84972267 13.9981602,5.1015625 13.6875,5.1015625 L13.4193906,5.1015625 L12.8178311,13.3229756 C12.7795939,13.8455502 12.344469,14.25 11.8204973,14.25 L4.179568,14.25 C3.65559905,14.25 3.2204754,13.8455542 3.18223479,13.3229826 L2.58060937,5.1015625 L2.3125,5.1015625 C2.00183983,5.1015625 1.75,4.84972267 1.75,4.5390625 C1.75,4.22840233 2.00183983,3.9765625 2.3125,3.9765625 L3.71875,3.9765625 L3.71875,2.75 C3.71875,2.19771525 4.16646525,1.75 4.71875,1.75 L11.25,1.75 Z M12.2896719,5.125 L3.71032813,5.125 L4.29576562,13.125 L11.7043281,13.125 L12.2896719,5.125 Z M6.375,6.25 C6.65114237,6.25 6.875,6.47385763 6.875,6.75 L6.875,10.75 C6.875,11.0261424 6.65114237,11.25 6.375,11.25 C6.09885763,11.25 5.875,11.0261424 5.875,10.75 L5.875,6.75 C5.875,6.47385763 6.09885763,6.25 6.375,6.25 Z M9.625,6.25 C9.90114237,6.25 10.125,6.47385763 10.125,6.75 L10.125,10.75 C10.125,11.0261424 9.90114237,11.25 9.625,11.25 C9.34885763,11.25 9.125,11.0261424 9.125,10.75 L9.125,6.75 C9.125,6.47385763 9.34885763,6.25 9.625,6.25 Z M11.125,2.875 L4.84375,2.875 L4.84375,3.9765625 L11.125,3.9765625 L11.125,2.875 Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="comment-card__meta">
        <span className="comment-card__avatar" aria-hidden="true">
          {comment.authorName.slice(0, 1)}
        </span>
        <span className="comment-card__author">{comment.authorName}</span>
        <span className="comment-card__time">{comment.createdAt}</span>
      </div>

      <textarea
        ref={textareaRef}
        className="comment-card__content"
        value={comment.content}
        placeholder="请输入评论内容"
        aria-label="评论内容"
        rows={2}
        onChange={(event) => onContentChange(event.target.value)}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onKeyDown={stopPropagation}
        onFocus={stopPropagation}
      />
    </article>
  );
}
