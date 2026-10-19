import { useEffect, useMemo, useRef, useState } from 'react';
import type { Comment } from '../../types/comment';
import type { ResolvedCompletenessIssue } from '../../types/completeness';
import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { commentToAnchor } from '../../utils/commentAnchors';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import { CompletenessCard } from './CompletenessCard';
import { CommentCard } from './CommentCard';
import { SmartReviewCard } from './SmartReviewCard';
import './ReviewChecklistPanel.css';

export type ReviewFilter = 'all' | 'missing' | 'issue' | 'annotation' | 'confirm';

export type ReviewLocateRequest = {
  id: string;
  filter: Exclude<ReviewFilter, 'confirm'>;
  token: number;
  /** Panel was closed and is expanding — wait for width transition before scrolling */
  expanding?: boolean;
};

type ReviewChecklistPanelProps = {
  open: boolean;
  completenessIssues: ResolvedCompletenessIssue[];
  smartReviewIssues: ResolvedSmartReviewIssue[];
  comments: Comment[];
  activeItemId: string | null;
  draftCommentId: string | null;
  locateRequest?: ReviewLocateRequest | null;
  loading?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClose: () => void;
  onCompletenessClick: (issue: ResolvedCompletenessIssue) => void;
  onSmartReviewClick: (issue: ResolvedSmartReviewIssue) => void;
  onCommentClick: (comment: Comment) => void;
  onCommentContentChange: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
  appliedIssueIds?: string[];
  onAddToConfirmList?: (issueId: string) => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  onExportConfirmList?: (items: { id: string; title: string; tagLabel: string; reason: string }[]) => void;
  onLayoutSettled?: () => void;
};

type ReviewEntry =
  | { kind: 'missing'; id: string; issue: ResolvedCompletenessIssue }
  | { kind: 'issue'; id: string; issue: ResolvedSmartReviewIssue };

type ChecklistEntry = ReviewEntry | { kind: 'annotation'; id: string; comment: Comment };

export function ReviewChecklistPanel({
  open,
  completenessIssues,
  smartReviewIssues,
  comments,
  activeItemId,
  draftCommentId,
  locateRequest = null,
  loading = false,
  suggestionEdit,
  onClose,
  onCompletenessClick,
  onSmartReviewClick,
  onCommentClick,
  onCommentContentChange,
  onCommentDelete,
  appliedIssueIds = [],
  onAddToConfirmList,
  onApplySuggestion,
  onRegenerateSuggestion,
  onExportConfirmList,
  onLayoutSettled,
}: ReviewChecklistPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [confirmIds, setConfirmIds] = useState<string[]>([]);
  const [selectedConfirmIds, setSelectedConfirmIds] = useState<string[]>([]);
  const [bumpAnimKey, setBumpAnimKey] = useState(0);

  useEffect(() => {
    if (draftCommentId) {
      setFilter('annotation');
    }
  }, [draftCommentId]);

  useEffect(() => {
    if (!locateRequest) return;
    setFilter(locateRequest.filter);
  }, [locateRequest]);

  useEffect(() => {
    if (!open || !activeItemId || !bodyRef.current) return undefined;

    const scrollToCard = () => {
      const card = bodyRef.current?.querySelector<HTMLElement>(`[data-card-id="${activeItemId}"]`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const delay = locateRequest?.expanding ? 280 : locateRequest ? 80 : 0;
    const timer = window.setTimeout(scrollToCard, delay);
    return () => window.clearTimeout(timer);
  }, [open, activeItemId, filter, locateRequest, loading]);

  const missingIssues = useMemo(
    () => sortIssuesByDocumentOrder(completenessIssues.filter((issue) => issue.status === 'open')),
    [completenessIssues],
  );

  const problemIssues = useMemo(
    () => sortIssuesByDocumentOrder(smartReviewIssues),
    [smartReviewIssues],
  );

  const orderedComments = useMemo(
    () =>
      sortIssuesByDocumentOrder(
        comments.map((comment) => ({
          ...comment,
          anchor: commentToAnchor(comment),
        })),
      ),
    [comments],
  );

  const allReviewEntries = useMemo(() => {
    const reviewEntries: ReviewEntry[] = [
      ...missingIssues.map((issue): ReviewEntry => ({ kind: 'missing', id: issue.id, issue })),
      ...problemIssues.map((issue): ReviewEntry => ({ kind: 'issue', id: issue.id, issue })),
    ];

    return sortIssuesByDocumentOrder(
      reviewEntries.map((entry) => ({
        ...entry,
        anchor: entry.issue.anchor,
      })),
    );
  }, [missingIssues, problemIssues]);

  const confirmEntries = useMemo(() => {
    const idSet = new Set(confirmIds);
    return allReviewEntries.filter((entry) => idSet.has(entry.id));
  }, [allReviewEntries, confirmIds]);

  useEffect(() => {
    if (confirmIds.length === 0 && filter === 'confirm') {
      setFilter('all');
    }
  }, [confirmIds.length, filter]);

  useEffect(() => {
    setSelectedConfirmIds((prev) => {
      const prevSet = new Set(prev);
      if (prev.length === 0) return [...confirmIds];
      const result = confirmIds.filter((id) => prevSet.has(id) || !prev.includes(id));
      const withNew = [...new Set([...result, ...confirmIds.filter((id) => !prevSet.has(id))])];
      return withNew.filter((id) => confirmIds.includes(id));
    });
  }, [confirmIds]);

  const appliedIdSet = useMemo(() => new Set(appliedIssueIds), [appliedIssueIds]);
  const openMissingIssues = useMemo(
    () => missingIssues.filter((issue) => !appliedIdSet.has(issue.id)),
    [missingIssues, appliedIdSet],
  );
  const openProblemIssues = useMemo(
    () => problemIssues.filter((issue) => !appliedIdSet.has(issue.id)),
    [problemIssues, appliedIdSet],
  );

  const counts = {
    all: openMissingIssues.length + openProblemIssues.length,
    missing: openMissingIssues.length,
    issue: openProblemIssues.length,
    annotation: orderedComments.length,
    confirm: confirmIds.length,
  };

  const entries = useMemo((): ChecklistEntry[] => {
    if (filter === 'annotation') {
      return orderedComments.map((comment) => ({ kind: 'annotation', id: comment.id, comment }));
    }

    if (filter === 'confirm') {
      return confirmEntries;
    }

    if (filter === 'missing') {
      return missingIssues.map((issue) => ({ kind: 'missing', id: issue.id, issue }));
    }

    if (filter === 'issue') {
      return problemIssues.map((issue) => ({ kind: 'issue', id: issue.id, issue }));
    }

    return allReviewEntries;
  }, [filter, orderedComments, confirmEntries, missingIssues, problemIssues, allReviewEntries]);

  const allConfirmSelected =
    confirmIds.length > 0 && confirmIds.every((id) => selectedConfirmIds.includes(id));

  const handleAddToConfirm = (issueId: string) => {
    setConfirmIds((prev) => {
      if (prev.includes(issueId)) return prev;
      setBumpAnimKey((key) => key + 1);
      return [...prev, issueId];
    });
    onAddToConfirmList?.(issueId);
  };

  const handleToggleSelectAll = () => {
    if (allConfirmSelected) {
      setSelectedConfirmIds([]);
    } else {
      setSelectedConfirmIds([...confirmIds]);
    }
  };

  const handleToggleCardSelect = (issueId: string, checked: boolean) => {
    setSelectedConfirmIds((prev) => {
      if (checked) {
        return prev.includes(issueId) ? prev : [...prev, issueId];
      }
      return prev.filter((id) => id !== issueId);
    });
  };

  const handleExport = () => {
    const selected = confirmEntries.filter((entry) => selectedConfirmIds.includes(entry.id));
    if (!selected.length) {
      onExportConfirmList?.([]);
      return;
    }

    const items = selected.map((entry) => ({
      id: entry.id,
      title: entry.issue.title,
      tagLabel: entry.kind === 'missing' ? '缺失项' : '问题项',
      reason: entry.issue.reason,
    }));

    const lines = [
      '待确认清单',
      `导出时间：${new Date().toLocaleString('zh-CN')}`,
      `共 ${items.length} 项`,
      '',
      ...items.map(
        (item, index) =>
          `${index + 1}. 【${item.tagLabel}】${item.title}\n   原因：${item.reason}`,
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `待确认清单_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    onExportConfirmList?.(items);
  };

  const reviewFilters: { key: Exclude<ReviewFilter, 'annotation' | 'confirm'>; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'missing', label: '缺失项' },
    { key: 'issue', label: '问题项' },
  ];

  const renderReviewCard = (entry: ReviewEntry) => {
    const common = {
      active: activeItemId === entry.id,
      suggestionEdit,
      onAddToConfirmList: handleAddToConfirm,
      onApplySuggestion,
      onRegenerateSuggestion,
      inConfirmList: confirmIds.includes(entry.id),
      showConfirmCheckbox: filter === 'confirm',
      confirmChecked: selectedConfirmIds.includes(entry.id),
      onConfirmCheckedChange: (checked: boolean) => handleToggleCardSelect(entry.id, checked),
    };

    if (entry.kind === 'missing') {
      return (
        <CompletenessCard
          key={`${filter}-${entry.id}`}
          issue={{ ...entry.issue, typeLabel: '缺失项' }}
          onClick={() => onCompletenessClick(entry.issue)}
          {...common}
        />
      );
    }

    return (
      <SmartReviewCard
        key={`${filter}-${entry.id}`}
        issue={{ ...entry.issue, typeLabel: '问题项' }}
        onClick={() => onSmartReviewClick(entry.issue)}
        {...common}
      />
    );
  };

  return (
    <aside
      className={`review-checklist ${open ? 'review-checklist--open' : ''}`}
      aria-label="智能审查清单"
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'width') {
          onLayoutSettled?.();
        }
      }}
    >
      <div className="review-checklist__header">
        <h2 className="review-checklist__title">智能审查清单</h2>
        <button type="button" className="review-checklist__close" aria-label="关闭审查清单" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="review-checklist__filters" role="tablist" aria-label="审查分类">
        <div className="review-checklist__segment" role="presentation">
          {reviewFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              className={[
                'review-checklist__segment-item',
                filter === item.key ? 'review-checklist__segment-item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setFilter(item.key)}
            >
              <span>{item.label}</span>
              <em>{counts[item.key]}</em>
            </button>
          ))}
        </div>

        <button
          type="button"
          role="tab"
          aria-selected={filter === 'annotation'}
          className={[
            'review-checklist__side-tab',
            filter === 'annotation' ? 'review-checklist__side-tab--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => setFilter('annotation')}
        >
          <span>批注项</span>
          <em>{counts.annotation}</em>
        </button>

        {counts.confirm > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'confirm'}
            className={[
              'review-checklist__side-tab',
              'review-checklist__side-tab--confirm',
              filter === 'confirm' ? 'review-checklist__side-tab--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setFilter('confirm')}
          >
            <span>待确认</span>
            <em className="review-checklist__confirm-count">
              {counts.confirm}
              {bumpAnimKey > 0 && (
                <i key={bumpAnimKey} className="review-checklist__count-bump" aria-hidden="true">
                  +1
                </i>
              )}
            </em>
          </button>
        )}
      </div>

      {filter === 'confirm' && (
        <div className="review-checklist__confirm-bar">
          <label className="review-checklist__select-all">
            <input type="checkbox" checked={allConfirmSelected} onChange={handleToggleSelectAll} />
            <span>全选</span>
          </label>
          <button
            type="button"
            className="review-checklist__export-btn"
            disabled={selectedConfirmIds.length === 0}
            onClick={handleExport}
          >
            导出待确认清单
          </button>
        </div>
      )}

      <div ref={bodyRef} className="review-checklist__body">
        {loading && <p className="review-checklist__empty">正在定位文档问题…</p>}
        {!loading && entries.length === 0 && (
          <p className="review-checklist__empty">暂无相关审查项</p>
        )}
        {!loading &&
          entries.map((entry) => {
            if (entry.kind === 'annotation') {
              return (
                <CommentCard
                  key={entry.id}
                  comment={entry.comment}
                  active={activeItemId === entry.id}
                  autoFocus={draftCommentId === entry.id}
                  onClick={() => onCommentClick(entry.comment)}
                  onContentChange={(content) => onCommentContentChange(entry.id, content)}
                  onDelete={() => onCommentDelete(entry.id)}
                />
              );
            }

            return renderReviewCard(entry);
          })}
      </div>
    </aside>
  );
}
