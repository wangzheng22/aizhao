import type { ProjectUploadSectionId } from '../constants/projectUploadSections';
import { PROJECT_FORM_EXTRACTIONS } from '../data/projectFormExtractions';
import { PROJECT_FORM_SECTIONS, type ProjectFormFieldKey } from '../data/projectFormSchema';
import type { SectionParseStatusMap, UploadFiles } from '../types/documentWorkflow';
import { emptyProjectForm, type ProjectForm } from '../types/documentWorkflow';
import { GENERAL_FIELDS_BY_UPLOAD_SECTION } from './projectFormSectionFields';

function uploadSectionForGeneralField(key: ProjectFormFieldKey): ProjectUploadSectionId | null {
  for (const [sectionId, keys] of Object.entries(GENERAL_FIELDS_BY_UPLOAD_SECTION)) {
    if (keys.includes(key)) {
      return sectionId as ProjectUploadSectionId;
    }
  }
  return null;
}

/** 项目信息完整度 0–100（不含「其他」分区；抽提打字过程中按字段填充比例递增） */
export function computeProjectInfoCompleteness(
  form: ProjectForm,
  uploadFiles: UploadFiles,
): number {
  let totalWeight = 0;
  let filledWeight = 0;

  for (const section of PROJECT_FORM_SECTIONS) {
    if (section.id === 'other') continue;

    for (const field of section.fields) {
      totalWeight += 1;
      const current = form[field.key];

      const uploadSectionId =
        section.id === 'general'
          ? uploadSectionForGeneralField(field.key)
          : (section.id as ProjectUploadSectionId);

      const sectionHasUpload =
        uploadSectionId != null && (uploadFiles[uploadSectionId]?.length ?? 0) > 0;
      const extraction =
        sectionHasUpload && uploadSectionId
          ? PROJECT_FORM_EXTRACTIONS[uploadSectionId]
          : undefined;
      const expected = (extraction?.[field.key] ?? '').toString();

      if (!sectionHasUpload || !expected) {
        filledWeight += current.trim().length > 0 ? 1 : 0;
        continue;
      }

      if (current.length >= expected.length) {
        filledWeight += 1;
      } else if (current.length > 0) {
        filledWeight += Math.min(1, current.length / expected.length);
      }
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((filledWeight / totalWeight) * 100);
}

/** 中间项目信息「填得差不多」时展示 AI 范本推荐 */
export function shouldShowAiTemplateRecommend(
  form: ProjectForm,
  sectionParseStatus?: SectionParseStatusMap,
): boolean {
  const anySectionDone = sectionParseStatus
    ? Object.values(sectionParseStatus).some((status) => status === 'done')
    : false;
  if (!anySectionDone) return false;

  const keys = Object.keys(emptyProjectForm) as (keyof ProjectForm)[];
  const filledCount = keys.filter((key) => form[key].trim().length > 0).length;
  const ratio = filledCount / keys.length;

  return ratio >= 0.32 || form.projectName.trim().length > 0;
}
