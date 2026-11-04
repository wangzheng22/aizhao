import { useCallback, useEffect, useRef, useState } from 'react';
import { DocPrepHeader, type HeaderNotice } from '../components/document-prep/DocPrepHeader';
import { DocPrepProgressBar } from '../components/document-prep/DocPrepProgressBar';
import { FileUploadParseWorkspace } from '../components/document-prep/FileUploadParseWorkspace';
import { DocPrepPreview } from '../components/document-prep/DocPrepPreview';
import { useDocPrepProgress } from '../hooks/useDocPrepProgress';
import type { DocumentPreparationEntry, ProjectForm, UploadFiles } from '../types/documentWorkflow';
import './DocumentPreparationPage.css';
import './FileUploadParsePage.css';

const GENERATE_DELAY_MS = 2000;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** e.g. 2026.10.16 10:29:23 */
function formatNoticeTime(date = new Date()) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

type DocumentPreparationPageProps = {
  entry: DocumentPreparationEntry;
  onBackToList?: () => void;
};

export function DocumentPreparationPage({ entry, onBackToList }: DocumentPreparationPageProps) {
  const [projectInfoViewOpen, setProjectInfoViewOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFiles>(entry.uploadFiles);
  const [projectForm, setProjectForm] = useState<ProjectForm>(entry.projectForm);
  const [projectInfoDraft, setProjectInfoDraft] = useState<ProjectForm>(entry.projectForm);
  const [uploadFilesDraft, setUploadFilesDraft] = useState<UploadFiles>(entry.uploadFiles);
  const [selectedTemplateId, setSelectedTemplateId] = useState(entry.selectedTemplateId ?? 'rec-1');
  const [selectedTemplateDraft, setSelectedTemplateDraft] = useState(entry.selectedTemplateId ?? 'rec-1');
  const [documentGenerated, setDocumentGenerated] = useState(
    Boolean(entry.openWithDocumentReady),
  );
  const [generating, setGenerating] = useState(false);
  const [headerNotice, setHeaderNotice] = useState<HeaderNotice>(null);
  const noticeIdRef = useRef(0);

  const {
    progress: reviewProgress,
    active: reviewProgressActive,
    visible: reviewProgressVisible,
    showProgressBar,
    runProgress: runReviewProgress,
  } = useDocPrepProgress();

  const headerTitle = documentGenerated
    ? `${projectForm.projectName.trim() || '未命名'}招标文件`
    : '未命名';

  const pushNotice = useCallback((text: string) => {
    noticeIdRef.current += 1;
    setHeaderNotice({ id: noticeIdRef.current, text });
  }, []);

  const finishGenerate = useCallback(() => {
    setGenerating(false);
    setDocumentGenerated(true);
    setProjectInfoViewOpen(false);
    pushNotice(`招标文件已生成 ${formatNoticeTime()}`);
  }, [pushNotice]);

  const handleToggleProjectInfo = useCallback(() => {
    setProjectInfoViewOpen((open) => {
      if (open) return false;
      setProjectInfoDraft(projectForm);
      setUploadFilesDraft(uploadFiles);
      setSelectedTemplateDraft(selectedTemplateId);
      return true;
    });
  }, [projectForm, selectedTemplateId, uploadFiles]);

  const handleSaveProjectInfo = useCallback(() => {
    setProjectForm(projectInfoDraft);
    setUploadFiles(uploadFilesDraft);
    setSelectedTemplateId(selectedTemplateDraft);
    setProjectInfoViewOpen(false);
    pushNotice(`项目信息已保存 ${formatNoticeTime()}`);
  }, [projectInfoDraft, selectedTemplateDraft, uploadFilesDraft, pushNotice]);

  const handleGenerateFromProjectInfo = useCallback(() => {
    if (generating) return;

    setProjectForm(projectInfoDraft);
    setUploadFiles(uploadFilesDraft);
    setSelectedTemplateId(selectedTemplateDraft);
    setProjectInfoViewOpen(false);
    setGenerating(true);
    pushNotice(documentGenerated ? '正在重新生成招标文件…' : '正在生成招标文件…');
    runReviewProgress(GENERATE_DELAY_MS);

    window.setTimeout(() => {
      finishGenerate();
    }, GENERATE_DELAY_MS);
  }, [
    documentGenerated,
    generating,
    finishGenerate,
    projectInfoDraft,
    selectedTemplateDraft,
    uploadFilesDraft,
    pushNotice,
    runReviewProgress,
  ]);

  const handleExport = useCallback(() => {
    pushNotice(`最近导出${formatNoticeTime()}`);
  }, [pushNotice]);

  useEffect(() => {
    if (!entry.autoGenerate) return;

    setGenerating(true);
    pushNotice('正在生成招标文件…');
    runReviewProgress(GENERATE_DELAY_MS);

    const timerId = window.setTimeout(finishGenerate, GENERATE_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, [entry.autoGenerate, finishGenerate, pushNotice, runReviewProgress]);

  return (
    <div className={`doc-prep-page${showProgressBar ? ' doc-prep-page--with-progress' : ''}`}>
      <DocPrepHeader
        title={headerTitle}
        notice={headerNotice}
        projectInfoOpen={projectInfoViewOpen}
        showReReview={false}
        showSave={false}
        showTraceReport={false}
        onToggleProjectInfo={handleToggleProjectInfo}
        onExport={handleExport}
        onBackToList={onBackToList}
      />

      {!projectInfoViewOpen && (
        <DocPrepProgressBar
          progress={reviewProgress}
          active={reviewProgressActive}
          visible={reviewProgressVisible}
          placement="fixed"
          ariaLabel="生成招标文件进度"
        />
      )}

      <div
        className={[
          'doc-prep-page__body',
          projectInfoViewOpen ? 'doc-prep-page__body--project-info' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {projectInfoViewOpen ? (
          <div className="doc-prep-page__project-info-shell">
            <FileUploadParseWorkspace
              embedded
              uploadFiles={uploadFilesDraft}
              onUploadFilesChange={setUploadFilesDraft}
              projectForm={projectInfoDraft}
              onProjectFormChange={setProjectInfoDraft}
              selectedTemplateId={selectedTemplateDraft}
              onTemplateSelect={setSelectedTemplateDraft}
              showGenerateFooter
              generating={generating}
              onSave={handleSaveProjectInfo}
              onGenerate={handleGenerateFromProjectInfo}
            />
          </div>
        ) : (
          <DocPrepPreview
            documentGenerated={documentGenerated}
            generating={generating}
            sidebarOpen={false}
            uploadFiles={uploadFiles}
            projectName={projectForm.projectName}
            onNotice={pushNotice}
          />
        )}
      </div>
    </div>
  );
}
