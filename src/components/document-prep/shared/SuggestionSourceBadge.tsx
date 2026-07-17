import './SuggestionSourceBadge.css';

type SuggestionSourceBadgeProps = {
  isManual: boolean;
};

export function SuggestionSourceBadge({ isManual }: SuggestionSourceBadgeProps) {
  const base = import.meta.env.BASE_URL;

  if (isManual) {
    return (
      <span className="suggestion-source-badge suggestion-source-badge--manual" aria-label="人工修改">
        <img src={`${base}icons/manual-source.png`} alt="" className="suggestion-source-badge__icon" />
      </span>
    );
  }

  return (
    <span className="suggestion-source-badge suggestion-source-badge--ai" aria-label="AI 生成">
      <img
        src={`${base}icons/ai-source.png`}
        alt=""
        className="suggestion-source-badge__icon suggestion-source-badge__icon--ai"
      />
    </span>
  );
}
