import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Util } from 'pdfjs-dist';

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  fontName?: string;
  hasEOL?: boolean;
};

function isTextItem(item: unknown): item is PdfTextItem {
  return typeof item === 'object' && item !== null && 'str' in item;
}

type PdfTextLayerProps = {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  visible: boolean;
};

/**
 * Position text spans using the same viewport transform as the canvas,
 * but keep CSS text upright (do not apply PDF's negative scaleY).
 */
export function PdfTextLayer({ pdf, pageNumber, width, visible }: PdfTextLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !layerRef.current || width <= 0) return undefined;

    const container = layerRef.current;
    let cancelled = false;

    async function renderTextLayer() {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;

      const rotation = page.rotate || 0;
      const baseViewport = page.getViewport({ scale: 1, rotation });
      const scale = width / baseViewport.width;
      const viewport = page.getViewport({ scale, rotation });
      const textContent = await page.getTextContent();

      if (cancelled || !container) return;

      const fragment = document.createDocumentFragment();

      for (const item of textContent.items) {
        if (!isTextItem(item) || !item.str) continue;

        const tx = Util.transform(viewport.transform, item.transform);
        // PDF Y is flipped in the viewport matrix; derive upright size/angle for CSS.
        const fontHeight = Math.hypot(tx[2], tx[3]) || 12;
        // Angle from the glyph x-axis after viewport transform; ignore the Y flip.
        const angle = Math.atan2(tx[1], tx[0]);

        const span = document.createElement('span');
        span.textContent = item.str;
        span.style.left = `${tx[4]}px`;
        // tx[5] is the baseline after Y-flip; subtract fontHeight for CSS top.
        span.style.top = `${tx[5] - Math.abs(fontHeight)}px`;
        span.style.fontSize = `${Math.abs(fontHeight)}px`;
        span.style.fontFamily = item.fontName ? `"${item.fontName}", sans-serif` : 'sans-serif';

        // Only rotate when the glyph itself is rotated (e.g. vertical text).
        // Do NOT apply scaleY from the PDF matrix — that would flip characters upside down.
        if (Math.abs(angle) > 0.01) {
          span.style.transform = `rotate(${angle}rad)`;
        }

        fragment.appendChild(span);
      }

      container.replaceChildren(fragment);
    }

    renderTextLayer();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, width, visible]);

  if (!visible) return null;

  return <div ref={layerRef} className="pdf-page__text-layer" />;
}
