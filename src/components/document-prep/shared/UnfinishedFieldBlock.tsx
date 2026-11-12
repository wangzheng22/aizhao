import { useState } from 'react';
import '../ReviewIssueCard.css';
import './UnfinishedFieldBlock.css';

const UNFINISHED_FIELD_HINT =
  '请在项目信息页面上传相关材料，AI 自动识别填充或在该处手动输入相关内容，点击确认后填充';

type UnfinishedFieldBlockProps = {
  fieldName: string;
  issueId?: string;
  onConfirmUpload?: () => void;
  onConfirmFill?: (issueId: string, value: string) => void;
};

export function UnfinishedFieldBlock({
  fieldName,
  issueId,
  onConfirmUpload,
  onConfirmFill,
}: UnfinishedFieldBlockProps) {
  const [draft, setDraft] = useState(UNFINISHED_FIELD_HINT);

  const stop = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleConfirm = (event: React.MouseEvent) => {
    stop(event);
    const trimmed = draft.trim();
    const isDefaultHint = trimmed === UNFINISHED_FIELD_HINT;

    if (!isDefaultHint && trimmed && issueId) {
      onConfirmFill?.(issueId, trimmed);
      return;
    }

    onConfirmUpload?.();
  };

  return (
    <div className="unfinished-field-block" onClick={stop} onMouseDown={stop}>
      <div className="unfinished-field-block__panel">
        <div className="unfinished-field-block__panel-head">
          <span className="unfinished-field-block__panel-label">
            <img
              className="unfinished-field-block__ai-badge"
              src={`${import.meta.env.BASE_URL}icons/ai-badge.png`}
              alt=""
              aria-hidden="true"
            />
            修改建议
          </span>
          <div className="review-issue-card__ai-actions">
            <button
              type="button"
              className="review-issue-card__ai-action review-issue-card__ai-action--apply"
              onClick={handleConfirm}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1.5" y="1.5" width="9" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M4 6h4M6.2 4.2L8 6l-1.8 1.8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              确认
            </button>
          </div>
        </div>
        <textarea
          className="unfinished-field-block__input"
          rows={4}
          value={draft}
          aria-label={`填写或确认 ${fieldName}`}
          onChange={(event) => setDraft(event.target.value)}
          onClick={stop}
          onKeyDown={stop}
        />
      </div>
    </div>
  );
}
