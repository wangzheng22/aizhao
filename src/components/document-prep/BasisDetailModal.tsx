import { useEffect } from 'react';
import type { ReviewBasis } from '../../types/reviewCard';
import './BasisDetailModal.css';

type BasisDetailModalProps = {
  basis: ReviewBasis | null;
  onClose: () => void;
};

export function BasisDetailModal({ basis, onClose }: BasisDetailModalProps) {
  useEffect(() => {
    if (!basis) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [basis, onClose]);

  if (!basis) return null;

  const article = basis.articles?.[0];
  const body = article?.text || basis.detail;

  return (
    <div className="basis-detail-modal" role="presentation" onClick={onClose}>
      <div
        className="basis-detail-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`basis-detail-title-${basis.id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="basis-detail-modal__header">
          <div className="basis-detail-modal__heading">
            <h3 id={`basis-detail-title-${basis.id}`} className="basis-detail-modal__title">
              {basis.title || basis.label}
            </h3>
            <p className="basis-detail-modal__label">
              {article?.no ? `${basis.label} · ${article.no}` : basis.label}
            </p>
          </div>
          <button type="button" className="basis-detail-modal__close" aria-label="关闭" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="basis-detail-modal__detail">{body}</p>
      </div>
    </div>
  );
}
