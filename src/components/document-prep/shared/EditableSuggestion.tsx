import { useEffect, useState } from 'react';
import './EditableSuggestion.css';

type EditableSuggestionProps = {
  value: string;
  originalValue: string;
  onSave: (value: string) => void;
};

export function EditableSuggestion({ value, originalValue, onSave }: EditableSuggestionProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleBlur = () => {
    setFocused(false);
    const trimmed = draft.trim() || originalValue;
    setDraft(trimmed);
    onSave(trimmed);
  };

  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className={[
        'editable-suggestion-wrap',
        focused ? 'editable-suggestion-wrap--focused' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="editable-suggestion-grow">
        <textarea
          className="editable-suggestion"
          value={draft}
          rows={1}
          aria-label="修改建议"
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          onKeyDown={stopPropagation}
          onKeyUp={stopPropagation}
        />
        <div className="editable-suggestion-shadow" aria-hidden="true">
          {draft || '\u00a0'}
        </div>
      </div>
    </div>
  );
}
