import { useEffect, useRef, useState } from 'react';
import {
  PROJECT_TEMPLATE_LIBRARY,
  RECOMMENDED_PROJECT_TEMPLATE,
  type ProjectTemplateItem,
} from '../../../data/projectTemplates';
import './TemplatePanel.css';

const recommendedTemplate = RECOMMENDED_PROJECT_TEMPLATE;
const libraryTemplates = PROJECT_TEMPLATE_LIBRARY;

type TemplatePanelProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  showAiRecommend?: boolean;
};

function TemplateCard({
  template,
  selected,
  flowSelected,
  onSelect,
}: {
  template: ProjectTemplateItem;
  selected: boolean;
  flowSelected?: boolean;
  onSelect: () => void;
}) {
  const card = (
    <label
      className={[
        'template-panel__card',
        selected ? 'template-panel__card--selected' : '',
        flowSelected && selected ? 'template-panel__card--flow' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="radio"
        name="template"
        className="template-panel__radio"
        checked={selected}
        onChange={onSelect}
      />
      <div className="template-panel__card-body">
        <p className="template-panel__card-title">{template.title}</p>
        <div className="template-panel__tags">
          {template.tags.map((tag) => (
            <span key={tag} className="template-panel__tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="template-panel__card-source">{template.source}</p>
      </div>
    </label>
  );

  if (flowSelected && selected) {
    return <div className="template-panel__card-flow-wrap">{card}</div>;
  }

  return card;
}

export function TemplatePanel({
  selectedId,
  onSelect,
  showAiRecommend = false,
}: TemplatePanelProps) {
  const [keyword, setKeyword] = useState('');
  const aiRecommendShownRef = useRef(false);

  useEffect(() => {
    if (!showAiRecommend) {
      aiRecommendShownRef.current = false;
      return;
    }
    if (!aiRecommendShownRef.current) {
      aiRecommendShownRef.current = true;
      onSelect(recommendedTemplate.id);
    }
  }, [showAiRecommend, onSelect]);

  const filteredLibrary = libraryTemplates.filter(
    (item) =>
      item.title.includes(keyword) ||
      item.source.includes(keyword) ||
      item.tags.some((tag) => tag.includes(keyword)),
  );

  return (
    <div className="template-panel">
      {showAiRecommend && (
        <>
          <h3 className="template-panel__heading">AI智能推荐范本</h3>
          <TemplateCard
            template={recommendedTemplate}
            selected={selectedId === recommendedTemplate.id}
            flowSelected
            onSelect={() => onSelect(recommendedTemplate.id)}
          />
        </>
      )}

      <div className="template-panel__search">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" stroke="#999" strokeWidth="1.2" />
          <path d="M9.5 9.5L12 12" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className="template-panel__search-input"
          placeholder="请输入关键词"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="template-panel__list">
        {filteredLibrary.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selectedId === template.id}
            onSelect={() => onSelect(template.id)}
          />
        ))}
      </div>
    </div>
  );
}
