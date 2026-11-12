import { useState } from 'react';
import type { ReviewBasis, ReviewCardTone } from '../../types/reviewCard';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { BasisDetailModal } from './BasisDetailModal';
import { EditableSuggestion } from './shared/EditableSuggestion';
import './ReviewIssueCard.css';

export type ReviewIssueCardModel = {
  id: string;
  tone: ReviewCardTone;
  tagLabel: string;
  title: string;
  reason: string;
  bases: ReviewBasis[];
  suggestion: string;
  suggestionVariants?: string[];
  linked?: boolean;
};

type ReviewIssueCardProps = {
  issue: ReviewIssueCardModel;
  active?: boolean;
  interactive?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClick?: () => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  /** Suggestion has been applied to the document */
  applied?: boolean;
  /** Hide title row (e.g. embedded in chapter field block) */
  showHeader?: boolean;
  /** 编审清单章节内嵌卡片展示形态 */
  listVariant?: 'default' | 'issue' | 'pending';
  fieldName?: string;
};

export function ReviewIssueCard({
  issue,
  active = false,
  interactive = true,
  suggestionEdit,
  onClick,
  onApplySuggestion,
  onRegenerateSuggestion,
  applied = false,
  showHeader = true,
  listVariant = 'default',
  fieldName,
}: ReviewIssueCardProps) {
  const [activeBasis, setActiveBasis] = useState<ReviewBasis | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  const className = [
    'review-issue-card',
    `review-issue-card--${issue.tone}`,
    active ? 'review-issue-card--active' : '',
    issue.linked === false ? 'review-issue-card--unlinked' : '',
    interactive ? 'review-issue-card--interactive' : '',
    applied ? 'review-issue-card--applied' : '',
    !showHeader ? 'review-issue-card--embedded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const suggestionText = suggestionEdit
    ? suggestionEdit.getSuggestionText(issue.id, issue.suggestion)
    : issue.suggestion;

  const stop = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleRegenerate = (event: React.MouseEvent) => {
    stop(event);
    const variants = issue.suggestionVariants?.length
      ? issue.suggestionVariants
      : [`${issue.suggestion}（已根据最新审查规则重新生成）`];

    setRegenerating(true);
    window.setTimeout(() => {
      const nextIndex = (variantIndex + 1) % variants.length;
      const next = variants[nextIndex];
      setVariantIndex(nextIndex);
      if (suggestionEdit) {
        suggestionEdit.onSuggestionSave(issue.id, issue.suggestion, next);
      }
      onRegenerateSuggestion?.(issue.id, next);
      setRegenerating(false);
    }, 450);
  };

  const handleApply = (event: React.MouseEvent) => {
    stop(event);
    onApplySuggestion?.(issue.id, suggestionText);
  };

  const structuredList = !showHeader && listVariant === 'pending';

  const labeledSections = structuredList ? (
    <div className="review-issue-card__labeled" onClick={stop} onKeyDown={stop}>
      <LabeledFieldRow label="原因分析" value={issue.reason} multiline />
      {issue.bases.length > 0 && (
        <div className="review-issue-card__labeled-row review-issue-card__labeled-row--basis">
          <span className="review-issue-card__labeled-k">依据：</span>
          <div className="review-issue-card__bases review-issue-card__bases--inline">
            {issue.bases.map((basis) => (
              <button
                key={basis.id}
                type="button"
                className="review-issue-card__basis"
                title={basis.label}
                onClick={(event) => {
                  stop(event);
                  setActiveBasis(basis);
                }}
              >
                <svg
                  className="review-issue-card__basis-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5.2 6.8a2.2 2.2 0 0 0 3.1 0l1.4-1.4a2.2 2.2 0 0 0-3.1-3.1L6 2.9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.8 5.2a2.2 2.2 0 0 0-3.1 0L2.3 6.6a2.2 2.2 0 0 0 3.1 3.1L6 9.1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{basis.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <article
        data-card-id={issue.id}
        className={className}
        onClick={interactive ? onClick : undefined}
        onKeyDown={
          interactive
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        {showHeader && (
          <div className="review-issue-card__header">
            <div className="review-issue-card__title-row">
              <span className={`review-issue-card__tag review-issue-card__tag--${issue.tone}`}>
                {issue.tagLabel}
              </span>
              <h3 className="review-issue-card__title" title={issue.title}>
                {issue.title}
              </h3>
            </div>
          </div>
        )}

        {labeledSections}

        {!structuredList && (
          <div className="review-issue-card__labeled-row review-issue-card__labeled-row--multiline">
            <span className="review-issue-card__labeled-k">原因分析：</span>
            <p className="review-issue-card__reason review-issue-card__labeled-v">{issue.reason}</p>
          </div>
        )}

        {!structuredList && issue.bases.length > 0 && (
          <div className="review-issue-card__labeled-row review-issue-card__labeled-row--basis">
            <span className="review-issue-card__labeled-k">依据：</span>
            <div className="review-issue-card__bases review-issue-card__bases--inline" onClick={stop} onKeyDown={stop}>
            {issue.bases.map((basis) => (
              <button
                key={basis.id}
                type="button"
                className="review-issue-card__basis"
                title={basis.label}
                onClick={(event) => {
                  stop(event);
                  setActiveBasis(basis);
                }}
              >
                <svg
                  className="review-issue-card__basis-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5.2 6.8a2.2 2.2 0 0 0 3.1 0l1.4-1.4a2.2 2.2 0 0 0-3.1-3.1L6 2.9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.8 5.2a2.2 2.2 0 0 0-3.1 0L2.3 6.6a2.2 2.2 0 0 0 3.1 3.1L6 9.1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{basis.label}</span>
              </button>
            ))}
            </div>
          </div>
        )}

        <div className="review-issue-card__ai" onClick={stop} onMouseDown={stop}>
          <div className="review-issue-card__ai-header">
            <span className="review-issue-card__ai-label">
              <img
                className="review-issue-card__ai-badge"
                src={`${import.meta.env.BASE_URL}icons/ai-badge.png`}
                alt=""
                aria-hidden="true"
              />
              修改建议：
            </span>
            <div className="review-issue-card__ai-actions">
              {showHeader && (
                <button
                  type="button"
                  className="review-issue-card__ai-action"
                  disabled={regenerating}
                  onClick={handleRegenerate}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M10 6A4 4 0 1 1 8.2 2.6"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path d="M8 1.2v2.2h2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {regenerating ? '生成中…' : '重新生成'}
                </button>
              )}
              <button
                type="button"
                className="review-issue-card__ai-action review-issue-card__ai-action--apply"
                onClick={handleApply}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="9" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M4 6h4M6.2 4.2L8 6l-1.8 1.8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                采纳
              </button>
            </div>
          </div>

          <div className="review-issue-card__ai-body">
            {suggestionEdit ? (
              <EditableSuggestion
                value={suggestionText}
                originalValue={issue.suggestion}
                onSave={(value) => suggestionEdit.onSuggestionSave(issue.id, issue.suggestion, value)}
              />
            ) : (
              <p className="review-issue-card__ai-text">{suggestionText}</p>
            )}
          </div>
        </div>
      </article>

      <BasisDetailModal basis={activeBasis} onClose={() => setActiveBasis(null)} />
    </>
  );
}

function LabeledFieldRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div
      className={[
        'review-issue-card__labeled-row',
        multiline ? 'review-issue-card__labeled-row--multiline' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="review-issue-card__labeled-k">{label}：</span>
      <span className="review-issue-card__labeled-v">{value}</span>
    </div>
  );
}
