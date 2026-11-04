import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ResolvedCompletenessIssue } from '../../types/completeness';
import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import type { ChapterFieldView } from '../../types/chapterReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { buildChapterReviewCards } from '../../utils/buildChapterReviewCards';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import { ChapterReviewCard } from './ChapterReviewCard';
import './ChapterReviewCard.css';
import './ReviewChecklistPanel.css';

export type ReviewFilter = 'all' | 'missing' | 'issue' | 'ok';

export type ReviewLocateRequest = {
  id: string;
  filter: ReviewFilter;
  token: number;
  /** Panel was closed and is expanding — wait for width transition before scrolling */
  expanding?: boolean;
};

export type ChapterLocateRequest = {
  chapterId: string;
  token: number;
  expanding?: boolean;
  /** 同步滚动到章节内某一字段块 */
  fieldId?: string;
};

type ReviewChecklistPanelProps = {
  open: boolean;
  completenessIssues: ResolvedCompletenessIssue[];
  smartReviewIssues: ResolvedSmartReviewIssue[];
  extractSourceFileName?: string;
  activeItemId: string | null;
  locateRequest?: ReviewLocateRequest | null;
  chapterLocateRequest?: ChapterLocateRequest | null;
  loading?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClose: () => void;
  onCompletenessClick: (issue: ResolvedCompletenessIssue) => void;
  onSmartReviewClick: (issue: ResolvedSmartReviewIssue) => void;
  appliedIssueIds?: string[];
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  onFieldLabelClick?: (chapterId: string, field: ChapterFieldView) => void;
  activeMarkId?: string | null;
  onLayoutSettled?: () => void;
};

type ChapterListFilter = ReviewFilter;

export function ReviewChecklistPanel({
  open,
  completenessIssues,
  smartReviewIssues,
  extractSourceFileName = '招标文件.pdf',
  activeItemId,
  locateRequest = null,
  chapterLocateRequest = null,
  loading = false,
  suggestionEdit,
  onClose,
  onCompletenessClick,
  onSmartReviewClick,
  appliedIssueIds = [],
  onApplySuggestion,
  onRegenerateSuggestion,
  onFieldLabelClick,
  activeMarkId = null,
  onLayoutSettled,
}: ReviewChecklistPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [decrementAnim, setDecrementAnim] = useState<{
    key: number;
    targets: Array<'all' | 'missing' | 'issue' | 'ok'>;
  } | null>(null);
  const prevAppliedRef = useRef<string[]>(appliedIssueIds);
  const appliedSetForScrollRef = useRef(new Set(appliedIssueIds));
  const listScrollBeforeApplyRef = useRef(0);

  useEffect(() => {
    if (!locateRequest) return;
    setFilter(locateRequest.filter);
  }, [locateRequest]);

  /** 采纳后列表高度变化时保持滚动位置，避免清单跳动 */
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const prevApplied = appliedSetForScrollRef.current;
    const hasNewApply = appliedIssueIds.some((id) => !prevApplied.has(id));
    if (hasNewApply) {
      body.scrollTop = listScrollBeforeApplyRef.current;
    } else {
      listScrollBeforeApplyRef.current = body.scrollTop;
    }
    appliedSetForScrollRef.current = new Set(appliedIssueIds);
  }, [appliedIssueIds, filter]);

  /** 仅正文/定位联动时滚动清单，不因采纳或 loading 重算而滚动 */
  useEffect(() => {
    if (!open || !locateRequest || !bodyRef.current) return undefined;

    const scrollToCard = () => {
      const card = bodyRef.current?.querySelector<HTMLElement>(
        `[data-card-id="${locateRequest.id}"]`,
      );
      card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const delay = locateRequest.expanding ? 280 : 80;
    const timer = window.setTimeout(scrollToCard, delay);
    return () => window.clearTimeout(timer);
  }, [open, locateRequest?.token, locateRequest?.id, locateRequest?.expanding]);

  useEffect(() => {
    if (!chapterLocateRequest) return;
    setFilter('all');
  }, [chapterLocateRequest]);

  useEffect(() => {
    if (!open || !chapterLocateRequest || !bodyRef.current) return undefined;

    const scrollToChapter = () => {
      const root = bodyRef.current;
      if (!root) return;
      if (chapterLocateRequest.fieldId) {
        const fieldEl = root.querySelector<HTMLElement>(
          `[data-field-id="${chapterLocateRequest.fieldId}"]`,
        );
        if (fieldEl) {
          fieldEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
      }
      const card = root.querySelector<HTMLElement>(
        `[data-chapter-id="${chapterLocateRequest.chapterId}"]`,
      );
      card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const delay = chapterLocateRequest.expanding ? 300 : loading ? 120 : 40;
    const timer = window.setTimeout(scrollToChapter, delay);
    return () => window.clearTimeout(timer);
  }, [open, chapterLocateRequest?.token, chapterLocateRequest?.chapterId, chapterLocateRequest?.fieldId, chapterLocateRequest?.expanding, loading]);

  const missingIssues = useMemo(
    () => sortIssuesByDocumentOrder(completenessIssues.filter((issue) => issue.status === 'open')),
    [completenessIssues],
  );

  const problemIssues = useMemo(
    () => sortIssuesByDocumentOrder(smartReviewIssues),
    [smartReviewIssues],
  );

  const chapterCards = useMemo(
    () =>
      buildChapterReviewCards(
        completenessIssues,
        smartReviewIssues,
        appliedIssueIds,
        extractSourceFileName,
      ),
    [completenessIssues, smartReviewIssues, appliedIssueIds, extractSourceFileName],
  );

  useEffect(() => {
    const prev = new Set(prevAppliedRef.current);
    const newlyApplied = appliedIssueIds.filter((id) => !prev.has(id));
    prevAppliedRef.current = appliedIssueIds;
    if (!newlyApplied.length) return;

    const targets = new Set<'all' | 'missing' | 'issue' | 'ok'>(['all']);
    newlyApplied.forEach((id) => {
      if (missingIssues.some((issue) => issue.id === id)) targets.add('missing');
      if (problemIssues.some((issue) => issue.id === id)) targets.add('issue');
    });

    setDecrementAnim({ key: Date.now(), targets: [...targets] });
  }, [appliedIssueIds, missingIssues, problemIssues]);

  const counts = useMemo(() => {
    return chapterCards.reduce(
      (acc, chapter) => ({
        all: acc.all + chapter.fields.length,
        missing: acc.missing + chapter.missingCount,
        issue: acc.issue + chapter.issueCount,
        ok: acc.ok + chapter.okCount,
      }),
      { all: 0, missing: 0, issue: 0, ok: 0 },
    );
  }, [chapterCards]);

  const chapterFilter: ChapterListFilter = filter;

  const visibleChapters = useMemo(() => {
    return chapterCards.filter((chapter) => {
      if (chapterFilter === 'all') return chapter.fields.length > 0;
      if (chapterFilter === 'missing') return chapter.missingCount > 0;
      if (chapterFilter === 'issue') return chapter.issueCount > 0;
      return chapter.okCount > 0;
    });
  }, [chapterCards, chapterFilter]);

  const completenessById = useMemo(
    () => new Map(completenessIssues.map((issue) => [issue.id, issue])),
    [completenessIssues],
  );

  const smartById = useMemo(
    () => new Map(smartReviewIssues.map((issue) => [issue.id, issue])),
    [smartReviewIssues],
  );

  const reviewFilters: { key: ChapterListFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'missing', label: '未完成项' },
    { key: 'issue', label: '问题项' },
    { key: 'ok', label: '正常项' },
  ];

  return (
    <aside
      className={`review-checklist ${open ? 'review-checklist--open' : ''}`}
      aria-label="文件编审清单"
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'width') {
          onLayoutSettled?.();
        }
      }}
    >
      <div className="review-checklist__header">
        <h2 className="review-checklist__title">文件编审清单</h2>
        <div className="review-checklist__header-actions">
          <button type="button" className="review-checklist__close" aria-label="关闭编审清单" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="review-checklist__filters" role="tablist" aria-label="审查分类">
        <div className="review-checklist__segment review-checklist__segment--full" role="presentation">
          {reviewFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              data-filter={item.key}
              className={[
                'review-checklist__segment-item',
                filter === item.key ? 'review-checklist__segment-item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setFilter(item.key)}
            >
              <span>{item.label}</span>
              <em className="review-checklist__filter-count">
                {counts[item.key]}
                {decrementAnim?.targets.includes(item.key) && (
                  <i
                    key={`${decrementAnim.key}-${item.key}`}
                    className="review-checklist__count-bump review-checklist__count-bump--down"
                    aria-hidden="true"
                  >
                    -1
                  </i>
                )}
              </em>
            </button>
          ))}
        </div>
      </div>

      <div ref={bodyRef} className="review-checklist__body">
        {loading && <p className="review-checklist__empty">正在定位文档问题…</p>}
        {!loading && visibleChapters.length === 0 && (
          <p className="review-checklist__empty">暂无相关审查项</p>
        )}
        {!loading &&
          visibleChapters.map((chapter) => (
            <ChapterReviewCard
              key={chapter.id}
              chapter={chapter}
              filter={chapterFilter}
              activeItemId={activeItemId}
              appliedIssueIds={appliedIssueIds}
              suggestionEdit={suggestionEdit}
              onCompletenessClick={(issueId) => {
                const issue = completenessById.get(issueId);
                if (issue) onCompletenessClick(issue);
              }}
              onSmartReviewClick={(issueId) => {
                const issue = smartById.get(issueId);
                if (issue) onSmartReviewClick(issue);
              }}
              onApplySuggestion={onApplySuggestion}
              onRegenerateSuggestion={onRegenerateSuggestion}
              onFieldLabelClick={onFieldLabelClick}
              activeMarkId={activeMarkId}
            />
          ))}
      </div>
    </aside>
  );
}
