import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { seedComments } from '../data/comments';
import type { Comment } from '../types/comment';
import { findTextAnchor } from '../utils/pdfTextAnchor';

const EMPTY_RECT = { x: 0, y: 0, width: 0, height: 0 };

export function useResolvedComments(pdf: PDFDocumentProxy | null, userComments: Comment[]) {
  const [resolvedSeeds, setResolvedSeeds] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdf) {
      setResolvedSeeds([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const doc = pdf;

    async function resolveSeeds() {
      setLoading(true);
      const nextSeeds: Comment[] = [];

      for (const seed of seedComments) {
        const match = await findTextAnchor(doc, seed.searchText ?? seed.selectedText, seed.pageHint);
        nextSeeds.push({
          ...seed,
          pageNumber: match?.pageNumber ?? seed.pageHint ?? 1,
          rect: match?.rect ?? EMPTY_RECT,
        });
      }

      if (!cancelled) {
        setResolvedSeeds(nextSeeds.filter((comment) => comment.rect.width > 0));
        setLoading(false);
      }
    }

    resolveSeeds();

    return () => {
      cancelled = true;
    };
  }, [pdf]);

  const seedIds = new Set(resolvedSeeds.map((comment) => comment.id));
  const mergedComments = [
    ...resolvedSeeds,
    ...userComments.filter((comment) => !seedIds.has(comment.id)),
  ];

  return { comments: mergedComments, loading };
}
