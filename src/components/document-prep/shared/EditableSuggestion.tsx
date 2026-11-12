import { useEffect, useRef, useState } from 'react';
import './EditableSuggestion.css';

const SUGGESTION_MAX_HEIGHT_PX = 240;

type EditableSuggestionProps = {
  value: string;
  originalValue: string;
  onSave: (value: string) => void;
};

export function EditableSuggestion({ value, originalValue, onSave }: EditableSuggestionProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const growRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const syncHeight = () => {
    const textarea = textareaRef.current;
    const shadow = shadowRef.current;
    const grow = growRef.current;
    if (!textarea || !shadow || !grow) return;

    textarea.style.height = '0px';
    const growWidth = grow.clientWidth;
    if (growWidth < 8) return;

    const contentHeight = shadow.offsetHeight;
    const next = Math.min(Math.max(contentHeight, 22), SUGGESTION_MAX_HEIGHT_PX);
    textarea.style.height = `${next}px`;
    const overflow = contentHeight > SUGGESTION_MAX_HEIGHT_PX;
    textarea.style.overflowY = overflow ? 'auto' : 'hidden';
  };

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const grow = growRef.current;
    if (!grow) return;

    const run = () => window.requestAnimationFrame(syncHeight);
    run();

    const ro = new ResizeObserver(() => run());
    ro.observe(grow);
    return () => ro.disconnect();
  }, [draft, value]);

  const handleBlur = () => {
    setFocused(false);
    const trimmed = draft.trim() || originalValue;
    setDraft(trimmed);
    onSave(trimmed);
  };

  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const displayText = draft || '\u00a0';

  return (
    <div
      className={[
        'editable-suggestion-wrap',
        focused ? 'editable-suggestion-wrap--focused' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div ref={growRef} className="editable-suggestion-grow">
        <textarea
          ref={textareaRef}
          className="editable-suggestion"
          value={draft}
          rows={1}
          placeholder={originalValue.trim() ? undefined : '暂无修改建议，可点击重新生成'}
          aria-label="修改建议"
          onChange={(event) => {
            setDraft(event.target.value);
            window.requestAnimationFrame(syncHeight);
          }}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          onKeyDown={stopPropagation}
          onKeyUp={stopPropagation}
        />
        <div ref={shadowRef} className="editable-suggestion-shadow" aria-hidden="true">
          {displayText}
        </div>
      </div>
    </div>
  );
}
