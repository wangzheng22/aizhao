import { useEffect, useRef } from 'react';
import { scrollSectionIntoContainer } from '../../../utils/scrollSectionIntoContainer';
import {
  PROJECT_UPLOAD_SECTIONS,
  type ProjectUploadSectionId,
} from '../../../constants/projectUploadSections';
import type { SectionParseStatusMap, UploadFiles } from '../../../types/documentWorkflow';
import { SidebarTip } from '../shared/SidebarTip';
import '../DocPrepSidebar.css';

type UploadPanelProps = {
  files: UploadFiles;
  onFilesChange: (files: UploadFiles) => void;
  linkedSectionId?: ProjectUploadSectionId | null;
  sectionParseStatus?: SectionParseStatusMap;
  anchorSectionId?: ProjectUploadSectionId | null;
  onSectionHover?: (sectionId: ProjectUploadSectionId | null, source?: 'upload' | 'form') => void;
};

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#3671ff" strokeWidth="1.2" />
      <path d="M9 2v3h3" stroke="#3671ff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      className="doc-prep-sidebar__file-delete-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.25,1.75 C11.8022847,1.75 12.25,2.19771525 12.25,2.75 L12.25,3.9765625 L13.6875,3.9765625 C13.9981602,3.9765625 14.25,4.22840233 14.25,4.5390625 C14.25,4.84972267 13.9981602,5.1015625 13.6875,5.1015625 L13.4193906,5.1015625 L12.8178311,13.3229756 C12.7795939,13.8455502 12.344469,14.25 11.8204973,14.25 L4.179568,14.25 C3.65559905,14.25 3.2204754,13.8455542 3.18223479,13.3229826 L2.58060937,5.1015625 L2.3125,5.1015625 C2.00183983,5.1015625 1.75,4.84972267 1.75,4.5390625 C1.75,4.22840233 2.00183983,3.9765625 2.3125,3.9765625 L3.71875,3.9765625 L3.71875,2.75 C3.71875,2.19771525 4.16646525,1.75 4.71875,1.75 L11.25,1.75 Z M12.2896719,5.125 L3.71032813,5.125 L4.29576562,13.125 L11.7043281,13.125 L12.2896719,5.125 Z M6.375,6.25 C6.65114237,6.25 6.875,6.47385763 6.875,6.75 L6.875,10.75 C6.875,11.0261424 6.65114237,11.25 6.375,11.25 C6.09885763,11.25 5.875,11.0261424 5.875,10.75 L5.875,6.75 C5.875,6.47385763 6.09885763,6.25 6.375,6.25 Z M9.625,6.25 C9.90114237,6.25 10.125,6.47385763 10.125,6.75 L10.125,10.75 C10.125,11.0261424 9.90114237,11.25 9.625,11.25 C9.34885763,11.25 9.125,11.0261424 9.125,10.75 L9.125,6.75 C9.125,6.47385763 9.34885763,6.25 9.625,6.25 Z M11.125,2.875 L4.84375,2.875 L4.84375,3.9765625 L11.125,3.9765625 L11.125,2.875 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UploadCard({
  sectionId,
  title,
  description,
  files,
  linkedSectionId = null,
  isParsing = false,
  onSectionHover,
  onFilesChange,
}: {
  sectionId: ProjectUploadSectionId;
  title: string;
  description: string;
  files: string[];
  linkedSectionId?: ProjectUploadSectionId | null;
  isParsing?: boolean;
  onSectionHover?: (sectionId: ProjectUploadSectionId | null, source?: 'upload' | 'form') => void;
  onFilesChange: (files: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFiles = files.length > 0;

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const names = Array.from(fileList).map((file) => file.name);
    onFilesChange([...files, ...names]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDelete = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const isLinked = linkedSectionId === sectionId;
  const isDimmed = linkedSectionId != null && !isLinked;

  return (
    <div
      className={[
        'doc-prep-sidebar__card',
        hasFiles ? 'doc-prep-sidebar__card--tall' : '',
        isLinked ? 'doc-prep-sidebar__card--linked' : '',
        isDimmed ? 'doc-prep-sidebar__card--dimmed' : '',
        isParsing ? 'doc-prep-sidebar__card--parsing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      id={`upload-section-${sectionId}`}
      data-upload-section={sectionId}
      onMouseEnter={() => onSectionHover?.(sectionId, 'upload')}
      onMouseLeave={() => onSectionHover?.(null)}
    >
      <div className="doc-prep-sidebar__card-head">
        <div className="doc-prep-sidebar__card-info">
          <h3 className="doc-prep-sidebar__card-title">{title}</h3>
          <p className="doc-prep-sidebar__card-desc">{description}</p>
        </div>
        <button
          type="button"
          className="doc-prep-sidebar__upload-btn"
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon />
          上传
        </button>
        <input
          ref={inputRef}
          type="file"
          className="doc-prep-sidebar__input"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {hasFiles && (
        <ul className="doc-prep-sidebar__file-list">
          {files.map((file, index) => (
            <li key={`${file}-${index}`} className="doc-prep-sidebar__file-item">
              <FileIcon />
              <span className="doc-prep-sidebar__file-name">{file}</span>
              <button
                type="button"
                className="doc-prep-sidebar__file-delete"
                aria-label={`删除 ${file}`}
                onClick={() => handleDelete(index)}
              >
                <DeleteIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function UploadPanel({
  files,
  onFilesChange,
  linkedSectionId = null,
  sectionParseStatus,
  anchorSectionId = null,
  onSectionHover,
}: UploadPanelProps) {
  const sectionsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorSectionId || !sectionsScrollRef.current) return;
    const target = sectionsScrollRef.current.querySelector<HTMLElement>(
      `[data-upload-section="${anchorSectionId}"]`,
    );
    if (!target) return;
    scrollSectionIntoContainer(sectionsScrollRef.current, target);
  }, [anchorSectionId]);

  const updateSectionFiles = (sectionId: string, sectionFiles: string[]) => {
    onFilesChange({ ...files, [sectionId]: sectionFiles });
  };

  return (
    <>
      <SidebarTip
        className="doc-prep-sidebar__tip--upload"
        lines={[
          '按一、二、三类材料上传文件；行业、评标办法等「通用」字段将从已上传材料中自动汇总至右侧。',
        ]}
      />

      <div ref={sectionsScrollRef} className="doc-prep-sidebar__sections">
        {PROJECT_UPLOAD_SECTIONS.map((section) => (
          <UploadCard
            key={section.id}
            sectionId={section.id}
            title={section.title}
            description={section.description}
            files={files[section.id] ?? []}
            linkedSectionId={linkedSectionId}
            isParsing={sectionParseStatus?.[section.id] === 'parsing'}
            onSectionHover={onSectionHover}
            onFilesChange={(sectionFiles) => updateSectionFiles(section.id, sectionFiles)}
          />
        ))}
      </div>
    </>
  );
}
