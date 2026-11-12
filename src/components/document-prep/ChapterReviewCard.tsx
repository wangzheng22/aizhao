import type { CSSProperties } from 'react';
import type { ChapterFieldView, ChapterReviewView } from '../../types/chapterReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { CompletenessCard } from './CompletenessCard';
import { SmartReviewCard } from './SmartReviewCard';
import { ReviewBasisChips } from './shared/ReviewBasisChips';
import { UnfinishedFieldBlock } from './shared/UnfinishedFieldBlock';
import './ChapterReviewCard.css';

export type ChapterFieldFilter = 'all' | 'missing' | 'issue' | 'pending' | 'ok';

type ChapterReviewCardProps = {
  chapter: ChapterReviewView;
  activeItemId: string | null;
  appliedIssueIds: string[];
  suggestionEdit?: SuggestionEditHandlers;
  onCompletenessClick: (issueId: string) => void;
  onSmartReviewClick: (issueId: string) => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  onConfirmUnfinishedUpload?: () => void;
  onFieldLabelClick?: (chapterId: string, field: ChapterFieldView) => void;
  activeMarkId?: string | null;
  filter: ChapterFieldFilter;
  /** 与 ReviewChecklistPanel 飞入动效配合：章节错峰延迟（毫秒） */
  entranceDelayMs?: number;
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
  onConfirmUnfinishedUpload,
  onFieldLabelClick,
  activeMarkId = null,
  filter,
  entranceDelayMs = 0,
}: ChapterReviewCardProps) {
  const appliedSet = new Set(appliedIssueIds);

  if (filter === 'missing' && chapter.missingCount === 0) {
    return null;
  }
  if (filter === 'issue' && chapter.issueCount === 0) {
    return null;
  }
  if (filter === 'pending' && chapter.pendingCount === 0) {
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
    <section
      className="chapter-review-section"
      data-chapter-id={chapter.id}
      style={
        entranceDelayMs > 0
          ? ({
              ['--review-card-enter-delay']: `${entranceDelayMs}ms`,
            } as CSSProperties)
          : undefined
      }
    >
      <h3 className="chapter-review-section__title">{chapter.chapterName}</h3>

      <div className="chapter-review-section__fields">
        {fieldsToRender.map((field) => (
          <article
            key={field.id}
            className={[
              'chapter-field-card',
              `chapter-field-card--${field.status}`,
              activeMarkId === field.id || activeMarkId === field.markTargetId
                ? 'chapter-field-card--active'
                : '',
              activeItemId === field.issueId ? 'chapter-field-card--issue-selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-field-id={field.id}
            {...(field.issueId ? { 'data-card-id': field.issueId } : {})}
          >
            <div className="chapter-field-card__head">
              <div className="chapter-field-card__name-row">
                <span className="chapter-field-card__meta-k">字段名称：</span>
                <button
                  type="button"
                  className="chapter-field-card__label"
                  disabled={!field.searchText}
                  title={field.searchText ? '定位到原文' : '暂无原文定位'}
                  onClick={() => onFieldLabelClick?.(chapter.id, field)}
                >
                  {field.fieldName}
                </button>
              </div>
              {field.status === 'ok' && <span className="chapter-field-card__tag chapter-field-card__tag--ok">正常</span>}
              {field.status === 'missing' && (
                <span className="chapter-field-card__tag chapter-field-card__tag--missing">空白</span>
              )}
              {field.status === 'issue' && (
                <span className="chapter-field-card__tag chapter-field-card__tag--issue">问题</span>
              )}
              {field.status === 'pending' && (
                <span className="chapter-field-card__tag chapter-field-card__tag--pending">待确认</span>
              )}
            </div>

            {field.status === 'missing' && (
              <div className="chapter-field-card__result-row">
                <span className="chapter-field-card__meta-k">结果：</span>
                <span className="chapter-field-card__meta-warn">未识别到该信息</span>
              </div>
            )}

            {field.status === 'missing' ? (
              <UnfinishedFieldBlock
                fieldName={field.fieldName}
                issueId={field.issueId}
                onConfirmUpload={onConfirmUnfinishedUpload}
                onConfirmFill={onApplySuggestion}
              />
            ) : (
              <>
                {field.status === 'ok' && (
                  <p className="chapter-field-card__value">{field.extractedValue}</p>
                )}

                {field.status === 'ok' && field.bases && field.bases.length > 0 && (
                  <ReviewBasisChips bases={field.bases} className="chapter-field-card__bases" />
                )}

                {field.completenessIssue && field.status === 'pending' && (
                  <CompletenessCard
                    issue={{ ...field.completenessIssue, title: field.fieldName }}
                    active={activeItemId === field.issueId}
                    interactive={false}
                    suggestionEdit={suggestionEdit}
                    showHeader={false}
                    listVariant="pending"
                    onClick={() => onCompletenessClick(field.completenessIssue!.id)}
                    onApplySuggestion={onApplySuggestion}
                    onRegenerateSuggestion={onRegenerateSuggestion}
                    applied={appliedSet.has(field.issueId!)}
                  />
                )}

                {field.smartReviewIssue && field.status === 'issue' && (
                  <SmartReviewCard
                    issue={{ ...field.smartReviewIssue, title: field.fieldName }}
                    active={activeItemId === field.issueId}
                    interactive={false}
                    suggestionEdit={suggestionEdit}
                    showHeader={false}
                    listVariant="default"
                    onClick={() => onSmartReviewClick(field.smartReviewIssue!.id)}
                    onApplySuggestion={onApplySuggestion}
                    onRegenerateSuggestion={onRegenerateSuggestion}
                    applied={appliedSet.has(field.issueId!)}
                  />
                )}
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
