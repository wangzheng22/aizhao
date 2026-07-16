import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { completenessIssues } from '../data/completenessIssues';
import type { FieldAnchor, ResolvedCompletenessIssue } from '../types/completeness';
import { findTextAnchor } from '../utils/pdfTextAnchor';

const markerByType = {
  missing: '缺',
  risk: '审',
  format: '格',
} as const;

export function useCompletenessAnchors(pdf: PDFDocumentProxy | null) {
  const [issues, setIssues] = useState<ResolvedCompletenessIssue[]>(
    completenessIssues.map((issue) => ({ ...issue })),
  );
  const [anchors, setAnchors] = useState<FieldAnchor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdf) return undefined;

    const doc = pdf;
    let cancelled = false;

    async function resolveAnchors() {
      setLoading(true);

      const nextIssues: ResolvedCompletenessIssue[] = [];
      const nextAnchors: FieldAnchor[] = [];

      for (const issue of completenessIssues) {
        if (issue.status === 'passed') {
          nextIssues.push({ ...issue });
          continue;
        }

        const match = await findTextAnchor(doc, issue.searchText, issue.pageHint);

        const resolvedIssue: ResolvedCompletenessIssue = {
          ...issue,
          anchor: match
            ? {
                issueId: issue.id,
                pageNumber: match.pageNumber,
                rect: match.rect,
                markerLabel: markerByType[issue.type],
                category: 'completeness',
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
