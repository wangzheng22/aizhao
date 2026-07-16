import type { ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import { CompletenessCard } from './CompletenessCard';
import './CompletenessPanel.css';

type CompletenessPanelProps = {
  open: boolean;
  percent: number;
  issues: ResolvedCompletenessIssue[];
  activeIssueId: string | null;
  loading?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClose: () => void;
  onIssueClick: (issue: ResolvedCompletenessIssue) => void;
  onLayoutSettled?: () => void;
};

export function CompletenessPanel({
  open,
  percent,
  issues,
  activeIssueId,
  loading = false,
  suggestionEdit,
  onClose,
  onIssueClick,
  onLayoutSettled,
}: CompletenessPanelProps) {
  const openIssues = sortIssuesByDocumentOrder(issues.filter((issue) => issue.status === 'open'));

  return (
    <aside
      className={`completeness-panel ${open ? 'completeness-panel--open' : ''}`}
      aria-label="完整性检查"
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'width') {
          onLayoutSettled?.();
        }
      }}
    >
      <div className="completeness-panel__header">
        <div className="completeness-panel__title-wrap">
          <h2 className="completeness-panel__title">完整性</h2>
          <span className="completeness-panel__percent">{percent}%</span>
        </div>
        <button type="button" className="completeness-panel__close" aria-label="关闭完整性面板" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="completeness-panel__body">
        {loading && <p className="completeness-panel__empty">正在定位文档字段…</p>}
        {!loading && openIssues.length === 0 && (
          <p className="completeness-panel__empty">暂无完整性问题</p>
        )}
        {!loading &&
          openIssues.map((issue) => (
            <CompletenessCard
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
