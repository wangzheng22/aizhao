import type { TocItem } from '../../types/pdf';
import './DocumentToc.css';

type DocumentTocProps = {
  open: boolean;
  items: TocItem[];
  activePage: number;
  loading?: boolean;
  onItemClick: (pageNumber: number) => void;
};

export function DocumentToc({ open, items, activePage, loading = false, onItemClick }: DocumentTocProps) {
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
      <nav className="document-toc__nav">
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
                  className={`document-toc__item ${activePage === item.pageNumber ? 'document-toc__item--active' : ''}`}
                  style={{ paddingLeft: `${12 + item.depth * 16}px` }}
                  onClick={() => onItemClick(item.pageNumber)}
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
