import type { ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { ReviewIssueCard } from './ReviewIssueCard';

type CompletenessCardProps = {
  issue: ResolvedCompletenessIssue;
  active?: boolean;
  interactive?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClick?: () => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  applied?: boolean;
  showHeader?: boolean;
};

export function CompletenessCard({
  issue,
  active = false,
  interactive = true,
  suggestionEdit,
  onClick,
  onApplySuggestion,
  onRegenerateSuggestion,
  applied,
  showHeader = true,
}: CompletenessCardProps) {
  return (
    <ReviewIssueCard
      issue={{
        id: issue.id,
        tone: 'missing',
        tagLabel: issue.typeLabel || '缺失项',
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
