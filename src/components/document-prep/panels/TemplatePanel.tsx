import { useState } from 'react';
import { SidebarTip } from '../shared/SidebarTip';
import './TemplatePanel.css';

type TemplateItem = {
  id: string;
  title: string;
  source: string;
  tags: string[];
  recommended?: boolean;
};

const recommendedTemplate: TemplateItem = {
  id: 'rec-1',
  title: '装饰装修工程施工招标文件范本',
  source: '贵州公共资源交易中心 装饰工程范本 2024',
  tags: ['建设工程', '贵州', '我的收藏'],
  recommended: true,
};

const libraryTemplates: TemplateItem[] = [
  {
    id: 'lib-1',
    title: '装饰装潢施工招标文件范本',
    source: '贵州公共资源交易中心 装饰工程范本 2024',
    tags: ['贵州', '装饰', '2024版'],
  },
  {
    id: 'lib-2',
    title: '装饰装潢施工招标文件范本',
    source: '贵州公共资源交易中心 装饰工程范本 2024',
    tags: ['贵州', '装饰', '2024版'],
  },
  {
    id: 'lib-3',
    title: '装饰装潢施工招标文件范本',
    source: '贵州公共资源交易中心 装饰工程范本 2024',
    tags: ['贵州', '装饰', '2024版'],
  },
];

type TemplatePanelProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`template-panel__card ${selected ? 'template-panel__card--selected' : ''}`}>
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
}

export function TemplatePanel({ selectedId, onSelect }: TemplatePanelProps) {
  const [keyword, setKeyword] = useState('');

  const filteredLibrary = libraryTemplates.filter(
    (item) =>
      item.title.includes(keyword) ||
      item.source.includes(keyword) ||
      item.tags.some((tag) => tag.includes(keyword)),
  );

  return (
    <>
      <SidebarTip lines={['智能推荐适合范本，也可以手动选择范本']} />

      <div className="template-panel">
        <h3 className="template-panel__heading">智能推荐范本：</h3>
        <TemplateCard
          template={recommendedTemplate}
          selected={selectedId === recommendedTemplate.id}
          onSelect={() => onSelect(recommendedTemplate.id)}
        />

        <h3 className="template-panel__heading">范本库：</h3>
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
    </>
  );
}
