import { useEffect, useRef } from 'react';
import type { TocItem } from '../../types/pdf';
import './DocumentToc.css';

type DocumentTocProps = {
  open: boolean;
  items: TocItem[];
  activePage: number;
  /** 联动定位时高亮的目录项 id（优先于按页码匹配） */
  activeTocItemId?: string | null;
  loading?: boolean;
  onItemClick: (item: TocItem) => void;
};

export function DocumentToc({
  open,
  items,
  activePage,
  activeTocItemId = null,
  loading = false,
  onItemClick,
}: DocumentTocProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open || !activeTocItemId || !navRef.current) return;
    const btn = navRef.current.querySelector<HTMLElement>(`[data-toc-id="${activeTocItemId}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [open, activeTocItemId]);
  return (
    <aside
      className={`document-toc ${open ? 'document-toc--open' : ''}`}
      aria-label="文档目录"
      aria-hidden={!open}
    >
      <div className="document-toc__header">
        <h2 className="document-toc__title">目录</h2>
        <span className="document-toc__count">
          {loading ? '加载中…' : `${items.length} 项`}
        </span>
      </div>
      <nav ref={navRef} className="document-toc__nav">
        {loading ? (
          <p className="document-toc__empty">正在解析文档目录…</p>
        ) : items.length === 0 ? (
          <p className="document-toc__empty">暂无目录信息</p>
        ) : (
          <ul className="document-toc__list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  data-toc-id={item.id}
                  className={[
                    'document-toc__item',
                    activeTocItemId === item.id ||
                    (!activeTocItemId && activePage === item.pageNumber)
                      ? 'document-toc__item--active'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ paddingLeft: `${12 + item.depth * 16}px` }}
                  onClick={() => onItemClick(item)}
                >
                  <span className="document-toc__item-title">{item.title}</span>
                  <span className="document-toc__item-page">{item.pageNumber}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
