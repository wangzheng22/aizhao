import type { ProjectListItem } from '../types/projectList';
import type { DocumentPreparationEntry, ProjectForm } from '../types/documentWorkflow';
import { emptyProjectForm } from '../types/documentWorkflow';

export function projectListItemToForm(item: ProjectListItem): ProjectForm {
  return {
    ...emptyProjectForm,
    projectName: item.projectName,
    industryType: item.industryType,
    professionalType: item.specialtyType,
    biddingMethod: item.bidMethod,
    qualificationReviewMethod: item.qualificationReview,
  };
}

export function buildEntryFromProjectListItem(item: ProjectListItem): DocumentPreparationEntry {
  return {
    projectForm: projectListItemToForm(item),
    uploadFiles: {},
    selectedTemplateId: 'rec-1',
    autoGenerate: false,
    openWithDocumentReady: Boolean(item.hasGeneratedDocument),
  };
}
