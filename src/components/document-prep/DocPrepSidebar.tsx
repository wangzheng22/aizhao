import type { ReviewWizardStep } from '../../constants/documentPrep';
import { reviewWizardSteps } from '../../constants/documentPrep';
import type { ParseStatus, ProjectForm } from '../../types/documentWorkflow';
import { ProjectInfoPanel } from './panels/ProjectInfoPanel';
import { TemplatePanel } from './panels/TemplatePanel';
import { SidebarFooter } from './shared/SidebarFooter';
import './DocPrepSidebar.css';

type DocPrepSidebarProps = {
  open: boolean;
  currentStep: ReviewWizardStep;
  completedSteps: ReviewWizardStep[];
  onTabClick: (tab: ReviewWizardStep) => void;
  projectForm: ProjectForm;
  parseStatus: ParseStatus;
  onProjectFormChange: (form: ProjectForm) => void;
  selectedTemplateId: string;
  onTemplateSelect: (id: string) => void;
  generating: boolean;
  updatingSupplement: boolean;
  documentGenerated: boolean;
  onProjectNext: () => void;
  onTemplateBack: () => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onUpdateSupplement: () => void;
};

export function DocPrepSidebar({
  open,
  currentStep,
  completedSteps,
  onTabClick,
  projectForm,
  parseStatus,
  onProjectFormChange,
  selectedTemplateId,
  onTemplateSelect,
  generating,
  updatingSupplement,
  documentGenerated,
  onProjectNext,
  onTemplateBack,
  onGenerate,
  onRegenerate,
  onUpdateSupplement,
}: DocPrepSidebarProps) {
  const currentIndex = reviewWizardSteps.indexOf(currentStep);

  const isTabEnabled = (tab: ReviewWizardStep) => {
    const tabIndex = reviewWizardSteps.indexOf(tab);
    return tabIndex <= currentIndex || completedSteps.includes(tab);
  };

  return (
    <aside
      className={`doc-prep-sidebar ${open ? 'doc-prep-sidebar--open' : 'doc-prep-sidebar--collapsed'}`}
      aria-label="左侧面板"
      aria-hidden={!open}
    >
      <div className="doc-prep-sidebar__content">
        <div className="doc-prep-sidebar__tabs" role="tablist" aria-label="编制步骤">
          {reviewWizardSteps.map((tab) => {
            const enabled = isTabEnabled(tab);
            const active = currentStep === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={!enabled}
                className={[
                  'doc-prep-sidebar__tab',
                  active ? 'doc-prep-sidebar__tab--active' : '',
                  !enabled ? 'doc-prep-sidebar__tab--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onTabClick(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="doc-prep-sidebar__panel">
          {currentStep === '项目信息' && (
            <ProjectInfoPanel
              form={projectForm}
              parseStatus={parseStatus}
              onChange={onProjectFormChange}
            />
          )}
          {currentStep === '范本选择' && (
            <TemplatePanel selectedId={selectedTemplateId} onSelect={onTemplateSelect} />
          )}
        </div>
      </div>

      {currentStep === '项目信息' && (
        <SidebarFooter showNext nextDisabled={parseStatus !== 'done'} onNext={onProjectNext} />
      )}

      {currentStep === '范本选择' && (
        <SidebarFooter
          showBack
          showGenerate={!documentGenerated}
          showRegenerateActions={documentGenerated}
          generating={generating}
          updatingSupplement={updatingSupplement}
          onBack={onTemplateBack}
          onGenerate={onGenerate}
          onRegenerate={onRegenerate}
          onUpdateSupplement={onUpdateSupplement}
        />
      )}
    </aside>
  );
}
