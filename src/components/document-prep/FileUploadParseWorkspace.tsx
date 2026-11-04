import { useEffect, useRef, useState } from 'react';
import { UploadPanel } from './panels/UploadPanel';
import { ProjectInfoPanel } from './panels/ProjectInfoPanel';
import { TemplatePanel } from './panels/TemplatePanel';
import { SidebarFooter } from './shared/SidebarFooter';
import { parsedProjectForm } from '../../data/parsedProjectInfo';
import type { ParseStatus, ProjectForm, UploadFiles } from '../../types/documentWorkflow';
import { emptyProjectForm } from '../../types/documentWorkflow';
import '../../pages/FileUploadParsePage.css';

const PARSE_DELAY_MS = 1800;

function hasUploadedFiles(files: UploadFiles) {
  return Object.values(files).some((sectionFiles) => sectionFiles.length > 0);
}

type FileUploadParseWorkspaceProps = {
  uploadFiles: UploadFiles;
  onUploadFilesChange: (files: UploadFiles) => void;
  projectForm: ProjectForm;
  onProjectFormChange: (form: ProjectForm) => void;
  selectedTemplateId: string;
  onTemplateSelect: (id: string) => void;
  /** 嵌入编审页时为 true，不预留底栏占位 */
  embedded?: boolean;
  showGenerateFooter?: boolean;
  generating?: boolean;
  onGenerate?: () => void;
  onSave?: () => void;
};

export function FileUploadParseWorkspace({
  uploadFiles,
  onUploadFilesChange,
  projectForm,
  onProjectFormChange,
  selectedTemplateId,
  onTemplateSelect,
  embedded = false,
  showGenerateFooter = false,
  generating = false,
  onGenerate,
  onSave,
}: FileUploadParseWorkspaceProps) {
  const [parseStatus, setParseStatus] = useState<ParseStatus>(() =>
    hasUploadedFiles(uploadFiles) ? 'done' : 'idle',
  );
  const parseTimerRef = useRef<number | null>(null);
  const parsedUploadKeyRef = useRef<string | null>(null);

  const hasFiles = hasUploadedFiles(uploadFiles);
  const uploadFilesKey = JSON.stringify(uploadFiles);

  useEffect(() => {
    if (!hasUploadedFiles(uploadFiles)) {
      if (parseTimerRef.current !== null) {
        window.clearTimeout(parseTimerRef.current);
        parseTimerRef.current = null;
      }
      parsedUploadKeyRef.current = null;
      setParseStatus('idle');
      onProjectFormChange(emptyProjectForm);
      return;
    }

    if (uploadFilesKey === parsedUploadKeyRef.current) {
      return;
    }

    const isFirstSeen = parsedUploadKeyRef.current === null;
    parsedUploadKeyRef.current = uploadFilesKey;

    if (embedded && isFirstSeen && projectForm.projectName.trim()) {
      setParseStatus('done');
      return;
    }

    if (parseTimerRef.current !== null) {
      window.clearTimeout(parseTimerRef.current);
      parseTimerRef.current = null;
    }

    setParseStatus('parsing');
    onProjectFormChange(emptyProjectForm);

    parseTimerRef.current = window.setTimeout(() => {
      onProjectFormChange(parsedProjectForm);
      setParseStatus('done');
      parseTimerRef.current = null;
    }, PARSE_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅随上传文件变化触发解析
  }, [uploadFilesKey, embedded, uploadFiles]);

  useEffect(
    () => () => {
      if (parseTimerRef.current !== null) {
        window.clearTimeout(parseTimerRef.current);
      }
    },
    [],
  );

  const bodyClass = [
    'file-upload-parse-page__body',
    embedded ? 'file-upload-parse-page__body--embedded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={bodyClass}>
        <section className="file-upload-parse-page__upload" aria-label="文件上传">
          <h2 className="file-upload-parse-page__panel-title">文件上传</h2>
          <div className="doc-prep-sidebar__panel file-upload-parse-page__upload-panel">
            <UploadPanel files={uploadFiles} onFilesChange={onUploadFilesChange} />
          </div>
        </section>
        <section className="file-upload-parse-page__project" aria-label="项目信息">
          <h2 className="file-upload-parse-page__panel-title">项目信息</h2>
          <div className="file-upload-parse-page__project-body">
            <ProjectInfoPanel form={projectForm} parseStatus={parseStatus} onChange={onProjectFormChange} />
          </div>
        </section>
        <section className="file-upload-parse-page__template" aria-label="范本选择">
          <h2 className="file-upload-parse-page__panel-title">范本选择</h2>
          <div className="doc-prep-sidebar__panel file-upload-parse-page__template-panel">
            <TemplatePanel selectedId={selectedTemplateId} onSelect={onTemplateSelect} />
          </div>
        </section>
      </div>

      {showGenerateFooter && (
        <footer
          className={[
            'file-upload-parse-page__footer',
            embedded ? 'file-upload-parse-page__footer--embedded' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <SidebarFooter
            showSave={Boolean(onSave)}
            showGenerate
            generating={generating}
            generateDisabled={!hasFiles || parseStatus !== 'done'}
            onSave={onSave}
            onGenerate={onGenerate}
          />
        </footer>
      )}
    </>
  );
}
