import type { WizardStep } from '../../constants/documentPrep';
import { wizardSteps } from '../../constants/documentPrep';
import type { ParseStatus, ProjectForm, UploadFiles } from '../../types/documentWorkflow';
import { UploadPanel } from './panels/UploadPanel';
import { ProjectInfoPanel } from './panels/ProjectInfoPanel';
import { TemplatePanel } from './panels/TemplatePanel';
import { SidebarFooter } from './shared/SidebarFooter';
import './DocPrepSidebar.css';

type DocPrepSidebarProps = {
  open: boolean;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onTabClick: (tab: WizardStep) => void;
  uploadFiles: UploadFiles;
  onUploadFilesChange: (files: UploadFiles) => void;
  projectForm: ProjectForm;
  parseStatus: ParseStatus;
  onProjectFormChange: (form: ProjectForm) => void;
  selectedTemplateId: string;
  onTemplateSelect: (id: string) => void;
  generating: boolean;
  updatingSupplement: boolean;
  documentGenerated: boolean;
  onUploadNext: () => void;
  onProjectBack: () => void;
  onProjectNext: () => void;
  onTemplateBack: () => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onUpdateSupplement: () => void;
};

function hasUploadedFiles(files: UploadFiles) {
  return Object.values(files).some((sectionFiles) => sectionFiles.length > 0);
}

export function DocPrepSidebar({
  open,
  currentStep,
  completedSteps,
  onTabClick,
  uploadFiles,
  onUploadFilesChange,
  projectForm,
  parseStatus,
  onProjectFormChange,
  selectedTemplateId,
  onTemplateSelect,
  generating,
  updatingSupplement,
  documentGenerated,
  onUploadNext,
  onProjectBack,
  onProjectNext,
  onTemplateBack,
  onGenerate,
  onRegenerate,
  onUpdateSupplement,
}: DocPrepSidebarProps) {
  const hasFiles = hasUploadedFiles(uploadFiles);
  const currentIndex = wizardSteps.indexOf(currentStep);

  const isTabEnabled = (tab: WizardStep) => {
    const tabIndex = wizardSteps.indexOf(tab);
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
          {wizardSteps.map((tab) => {
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
          {currentStep === '文件上传' && (
            <UploadPanel files={uploadFiles} onFilesChange={onUploadFilesChange} />
          )}
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

      {currentStep === '文件上传' && (
        <SidebarFooter
          showNext
          nextLabel="下一步"
          nextDisabled={!hasFiles}
          onNext={onUploadNext}
        />
      )}

      {currentStep === '项目信息' && (
        <SidebarFooter
          showBack
          showNext
          nextDisabled={parseStatus !== 'done'}
          onBack={onProjectBack}
          onNext={onProjectNext}
        />
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
