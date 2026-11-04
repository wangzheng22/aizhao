import { useCallback, useState } from 'react';
import { FileUploadParseWorkspace } from '../components/document-prep/FileUploadParseWorkspace';
import { DocPrepHeader, type HeaderNotice } from '../components/document-prep/DocPrepHeader';
import type { DocumentPreparationEntry, ProjectForm, UploadFiles } from '../types/documentWorkflow';
import { emptyProjectForm } from '../types/documentWorkflow';
import './DocumentPreparationPage.css';
import './FileUploadParsePage.css';

type FileUploadParsePageProps = {
  onGenerateDocument: (entry: DocumentPreparationEntry) => void;
  initialProjectForm?: ProjectForm;
  headerTitle?: string;
  onBackToList?: () => void;
};

export function FileUploadParsePage({
  onGenerateDocument,
  initialProjectForm,
  headerTitle,
  onBackToList,
}: FileUploadParsePageProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFiles>({});
  const [projectForm, setProjectForm] = useState<ProjectForm>(
    initialProjectForm ?? emptyProjectForm,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState('rec-1');
  const [headerNotice, setHeaderNotice] = useState<HeaderNotice>(null);

  const handleSave = useCallback(() => {
    setHeaderNotice({ id: Date.now(), text: '已保存' });
  }, []);

  const handleGenerate = useCallback(() => {
    onGenerateDocument({
      projectForm,
      uploadFiles,
      selectedTemplateId,
      autoGenerate: true,
    });
  }, [onGenerateDocument, projectForm, selectedTemplateId, uploadFiles]);

  return (
    <div className="file-upload-parse-page">
      <DocPrepHeader
        title={headerTitle?.trim() || projectForm.projectName.trim() || '未命名'}
        notice={headerNotice}
        onBackToList={onBackToList}
        projectInfoOpen={false}
        showProjectInfoToggle={false}
        showReReview={false}
        showSave={false}
        showTraceReport={false}
        onToggleProjectInfo={() => {}}
        versionLabel="V1.0.0 版本"
        exportEnabled={false}
        onExport={() => setHeaderNotice({ id: Date.now(), text: '已导出' })}
      />

      <FileUploadParseWorkspace
        uploadFiles={uploadFiles}
        onUploadFilesChange={setUploadFiles}
        projectForm={projectForm}
        onProjectFormChange={setProjectForm}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={setSelectedTemplateId}
        showGenerateFooter
        onSave={handleSave}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
