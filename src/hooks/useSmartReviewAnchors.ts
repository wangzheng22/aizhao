import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { smartReviewIssues } from '../data/smartReviewIssues';
import type { FieldAnchor } from '../types/completeness';
import type { ResolvedSmartReviewIssue } from '../types/smartReview';
import { findTextAnchor } from '../utils/pdfTextAnchor';

const SMART_REVIEW_MARKER_LABEL = '审';

export function useSmartReviewAnchors(pdf: PDFDocumentProxy | null) {
  const [issues, setIssues] = useState<ResolvedSmartReviewIssue[]>(
    smartReviewIssues.map((issue) => ({ ...issue })),
  );
  const [anchors, setAnchors] = useState<FieldAnchor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdf) return undefined;

    const doc = pdf;
    let cancelled = false;

    async function resolveAnchors() {
      setLoading(true);

      const nextIssues: ResolvedSmartReviewIssue[] = [];
      const nextAnchors: FieldAnchor[] = [];

      for (const issue of smartReviewIssues) {
        const match = await findTextAnchor(doc, issue.searchText, issue.pageHint);

        const resolvedIssue: ResolvedSmartReviewIssue = {
          ...issue,
          anchor: match
            ? {
                issueId: issue.id,
                pageNumber: match.pageNumber,
                rect: match.rect,
                markerLabel: SMART_REVIEW_MARKER_LABEL,
                category: 'smart-review',
              }
            : undefined,
        };

        nextIssues.push(resolvedIssue);

        if (match) {
          nextAnchors.push(resolvedIssue.anchor!);
        }
      }

      if (!cancelled) {
        setIssues(nextIssues);
        setAnchors(nextAnchors);
        setLoading(false);
      }
    }

    resolveAnchors();

    return () => {
      cancelled = true;
    };
  }, [pdf]);

  return { issues, anchors, loading };
}
