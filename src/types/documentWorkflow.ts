export type ReviewWizardStep = '项目信息' | '范本选择';

/** @deprecated Use ReviewWizardStep */
export type WizardStep = ReviewWizardStep;

export type ParseStatus = 'idle' | 'parsing' | 'done';

/** 项目信息页展示字段（与产品字段表「是否展示=是」一致） */
export type ProjectForm = {
  projectName: string;
  industryType: string;
  professionalType: string;
  fundSourceAndRatio: string;
  biddingMethod: string;
  constructionLocation: string;
  tenderControlPrice: string;
  bidEvaluationMethod: string;
  qualificationReviewMethod: string;
};

export type UploadFiles = Record<string, string[]>;

export type DocumentPreparationEntry = {
  projectForm: ProjectForm;
  uploadFiles: UploadFiles;
  selectedTemplateId?: string;
  autoGenerate?: boolean;
  /** 进入编制页时直接展示已生成的招标文件（跳过生成动效） */
  openWithDocumentReady?: boolean;
};

export const emptyProjectForm: ProjectForm = {
  projectName: '',
  industryType: '',
  professionalType: '',
  fundSourceAndRatio: '',
  biddingMethod: '',
  constructionLocation: '',
  tenderControlPrice: '',
  bidEvaluationMethod: '',
  qualificationReviewMethod: '',
};
