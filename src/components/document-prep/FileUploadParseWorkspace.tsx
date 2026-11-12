import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  PROJECT_UPLOAD_SECTION_ORDER,
  type ProjectUploadSectionId,
} from '../../constants/projectUploadSections';
import type { ProjectFormSectionId } from '../../data/projectFormSchema';
import { useSectionUploadParsing } from '../../hooks/useSectionUploadParsing';
import { RECOMMENDED_PROJECT_TEMPLATE } from '../../data/projectTemplates';
import { UploadPanel } from './panels/UploadPanel';
import { ProjectInfoPanel } from './panels/ProjectInfoPanel';
import { ProjectInfoNextStepBar } from './ProjectInfoNextStepBar';
import type { ProjectForm, UploadFiles } from '../../types/documentWorkflow';
import { computeProjectInfoCompleteness } from '../../utils/projectFormCompletion';
import './shared/SidebarFooter.css';
import '../../pages/FileUploadParsePage.css';

const SECTION_LINK_CLEAR_MS = 140;

function hasUploadedFiles(files: UploadFiles) {
  return Object.values(files).some((sectionFiles) => sectionFiles.length > 0);
}

type FileUploadParseWorkspaceProps = {
  uploadFiles: UploadFiles;
  onUploadFilesChange: (files: UploadFiles) => void;
  projectForm: ProjectForm;
  onProjectFormChange: Dispatch<SetStateAction<ProjectForm>>;
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
}: FileUploadParseWorkspaceProps) {
  const { sectionParseStatus, parseStatus, generateReady, typingField } = useSectionUploadParsing(
    uploadFiles,
    projectForm,
    onProjectFormChange,
    { embedded },
  );

  const [linkedSectionId, setLinkedSectionId] = useState<ProjectUploadSectionId | null>(null);
  const [projectAnchorSectionId, setProjectAnchorSectionId] =
    useState<ProjectFormSectionId | null>(null);
  const [uploadAnchorSectionId, setUploadAnchorSectionId] =
    useState<ProjectUploadSectionId | null>(null);
  const sectionLinkTimerRef = useRef<number | null>(null);
  const autoTemplateAppliedRef = useRef(false);

  const handleSectionHover = useCallback(
    (sectionId: ProjectUploadSectionId | null, source?: 'upload' | 'form') => {
      if (sectionLinkTimerRef.current !== null) {
        window.clearTimeout(sectionLinkTimerRef.current);
        sectionLinkTimerRef.current = null;
      }
      if (sectionId) {
        setLinkedSectionId(sectionId);
        if (source === 'upload') {
          setProjectAnchorSectionId(sectionId);
        }
        if (source === 'form') {
          setUploadAnchorSectionId(sectionId);
        }
        return;
      }
      sectionLinkTimerRef.current = window.setTimeout(() => {
        setLinkedSectionId(null);
        sectionLinkTimerRef.current = null;
      }, SECTION_LINK_CLEAR_MS);
    },
    [],
  );

  const hasFiles = hasUploadedFiles(uploadFiles);
  const showNextStepBar = showGenerateFooter && hasFiles;
  const projectInfoCompleteness = useMemo(
    () => computeProjectInfoCompleteness(projectForm, uploadFiles),
    [projectForm, uploadFiles],
  );

  useEffect(() => {
    if (!hasFiles) {
      autoTemplateAppliedRef.current = false;
      return;
    }
    if (!autoTemplateAppliedRef.current) {
      autoTemplateAppliedRef.current = true;
      onTemplateSelect(RECOMMENDED_PROJECT_TEMPLATE.id);
    }
  }, [hasFiles, onTemplateSelect]);

  useEffect(() => {
    const parsingSection = PROJECT_UPLOAD_SECTION_ORDER.find(
      (sectionId) => sectionParseStatus[sectionId] === 'parsing',
    );
    if (parsingSection) {
      setProjectAnchorSectionId(parsingSection);
      setLinkedSectionId(parsingSection);
    }
  }, [sectionParseStatus]);

  useEffect(
    () => () => {
      if (sectionLinkTimerRef.current !== null) {
        window.clearTimeout(sectionLinkTimerRef.current);
      }
    },
    [],
  );

  const bodyClass = [
    'file-upload-parse-page__body',
    embedded ? 'file-upload-parse-page__body--embedded' : '',
    showNextStepBar ? 'file-upload-parse-page__body--with-next-bar' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={bodyClass}>
        <section className="file-upload-parse-page__upload" aria-label="文件上传">
          <h2 className="file-upload-parse-page__panel-title">文件上传</h2>
          <div className="doc-prep-sidebar__panel file-upload-parse-page__upload-panel">
            <UploadPanel
              files={uploadFiles}
              onFilesChange={onUploadFilesChange}
              linkedSectionId={linkedSectionId}
              sectionParseStatus={sectionParseStatus}
              anchorSectionId={uploadAnchorSectionId}
              onSectionHover={handleSectionHover}
            />
          </div>
        </section>
        <section className="file-upload-parse-page__project" aria-label="项目信息">
          <div className="file-upload-parse-page__panel-head">
            <h2 className="file-upload-parse-page__panel-title">项目信息</h2>
            <span
              className={[
                'file-upload-parse-page__completeness',
                projectInfoCompleteness >= 100
                  ? 'file-upload-parse-page__completeness--complete'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={
                projectInfoCompleteness >= 100
                  ? '信息完整度 100%，已全部识别'
                  : `信息完整度 ${projectInfoCompleteness}%`
              }
            >
              信息完整度 {projectInfoCompleteness}%
              {projectInfoCompleteness >= 100 && (
                <span className="file-upload-parse-page__completeness-check" aria-hidden="true">
                  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      className="file-upload-parse-page__completeness-check-circle"
                      cx="9"
                      cy="9"
                      r="7.25"
                    />
                    <path
                      className="file-upload-parse-page__completeness-check-path"
                      d="M5.25 9.15 7.85 11.75 12.75 6.35"
                    />
                  </svg>
                </span>
              )}
            </span>
          </div>
          <div className="file-upload-parse-page__project-body">
            <ProjectInfoPanel
              form={projectForm}
              parseStatus={parseStatus}
              sectionParseStatus={sectionParseStatus}
              typingField={typingField}
              onChange={onProjectFormChange}
              linkedSectionId={linkedSectionId}
              anchorSectionId={projectAnchorSectionId}
              onSectionHover={handleSectionHover}
            />
          </div>
        </section>
      </div>

      {showGenerateFooter && (
        <footer
          className={[
            'file-upload-parse-page__next-bar',
            showNextStepBar ? 'file-upload-parse-page__next-bar--visible' : '',
            embedded ? 'file-upload-parse-page__next-bar--embedded' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!showNextStepBar}
        >
          <ProjectInfoNextStepBar
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={onTemplateSelect}
            generating={generating}
            generateDisabled={!generateReady}
            onGenerate={onGenerate}
          />
        </footer>
      )}
    </>
  );
}
