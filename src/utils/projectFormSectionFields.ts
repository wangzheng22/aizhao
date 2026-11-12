import type { ProjectUploadSectionId } from '../constants/projectUploadSections';
import {
  PROJECT_FORM_SECTIONS,
  type ProjectFormFieldKey,
} from '../data/projectFormSchema';
import { PROJECT_FORM_EXTRACTIONS } from '../data/projectFormExtractions';
import type { ProjectForm } from '../types/documentWorkflow';

/** 右侧「通用」汇总字段 */
export const GENERAL_FORM_FIELD_KEYS: ProjectFormFieldKey[] = [
  'industryType',
  'professionalType',
  'bidEvaluationMethod',
  'enterTradingCenter',
  'lotContractingType',
];

/** 各上传分区抽提写入「通用」的字段（从一、二、三类材料汇总） */
export const GENERAL_FIELDS_BY_UPLOAD_SECTION: Record<
  ProjectUploadSectionId,
  ProjectFormFieldKey[]
> = {
  earlyApproval: ['industryType', 'professionalType', 'bidEvaluationMethod'],
  tenderEntity: ['enterTradingCenter', 'lotContractingType'],
  other: [],
};

export function isGeneralFormFieldKey(key: ProjectFormFieldKey): boolean {
  return GENERAL_FORM_FIELD_KEYS.includes(key);
}

export function getFormFieldsClearedOnUploadRemove(
  sectionId: ProjectUploadSectionId,
): ProjectFormFieldKey[] {
  const section = PROJECT_FORM_SECTIONS.find((item) => item.id === sectionId);
  const owned = section?.fields.map((field) => field.key) ?? [];
  const general = GENERAL_FIELDS_BY_UPLOAD_SECTION[sectionId] ?? [];
  return [...general, ...owned];
}

export function clearSectionFormFields(
  form: ProjectForm,
  sectionId: ProjectUploadSectionId,
): ProjectForm {
  const next = { ...form };
  getFormFieldsClearedOnUploadRemove(sectionId).forEach((key) => {
    next[key] = '';
  });
  return next;
}

export function applySectionExtraction(
  form: ProjectForm,
  sectionId: ProjectUploadSectionId,
): ProjectForm {
  return { ...form, ...PROJECT_FORM_EXTRACTIONS[sectionId] };
}
