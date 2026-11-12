import { useState } from 'react';
import {
  RECOMMENDED_PROJECT_TEMPLATE,
  resolveProjectTemplate,
} from '../../data/projectTemplates';
import { TemplateChangeModal } from './TemplateChangeModal';
import './ProjectInfoNextStepBar.css';

function TemplateFileIcon() {
  return (
    <svg
      className="project-info-next-step__file-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

type ProjectInfoNextStepBarProps = {
  selectedTemplateId: string;
  onTemplateSelect: (id: string) => void;
  generateDisabled?: boolean;
  generating?: boolean;
  onGenerate?: () => void;
};

export function ProjectInfoNextStepBar({
  selectedTemplateId,
  onTemplateSelect,
  generateDisabled = false,
  generating = false,
  onGenerate,
}: ProjectInfoNextStepBarProps) {
  const [changeOpen, setChangeOpen] = useState(false);
  const template = resolveProjectTemplate(selectedTemplateId);
  const isAiRecommended = selectedTemplateId === RECOMMENDED_PROJECT_TEMPLATE.id;

  return (
    <>
      <div className="project-info-next-step">
        <div className="project-info-next-step__pick">
          <span className="project-info-next-step__label">范本选择：</span>
          <div className="project-info-next-step__template">
            <TemplateFileIcon />
            <span className="project-info-next-step__template-title" title={template.title}>
              {template.title}
            </span>
            {isAiRecommended && (
              <span className="project-info-next-step__badge">AI推荐</span>
            )}
          </div>
          <button
            type="button"
            className="project-info-next-step__change"
            onClick={() => setChangeOpen(true)}
          >
            变更范本
          </button>
        </div>
        <button
          type="button"
          className="project-info-next-step__generate sidebar-footer__generate"
          disabled={generateDisabled || generating}
          onClick={onGenerate}
        >
          {generating ? '正在生成…' : '生成招标文件'}
        </button>
      </div>

      <TemplateChangeModal
        open={changeOpen}
        selectedId={selectedTemplateId}
        onSelect={onTemplateSelect}
        onClose={() => setChangeOpen(false)}
      />
    </>
  );
}
