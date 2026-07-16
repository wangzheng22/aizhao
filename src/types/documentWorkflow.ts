export type WizardStep = '文件上传' | '项目信息' | '范本选择';

export type ParseStatus = 'idle' | 'parsing' | 'done';

export type ProjectForm = {
  projectCode: string;
  projectName: string;
  projectRequirement: string;
  region: string;
  isEntry: 'yes' | 'no';
  projectType: string;
  biddingMethod: string;
  bidOpenTime: string;
  bidder: string;
  biddingUnit: string;
  contact: string;
  address: string;
};

export type UploadFiles = Record<string, string[]>;

export const emptyProjectForm: ProjectForm = {
  projectCode: '',
  projectName: '',
  projectRequirement: '',
  region: '',
  isEntry: 'yes',
  projectType: '',
  biddingMethod: '',
  bidOpenTime: '',
  bidder: '',
  biddingUnit: '',
  contact: '',
  address: '',
};
