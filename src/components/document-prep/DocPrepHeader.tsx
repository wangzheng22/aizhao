import { useEffect, useState } from 'react';
import './DocPrepHeader.css';

export type HeaderNotice = {
  id: number;
  text: string;
} | null;

type DocPrepHeaderProps = {
  title: string;
  notice: HeaderNotice;
  projectInfoOpen: boolean;
  reReviewEnabled?: boolean;
  reReviewing?: boolean;
  onToggleProjectInfo: () => void;
  onReReview?: () => void;
  onSave: () => void;
  onExport: () => void;
  onTraceReport: () => void;
};

const NOTICE_ANIM_MS = 420;

export function DocPrepHeader({
  title,
  notice,
  projectInfoOpen,
  reReviewEnabled = false,
  reReviewing = false,
  onToggleProjectInfo,
  onReReview,
  onSave,
  onExport,
  onTraceReport,
}: DocPrepHeaderProps) {
  const [displayNotice, setDisplayNotice] = useState<HeaderNotice>(null);
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;

    if (!displayNotice) {
      setDisplayNotice(notice);
      setEntering(true);
      const enterId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setEntering(false));
      });
      return () => window.cancelAnimationFrame(enterId);
    }

    if (displayNotice.id === notice.id) return undefined;

    setExiting(true);
    const timeoutId = window.setTimeout(() => {
      setDisplayNotice(notice);
      setExiting(false);
      setEntering(true);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setEntering(false));
      });
    }, NOTICE_ANIM_MS);

    return () => window.clearTimeout(timeoutId);
  }, [notice, displayNotice]);

  return (
    <header className="doc-prep-header">
      <h1 className="doc-prep-header__title">{title}</h1>

      <div className="doc-prep-header__message" aria-live="polite">
        {displayNotice && (
          <span
            className={[
              'doc-prep-header__notice',
              exiting ? 'doc-prep-header__notice--exiting' : '',
              entering ? 'doc-prep-header__notice--entering' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M4.5 7l2 2 3.5-4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {displayNotice.text}
          </span>
        )}
      </div>

      <div className="doc-prep-header__actions">
        <button
          type="button"
          className={[
            'doc-prep-header__btn',
            projectInfoOpen ? 'doc-prep-header__btn--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={projectInfoOpen}
          onClick={onToggleProjectInfo}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 3.5h9M2.5 7h9M2.5 10.5h6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span>项目信息</span>
        </button>

        <button
          type="button"
          className={[
            'doc-prep-header__btn',
            'doc-prep-header__btn--re-review',
            reReviewing ? 'doc-prep-header__btn--re-reviewing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={!reReviewEnabled || reReviewing}
          onClick={onReReview}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M11.5 7A4.5 4.5 0 1 1 9.4 3.2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M9.2 1.6v2.4H11.6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{reReviewing ? '评审中…' : '重新评审'}</span>
        </button>

        <button type="button" className="doc-prep-header__btn" onClick={onSave}>
          <svg
            className="doc-prep-header__btn-icon doc-prep-header__btn-icon--save"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.75,14.25 C2.19771525,14.25 1.75,13.8022847 1.75,13.25 L1.75,2.7531496 C1.75,2.20086485 2.19771525,1.7531496 2.75,1.7531496 L4.40853791,1.75834627 C4.43819054,1.75286489 4.46876071,1.75 4.5,1.75 L9,1.75 C9.05270342,1.75 9.10350231,1.75815424 9.15120388,1.77326991 L11.2751294,1.77995324 C11.539255,1.78078382 11.7923255,1.88607554 11.9790915,2.07284151 L13.9571068,4.05085678 C14.1446432,4.23839316 14.25,4.49274707 14.25,4.75796356 L14.25,13.25 C14.25,13.8022847 13.8022847,14.25 13.25,14.25 L2.75,14.25 Z M2.875,2.87853125 L2.875,13.125 L4,13.125 L4,9.125 C4,8.84885763 4.22385763,8.625 4.5,8.625 L11.5,8.625 C11.7761424,8.625 12,8.84885763 12,9.125 L12,13.125 L13.125,13.125 L13.125,4.80973438 L11.2200469,2.90478125 L9.5,2.899375 L9.5,5.0625 C9.5,5.33864237 9.27614237,5.5625 9,5.5625 L4.5,5.5625 C4.22385763,5.5625 4,5.33864237 4,5.0625 L4,2.8820625 L2.875,2.87853125 Z M10.875,9.75 L5.125,9.75 L5.125,13.125 L10.875,13.125 L10.875,9.75 Z M5.125,2.88560938 L5.125,4.4375 L8.375,4.4375 L8.375,2.89582812 L5.125,2.88560938 Z"
              fill="currentColor"
            />
          </svg>
          <span>保存</span>
        </button>

        <button type="button" className="doc-prep-header__btn doc-prep-header__btn--wide">
          V1.0.0 版本
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        <button type="button" className="doc-prep-header__btn" onClick={onExport}>
          <svg
            className="doc-prep-header__btn-icon doc-prep-header__btn-icon--export"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.4375,1.75 C7.74816017,1.75 8,2.00183983 8,2.3125 C8,2.62316017 7.74816017,2.875 7.4375,2.875 L2.875,2.875 L2.875,13.125 L13.125,13.125 L13.125,8.5625 C13.125,8.25494643 13.3718282,8.00504268 13.678198,8.00007536 L13.6875,8 C13.9981602,8 14.25,8.25183983 14.25,8.5625 L14.25,13.1875 C14.25,13.7743025 13.7743025,14.25 13.1875,14.25 L2.8125,14.25 C2.22569745,14.25 1.75,13.7743025 1.75,13.1875 L1.75,2.8125 C1.75,2.22569745 2.22569745,1.75 2.8125,1.75 L7.4375,1.75 Z M13.75,1.75 C14.0261424,1.75 14.25,1.97385763 14.25,2.25 L14.25,5.4375 C14.25,5.74816017 13.9981602,6 13.6875,6 C13.3768398,6 13.125,5.74816017 13.125,5.4375 L13.125,3.67046875 L8.96024756,7.83524756 C8.74057765,8.05491748 8.38442235,8.05491748 8.16475244,7.83524756 C7.94508252,7.61557765 7.94508252,7.25942235 8.16475244,7.03975244 L12.3295,2.875 L10.5625,2.875 C10.2518398,2.875 10,2.62316017 10,2.3125 C10,2.00183983 10.2518398,1.75 10.5625,1.75 L13.75,1.75 Z"
              fill="currentColor"
            />
          </svg>
          <span>导出</span>
        </button>

        <button type="button" className="doc-prep-header__btn" onClick={onTraceReport}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M3 2.5h8v9H3zM5 5h4M5 7.5h4M5 10h2.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>溯源报告</span>
        </button>

        <button type="button" className="doc-prep-header__user" aria-label="用户菜单">
          <span className="doc-prep-header__avatar" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.5" fill="white" />
              <path
                d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="doc-prep-header__username">用户名XX</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
