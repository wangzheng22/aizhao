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

  const articles = basis.articles?.length
    ? basis.articles
    : [{ no: '条文摘要', text: basis.detail }];

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
            <span className="basis-detail-modal__badge">法律法规</span>
            <h3 id={`basis-detail-title-${basis.id}`} className="basis-detail-modal__title">
              {basis.title || basis.label}
            </h3>
            <p className="basis-detail-modal__label">{basis.label}</p>
          </div>
          <button type="button" className="basis-detail-modal__close" aria-label="关闭" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="basis-detail-modal__meta">
          <div className="basis-detail-modal__meta-item">
            <span className="basis-detail-modal__meta-key">效力位阶</span>
            <span className="basis-detail-modal__meta-val">{basis.source || '法律 / 行政法规 / 部门规章（模拟）'}</span>
          </div>
          <div className="basis-detail-modal__meta-item">
            <span className="basis-detail-modal__meta-key">施行 / 修订</span>
            <span className="basis-detail-modal__meta-val">{basis.effectiveDate || '现行有效（演示数据）'}</span>
          </div>
        </div>

        <section className="basis-detail-modal__section">
          <h4 className="basis-detail-modal__section-title">法规原文</h4>
          <div className="basis-detail-modal__articles">
            {articles.map((article) => (
              <article key={`${basis.id}-${article.no}`} className="basis-detail-modal__article">
                <h5 className="basis-detail-modal__article-no">{article.no}</h5>
                <p className="basis-detail-modal__article-text">{article.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="basis-detail-modal__section">
          <h4 className="basis-detail-modal__section-title">与本审查项的关联说明</h4>
          <p className="basis-detail-modal__detail">
            {basis.applyNote ||
              '系统根据当前招标文件条款与上述法规进行比对，识别出表述缺失、冲突或不合理加重责任等风险点，供编制人员复核。'}
          </p>
        </section>

        <section className="basis-detail-modal__section">
          <h4 className="basis-detail-modal__section-title">参考实践（模拟）</h4>
          <ul className="basis-detail-modal__cases">
            {(
              basis.relatedCases || [
                '同类项目审查中，时间条款仅写“详见其他章节”被要求限期澄清。',
                '违约金未设上限的条款，评标环节易引发投标人质疑与投诉。',
              ]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <p className="basis-detail-modal__footnote">以上内容为产品演示用模拟数据，不构成法律意见。</p>
      </div>
    </div>
  );
}
