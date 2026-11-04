import { useEffect, useRef, useState } from 'react';
import './EditableSuggestion.css';

type EditableSuggestionProps = {
  value: string;
  originalValue: string;
  onSave: (value: string) => void;
};

export function EditableSuggestion({ value, originalValue, onSave }: EditableSuggestionProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    syncHeight();
  }, [draft]);

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
          ref={textareaRef}
          className="editable-suggestion"
          value={draft}
          rows={1}
          aria-label="修改建议"
          onChange={(event) => {
            setDraft(event.target.value);
            syncHeight();
          }}
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
