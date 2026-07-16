export const wizardSteps = ['文件上传', '项目信息', '范本选择'] as const;
export type WizardStep = (typeof wizardSteps)[number];

/** @deprecated Use WizardStep */
export type PanelTab = WizardStep;

export const PROJECT_TITLE =
  '甘肃华电甘州平山湖10万千瓦风电项目风力发电机组采购招标文件';
