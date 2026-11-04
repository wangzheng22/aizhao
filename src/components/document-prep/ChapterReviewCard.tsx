import type { ChapterFieldView, ChapterReviewView } from '../../types/chapterReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { CompletenessCard } from './CompletenessCard';
import { SmartReviewCard } from './SmartReviewCard';
import { ReviewBasisChips } from './shared/ReviewBasisChips';
import './ChapterReviewCard.css';

export type ChapterFieldFilter = 'all' | 'missing' | 'issue' | 'ok';

type ChapterReviewCardProps = {
  chapter: ChapterReviewView;
  activeItemId: string | null;
  appliedIssueIds: string[];
  suggestionEdit?: SuggestionEditHandlers;
  onCompletenessClick: (issueId: string) => void;
  onSmartReviewClick: (issueId: string) => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  onFieldLabelClick?: (chapterId: string, field: ChapterFieldView) => void;
  activeMarkId?: string | null;
  filter: ChapterFieldFilter;
};

export function ChapterReviewCard({
  chapter,
  activeItemId,
  appliedIssueIds,
  suggestionEdit,
  onCompletenessClick,
  onSmartReviewClick,
  onApplySuggestion,
  onRegenerateSuggestion,
  onFieldLabelClick,
  activeMarkId = null,
  filter,
}: ChapterReviewCardProps) {
  const appliedSet = new Set(appliedIssueIds);

  if (filter === 'missing' && chapter.missingCount === 0) {
    return null;
  }
  if (filter === 'issue' && chapter.issueCount === 0) {
    return null;
  }
  if (filter === 'ok' && chapter.okCount === 0) {
    return null;
  }

  const fieldsToRender = chapter.fields.filter((field) => {
    if (filter === 'all') return true;
    return field.status === filter;
  });

  if (fieldsToRender.length === 0) {
    return null;
  }

  return (
    <article className="chapter-review-card" data-chapter-id={chapter.id}>
      <header className="chapter-review-card__header">
        <h3 className="chapter-review-card__title">{chapter.chapterName}</h3>
        <div className="chapter-review-card__stats">
          {chapter.missingCount > 0 && (
            <span className="chapter-review-card__stat chapter-review-card__stat--missing">
              空白 {chapter.missingCount}
            </span>
          )}
          {chapter.issueCount > 0 && (
            <span className="chapter-review-card__stat chapter-review-card__stat--issue">
              问题 {chapter.issueCount}
            </span>
          )}
          {chapter.okCount > 0 && (
            <span className="chapter-review-card__stat chapter-review-card__stat--ok">
              正常 {chapter.okCount}
            </span>
          )}
        </div>
      </header>

      <div className="chapter-review-card__fields">
        {fieldsToRender.map((field) => (
          <div key={field.id} className="chapter-review-card__field-block" data-field-id={field.id}>
            <div
              className={[
                'chapter-review-card__field-row',
                field.status !== 'ok' ? `chapter-review-card__field-row--${field.status}` : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="chapter-review-card__field-head">
                <button
                  type="button"
                  className={[
                    'chapter-review-card__field-label',
                    activeMarkId === field.id || activeMarkId === field.markTargetId
                      ? 'chapter-review-card__field-label--active'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!field.searchText}
                  title={field.searchText ? '定位到原文' : '暂无原文定位'}
                  onClick={() => onFieldLabelClick?.(chapter.id, field)}
                >
                  {field.fieldName}
                </button>
                {field.status === 'ok' && <span className="chapter-review-card__field-ok">正常</span>}
                {field.status === 'missing' && (
                  <span className="chapter-review-card__field-tag chapter-review-card__field-tag--missing">
                    空白
                  </span>
                )}
                {field.status === 'issue' && (
                  <span className="chapter-review-card__field-tag chapter-review-card__field-tag--issue">
                    问题
                  </span>
                )}
              </div>
              <span className="chapter-review-card__field-value">{field.extractedValue}</span>
            </div>

            {field.status === 'ok' && field.bases && field.bases.length > 0 && (
              <ReviewBasisChips
                bases={field.bases}
                className="chapter-review-card__field-bases"
              />
            )}

            {field.completenessIssue && (
              <CompletenessCard
                issue={{ ...field.completenessIssue, title: field.fieldName }}
                active={activeItemId === field.issueId}
                suggestionEdit={suggestionEdit}
                showHeader={false}
                onClick={() => onCompletenessClick(field.completenessIssue!.id)}
                onApplySuggestion={onApplySuggestion}
                onRegenerateSuggestion={onRegenerateSuggestion}
                applied={appliedSet.has(field.issueId!)}
              />
            )}

            {field.smartReviewIssue && (
              <SmartReviewCard
                issue={{ ...field.smartReviewIssue, title: field.fieldName }}
                active={activeItemId === field.issueId}
                suggestionEdit={suggestionEdit}
                showHeader={false}
                onClick={() => onSmartReviewClick(field.smartReviewIssue!.id)}
                onApplySuggestion={onApplySuggestion}
                onRegenerateSuggestion={onRegenerateSuggestion}
                applied={appliedSet.has(field.issueId!)}
              />
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
