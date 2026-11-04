/** 招标文件编审页左侧步骤（不含文件上传） */
export const reviewWizardSteps = ['项目信息', '范本选择'] as const;
export type ReviewWizardStep = (typeof reviewWizardSteps)[number];

/** @deprecated Use ReviewWizardStep */
export const wizardSteps = reviewWizardSteps;
/** @deprecated Use ReviewWizardStep */
export type WizardStep = ReviewWizardStep;

/** @deprecated Use ReviewWizardStep */
export type PanelTab = ReviewWizardStep;

export const PROJECT_TITLE =
  '甘肃华电甘州平山湖10万千瓦风电项目风力发电机组采购招标文件';
