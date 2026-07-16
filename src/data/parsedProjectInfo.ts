import { PROJECT_TITLE } from '../constants/documentPrep';
import type { ProjectForm } from '../types/documentWorkflow';

export const parsedProjectForm: ProjectForm = {
  projectCode: 'HD-GZ-PSH-2024-001',
  projectName: PROJECT_TITLE.replace('招标文件', ''),
  projectRequirement: '采购10万千瓦风电项目风力发电机组，包含设备供货、安装调试及质保服务。',
  region: '甘肃省张掖市',
  isEntry: 'yes',
  projectType: '货物采购',
  biddingMethod: '公开招标',
  bidOpenTime: '2024-07-15 09:00',
  bidder: '甘肃华电甘州新能源有限公司',
  biddingUnit: '甘肃华电甘州新能源有限公司招标采购部',
  contact: '0936-8888888',
  address: '甘肃省张掖市甘州区平山湖蒙古族乡',
};
