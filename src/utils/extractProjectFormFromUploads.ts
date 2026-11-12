import {
  PROJECT_UPLOAD_SECTION_ORDER,
  type ProjectUploadSectionId,
} from '../constants/projectUploadSections';
import { PROJECT_FORM_EXTRACTIONS } from '../data/projectFormExtractions';
import { emptyProjectForm, type ProjectForm, type UploadFiles } from '../types/documentWorkflow';

function sectionHasFiles(files: UploadFiles, sectionId: ProjectUploadSectionId) {
  return (files[sectionId]?.length ?? 0) > 0;
}

/** 按已上传材料类型合并抽提结果（同名字段后上传分区覆盖先上传分区） */
export function extractProjectFormFromUploads(files: UploadFiles): ProjectForm {
  const merged: ProjectForm = { ...emptyProjectForm };

  PROJECT_UPLOAD_SECTION_ORDER.forEach((sectionId) => {
    if (!sectionHasFiles(files, sectionId)) return;
    Object.assign(merged, PROJECT_FORM_EXTRACTIONS[sectionId]);
  });

  return merged;
}
