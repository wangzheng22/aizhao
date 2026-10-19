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
          <h3 id={`basis-detail-title-${basis.id}`} className="basis-detail-modal__title">
            {basis.title || basis.label}
          </h3>
          <button type="button" className="basis-detail-modal__close" aria-label="关闭" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="basis-detail-modal__label">{basis.label}</p>
        <p className="basis-detail-modal__detail">{basis.detail}</p>
      </div>
    </div>
  );
}
