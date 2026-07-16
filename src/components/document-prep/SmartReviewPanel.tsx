import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import { SmartReviewCard } from './SmartReviewCard';
import './SmartReviewPanel.css';

type SmartReviewPanelProps = {
  open: boolean;
  count: number;
  issues: ResolvedSmartReviewIssue[];
  activeIssueId: string | null;
  loading?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClose: () => void;
  onIssueClick: (issue: ResolvedSmartReviewIssue) => void;
  onLayoutSettled?: () => void;
};

export function SmartReviewPanel({
  open,
  count,
  issues,
  activeIssueId,
  loading = false,
  suggestionEdit,
  onClose,
  onIssueClick,
  onLayoutSettled,
}: SmartReviewPanelProps) {
  const orderedIssues = sortIssuesByDocumentOrder(issues);

  return (
    <aside
      className={`smart-review-panel ${open ? 'smart-review-panel--open' : ''}`}
      aria-label="智能审"
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'width') {
          onLayoutSettled?.();
        }
      }}
    >
      <div className="smart-review-panel__header">
        <div className="smart-review-panel__title-wrap">
          <h2 className="smart-review-panel__title">智能审</h2>
          <span className="smart-review-panel__count">{count}</span>
          <span className="smart-review-panel__unit">项</span>
        </div>
        <button type="button" className="smart-review-panel__close" aria-label="关闭智能审面板" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="smart-review-panel__body">
        {loading && <p className="smart-review-panel__empty">正在定位文档字段…</p>}
        {!loading && orderedIssues.length === 0 && (
          <p className="smart-review-panel__empty">暂无智能审问题</p>
        )}
        {!loading &&
          orderedIssues.map((issue) => (
            <SmartReviewCard
              key={issue.id}
              issue={issue}
              active={activeIssueId === issue.id}
              suggestionEdit={suggestionEdit}
              onClick={() => onIssueClick(issue)}
            />
          ))}
      </div>
    </aside>
  );
}
