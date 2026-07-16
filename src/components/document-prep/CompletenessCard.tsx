import type { ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { EditableSuggestion } from './shared/EditableSuggestion';
import './CompletenessCard.css';

type CompletenessCardProps = {
  issue: ResolvedCompletenessIssue;
  active?: boolean;
  interactive?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClick?: () => void;
};

export function CompletenessCard({
  issue,
  active = false,
  interactive = true,
  suggestionEdit,
  onClick,
}: CompletenessCardProps) {
  const className = [
    'completeness-card',
    active ? 'completeness-card--active' : '',
    issue.anchor ? '' : 'completeness-card--unlinked',
    interactive ? 'completeness-card--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const suggestionText = suggestionEdit
    ? suggestionEdit.getSuggestionText(issue.id, issue.suggestion)
    : issue.suggestion;

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
      <div className="completeness-card__header">
        <span className={`completeness-card__tag completeness-card__tag--${issue.type}`}>
          {issue.typeLabel}
        </span>
        <h3 className="completeness-card__title">{issue.title}</h3>
      </div>

      <div className="completeness-card__divider" aria-hidden="true" />

      <div className="completeness-card__section">
        <span className="completeness-card__label">原文节选：</span>
        <div className="completeness-card__excerpt-block">
          <p className="completeness-card__excerpt">{issue.excerpt}</p>
        </div>
      </div>

      <div className="completeness-card__section completeness-card__section--last">
        <span className="completeness-card__label">修改建议：</span>
        <div
          className={[
            'completeness-card__suggestion-block',
            suggestionEdit ? '' : 'completeness-card__suggestion-block--static',
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
            <p className="completeness-card__suggestion">{issue.suggestion}</p>
          )}
        </div>
      </div>
    </article>
  );
}
