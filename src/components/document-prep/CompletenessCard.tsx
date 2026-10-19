import type { ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import { ReviewIssueCard } from './ReviewIssueCard';

type CompletenessCardProps = {
  issue: ResolvedCompletenessIssue;
  active?: boolean;
  interactive?: boolean;
  suggestionEdit?: SuggestionEditHandlers;
  onClick?: () => void;
  onAddToConfirmList?: (issueId: string) => void;
  onApplySuggestion?: (issueId: string, suggestion: string) => void;
  onRegenerateSuggestion?: (issueId: string, nextSuggestion: string) => void;
  inConfirmList?: boolean;
  showConfirmCheckbox?: boolean;
  confirmChecked?: boolean;
  onConfirmCheckedChange?: (checked: boolean) => void;
};

export function CompletenessCard({
  issue,
  active = false,
  interactive = true,
  suggestionEdit,
  onClick,
  onAddToConfirmList,
  onApplySuggestion,
  onRegenerateSuggestion,
  inConfirmList,
  showConfirmCheckbox,
  confirmChecked,
  onConfirmCheckedChange,
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
      onAddToConfirmList={onAddToConfirmList}
      onApplySuggestion={onApplySuggestion}
      onRegenerateSuggestion={onRegenerateSuggestion}
      inConfirmList={inConfirmList}
      showConfirmCheckbox={showConfirmCheckbox}
      confirmChecked={confirmChecked}
      onConfirmCheckedChange={onConfirmCheckedChange}
    />
  );
}
