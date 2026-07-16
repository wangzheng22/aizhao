import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { EditableSuggestion } from './shared/EditableSuggestion';
import { SuggestionSourceBadge } from './shared/SuggestionSourceBadge';
import './SmartReviewCard.css';

type SmartReviewCardProps = {
  issue: ResolvedSmartReviewIssue;
  active?: boolean;
  interactive?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClick?: () => void;
};

export function SmartReviewCard({
  issue,
  active = false,
  interactive = true,
  suggestionEdit,
  onClick,
}: SmartReviewCardProps) {
  const className = [
    'smart-review-card',
    active ? 'smart-review-card--active' : '',
    issue.anchor ? '' : 'smart-review-card--unlinked',
    interactive ? 'smart-review-card--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const suggestionText = suggestionEdit
    ? suggestionEdit.getSuggestionText(issue.id, issue.suggestion)
    : issue.suggestion;

  const isManual = suggestionEdit
    ? suggestionEdit.isManualSuggestion(issue.id, issue.suggestion)
    : false;

  return (
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
      <div className="smart-review-card__header">
        <span className={`smart-review-card__tag smart-review-card__tag--${issue.type}`}>
          {issue.typeLabel}
        </span>
        <h3 className="smart-review-card__title">{issue.title}</h3>
      </div>

      <div className="smart-review-card__divider" aria-hidden="true" />

      <div className="smart-review-card__section">
        <span className="smart-review-card__label">原文节选：</span>
        <div className="smart-review-card__excerpt-block">
          <p className="smart-review-card__excerpt">{issue.excerpt}</p>
        </div>
      </div>

      <div className="smart-review-card__section">
        <span className="smart-review-card__label">修改建议：</span>
        <div
          className={[
            'smart-review-card__suggestion-block',
            suggestionEdit ? '' : 'smart-review-card__suggestion-block--static',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {suggestionEdit ? (
            <EditableSuggestion
              value={suggestionText}
              originalValue={issue.suggestion}
              onSave={(value) => suggestionEdit.onSuggestionSave(issue.id, issue.suggestion, value)}
            />
          ) : (
            <p className="smart-review-card__suggestion">{issue.suggestion}</p>
          )}
        </div>
      </div>

      <div className="smart-review-card__footer">
        <span className="smart-review-card__category">
          问题类型：<em>{issue.issueCategory}</em>
        </span>
        <SuggestionSourceBadge isManual={isManual} />
      </div>
    </article>
  );
}
