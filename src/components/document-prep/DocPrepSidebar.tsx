import type { WizardStep } from '../../constants/documentPrep';
import type { ParseStatus, ProjectForm, UploadFiles } from '../../types/documentWorkflow';
import { UploadPanel } from './panels/UploadPanel';
import { ProjectInfoPanel } from './panels/ProjectInfoPanel';
import { TemplatePanel } from './panels/TemplatePanel';
import { SidebarFooter } from './shared/SidebarFooter';
import './DocPrepSidebar.css';

type DocPrepSidebarProps = {
  open: boolean;
  currentStep: WizardStep;
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

  return (
    <aside
      className={`doc-prep-sidebar ${open ? 'doc-prep-sidebar--open' : 'doc-prep-sidebar--collapsed'}`}
      aria-label="左侧面板"
      aria-hidden={!open}
    >
      <div className="doc-prep-sidebar__content">
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
