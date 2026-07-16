import './SuggestionSourceBadge.css';

type SuggestionSourceBadgeProps = {
  isManual: boolean;
};

export function SuggestionSourceBadge({ isManual }: SuggestionSourceBadgeProps) {
  if (isManual) {
    return (
      <span className="suggestion-source-badge suggestion-source-badge--manual" aria-label="人工修改">
        <img src="/icons/manual-source.png" alt="" className="suggestion-source-badge__icon" />
      </span>
    );
  }

  return (
    <span className="suggestion-source-badge suggestion-source-badge--ai" aria-label="AI 生成">
      <img src="/icons/ai-source.png" alt="" className="suggestion-source-badge__icon suggestion-source-badge__icon--ai" />
    </span>
  );
}
