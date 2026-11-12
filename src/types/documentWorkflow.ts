export type ReviewWizardStep = '项目信息' | '范本选择';

/** @deprecated Use ReviewWizardStep */
export type WizardStep = ReviewWizardStep;

export type ParseStatus = 'idle' | 'parsing' | 'done';

export type SectionParseStatus = 'idle' | 'parsing' | 'filling' | 'done';

export type SectionParseStatusMap = {
  earlyApproval: SectionParseStatus;
  tenderEntity: SectionParseStatus;
  other: SectionParseStatus;
};

/** 项目信息页展示字段（与材料类型 → 提取字段表一致） */
export type ProjectForm = {
  // 通用
  industryType: string;
  professionalType: string;
  bidEvaluationMethod: string;
  enterTradingCenter: string;
  lotContractingType: string;
  // 前期立项审批
  projectName: string;
  projectLegalEntity: string;
  approvalDocNo: string;
  approvalAuthority: string;
  constructionLocation: string;
  constructionScaleAndContent: string;
  totalInvestmentEstimate: string;
  totalBudgetEstimate: string;
  maxBidPriceOrControlPrice: string;
  fundSource: string;
  constructionPeriod: string;
  biddingMethod: string;
  tenderOrganizationalForm: string;
  // 招标主体与组织
  entrustedProjectName: string;
  qualificationReviewMethod: string;
  tendererName: string;
  agencyName: string;
  tendererContact: string;
  tendererContactInfo: string;
  agencyContact: string;
  agencyContactInfo: string;
  // 其他
  specialTenderRequirements: string;
  employerSuppliedMaterialsIntent: string;
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
  industryType: '',
  professionalType: '',
  bidEvaluationMethod: '',
  enterTradingCenter: '',
  lotContractingType: '',
  projectName: '',
  projectLegalEntity: '',
  approvalDocNo: '',
  approvalAuthority: '',
  constructionLocation: '',
  constructionScaleAndContent: '',
  totalInvestmentEstimate: '',
  totalBudgetEstimate: '',
  maxBidPriceOrControlPrice: '',
  fundSource: '',
  constructionPeriod: '',
  biddingMethod: '',
  tenderOrganizationalForm: '',
  entrustedProjectName: '',
  qualificationReviewMethod: '',
  tendererName: '',
  agencyName: '',
  tendererContact: '',
  tendererContactInfo: '',
  agencyContact: '',
  agencyContactInfo: '',
  specialTenderRequirements: '',
  employerSuppliedMaterialsIntent: '',
};
