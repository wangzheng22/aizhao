import { PROJECT_TITLE } from '../constants/documentPrep';
import type { ProjectForm } from '../types/documentWorkflow';

export const parsedProjectForm: ProjectForm = {
  projectName: PROJECT_TITLE.replace('招标文件', ''),
  industryType: '电力、热力、燃气及水生产和供应业',
  professionalType: '风力发电设备采购',
  fundSourceAndRatio: '企业自筹 100%',
  biddingMethod: '公开招标',
  constructionLocation: '甘肃省张掖市甘州区平山湖蒙古族乡',
  tenderControlPrice: '以立项批复及招标控制价文件为准',
  bidEvaluationMethod: '综合评估法',
  qualificationReviewMethod: '资格后审',
};
