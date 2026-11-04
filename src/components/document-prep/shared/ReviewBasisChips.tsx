import { useState } from 'react';
import type { ReviewBasis } from '../../../types/reviewCard';
import { BasisDetailModal } from '../BasisDetailModal';
import '../ReviewIssueCard.css';

type ReviewBasisChipsProps = {
  bases: ReviewBasis[];
  className?: string;
};

export function ReviewBasisChips({ bases, className }: ReviewBasisChipsProps) {
  const [activeBasis, setActiveBasis] = useState<ReviewBasis | null>(null);

  if (bases.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={['review-issue-card__bases', className].filter(Boolean).join(' ')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {bases.map((basis) => (
          <button
            key={basis.id}
            type="button"
            className="review-issue-card__basis"
            title={basis.label}
            onClick={() => setActiveBasis(basis)}
          >
            <svg
              className="review-issue-card__basis-icon"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5.2 6.8a2.2 2.2 0 0 0 3.1 0l1.4-1.4a2.2 2.2 0 0 0-3.1-3.1L6 2.9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M6.8 5.2a2.2 2.2 0 0 0-3.1 0L2.3 6.6a2.2 2.2 0 0 0 3.1 3.1L6 9.1"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span>{basis.label}</span>
          </button>
        ))}
      </div>
      <BasisDetailModal basis={activeBasis} onClose={() => setActiveBasis(null)} />
    </>
  );
}
