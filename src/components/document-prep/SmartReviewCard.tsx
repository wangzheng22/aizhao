import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { ReviewIssueCard } from './ReviewIssueCard';

type SmartReviewCardProps = {
  issue: ResolvedSmartReviewIssue;
  active?: boolean;
  interactive?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClick?: () => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  applied?: boolean;
  showHeader?: boolean;
};

export function SmartReviewCard({
  issue,
  active = false,
  interactive = true,
  suggestionEdit,
  onClick,
  onApplySuggestion,
  onRegenerateSuggestion,
  applied,
  showHeader = true,
}: SmartReviewCardProps) {
  return (
    <ReviewIssueCard
      issue={{
        id: issue.id,
        tone: 'issue',
        tagLabel: issue.typeLabel || '问题项',
        title: issue.title,
        reason: issue.reason,
        bases: issue.bases,
        suggestion: issue.suggestion,
        suggestionVariants: issue.suggestionVariants,
        linked: Boolean(issue.anchor),
      }}
      active={active}
      interactive={interactive}
      suggestionEdit={suggestionEdit}
      onClick={onClick}
      onApplySuggestion={onApplySuggestion}
      onRegenerateSuggestion={onRegenerateSuggestion}
      applied={applied}
      showHeader={showHeader}
    />
  );
}
