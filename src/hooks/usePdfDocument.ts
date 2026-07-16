import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TocItem } from '../types/pdf';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function parseOutline(
  pdf: PDFDocumentProxy,
  items: Awaited<ReturnType<PDFDocumentProxy['getOutline']>>,
  depth = 0,
  prefix = '',
): Promise<TocItem[]> {
  if (!items?.length) return [];

  const result: TocItem[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    let pageNumber = 1;

    try {
      if (item.dest) {
        let dest: unknown = item.dest;
        if (typeof dest === 'string') {
          dest = await pdf.getDestination(dest);
        }
        if (Array.isArray(dest) && dest[0]) {
          const pageIndex = await pdf.getPageIndex(dest[0]);
          pageNumber = pageIndex + 1;
        }
      }
    } catch {
      pageNumber = 1;
    }

    const id = `${prefix}${depth}-${index}-${pageNumber}`;
    result.push({
      id,
      title: item.title,
      pageNumber,
      depth,
    });

    if (item.items?.length) {
      result.push(...(await parseOutline(pdf, item.items, depth + 1, `${id}-`)));
    }
  }

  return result;
}

export function usePdfDocument(url: string | null) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setPdf(null);
      setToc([]);
      setNumPages(0);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const doc = await getDocument(url as string).promise;
        if (cancelled) return;

        const outline = await doc.getOutline();
        const items = await parseOutline(doc, outline);

        setPdf(doc);
        setNumPages(doc.numPages);
        setToc(items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'PDF 加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { pdf, toc, numPages, loading, error };
}
