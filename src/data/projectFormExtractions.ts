import { PROJECT_TITLE } from '../constants/documentPrep';
import type { ProjectUploadSectionId } from '../constants/projectUploadSections';
import type { ProjectForm } from '../types/documentWorkflow';

const projectBaseName = PROJECT_TITLE.replace(/招标文件$/, '').trim();

/** 演示：各材料类型上传后 AI 抽提的字段（正式环境由解析服务返回） */
export const PROJECT_FORM_EXTRACTIONS: Record<
  ProjectUploadSectionId,
  Partial<ProjectForm>
> = {
  earlyApproval: {
    industryType: '电力、热力、燃气及水生产和供应业',
    professionalType: '风力发电设备采购',
    bidEvaluationMethod: '综合评估法',
    projectName: projectBaseName,
    projectLegalEntity: '张掖市平山湖风力发电有限公司',
    approvalDocNo: '甘发改能源〔2024〕128号',
    approvalAuthority: '甘肃省发展和改革委员会',
    constructionLocation: '甘肃省张掖市甘州区平山湖蒙古族乡',
    constructionScaleAndContent:
      '装机规模 200MW，安装 40 台 5MW 风力发电机组及配套升压站、集电线路等；建设周期含设备供货、安装调试及并网验收。',
    totalInvestmentEstimate: '约 12.8 亿元',
    totalBudgetEstimate: '12.65 亿元',
    maxBidPriceOrControlPrice: '以立项批复及招标控制价文件为准',
    fundSource: '企业自筹 100%',
    constructionPeriod: '18 个月',
    biddingMethod: '公开招标',
    tenderOrganizationalForm: '委托招标',
  },
  tenderEntity: {
    enterTradingCenter: '是',
    lotContractingType: '设计采购施工总承包（EPC）',
    entrustedProjectName: projectBaseName,
    biddingMethod: '公开招标',
    tenderOrganizationalForm: '委托招标',
    qualificationReviewMethod: '资格后审',
    tendererName: '张掖市平山湖风力发电有限公司',
    agencyName: '甘肃XX工程咨询招标有限公司',
    tendererContact: '王工',
    tendererContactInfo: '0936-8880123',
    agencyContact: '李经理',
    agencyContactInfo: '13800001234',
  },
  other: {
    specialTenderRequirements:
      '投标人须具备风力发电设备供货及安装业绩；关键部件须满足招标文件技术规范书要求。',
    employerSuppliedMaterialsIntent: '甲供主变及 GIS 设备，暂估价按清单单价执行。',
  },
};
