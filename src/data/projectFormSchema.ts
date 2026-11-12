import type { ProjectUploadSectionId } from '../constants/projectUploadSections';
import type { ProjectForm } from '../types/documentWorkflow';

export type ProjectFormFieldKey = keyof ProjectForm;

/** 右侧项目信息分区（含无上传入口的「通用」） */
export type ProjectFormSectionId = 'general' | ProjectUploadSectionId;

export type ProjectFormFieldDef = {
  key: ProjectFormFieldKey;
  label: string;
  required?: boolean;
  layout?: 'default' | 'full' | 'span2';
  multiline?: boolean;
};

export type ProjectFormSectionDef = {
  id: ProjectFormSectionId;
  title: string;
  fields: ProjectFormFieldDef[];
};

/** 右侧项目信息表单分区（与提取字段表一致） */
export const PROJECT_FORM_SECTIONS: ProjectFormSectionDef[] = [
  {
    id: 'general',
    title: '通用',
    fields: [
      { key: 'industryType', label: '行业类型', required: true },
      { key: 'professionalType', label: '专业类型', required: true },
      { key: 'bidEvaluationMethod', label: '评标办法', required: true },
      { key: 'enterTradingCenter', label: '是否进场' },
      { key: 'lotContractingType', label: '标段级发包类型' },
    ],
  },
  {
    id: 'earlyApproval',
    title: '前期立项审批',
    fields: [
      { key: 'projectName', label: '项目名称', required: true, layout: 'full' },
      { key: 'projectLegalEntity', label: '项目法人/建设单位', layout: 'span2' },
      { key: 'approvalDocNo', label: '批复文号' },
      { key: 'approvalAuthority', label: '批复机关' },
      { key: 'constructionLocation', label: '建设地点', layout: 'span2' },
      {
        key: 'constructionScaleAndContent',
        label: '建设规模及内容',
        layout: 'full',
        multiline: true,
      },
      { key: 'totalInvestmentEstimate', label: '总投资估算' },
      { key: 'totalBudgetEstimate', label: '概算总投资' },
      { key: 'maxBidPriceOrControlPrice', label: '最高投标限价/招标控制价', layout: 'span2' },
      { key: 'fundSource', label: '资金来源' },
      { key: 'constructionPeriod', label: '建设工期' },
      { key: 'biddingMethod', label: '招标方式', required: true },
      { key: 'tenderOrganizationalForm', label: '招标组织形式' },
    ],
  },
  {
    id: 'tenderEntity',
    title: '招标主体与组织',
    fields: [
      { key: 'entrustedProjectName', label: '委托项目名称', layout: 'full' },
      { key: 'qualificationReviewMethod', label: '资格审查方式', required: true },
      { key: 'tendererName', label: '招标人名称', layout: 'span2' },
      { key: 'agencyName', label: '代理机构名称', layout: 'span2' },
      { key: 'tendererContact', label: '招标人联系人' },
      { key: 'tendererContactInfo', label: '招标人联系方式' },
      { key: 'agencyContact', label: '招标代理联系人' },
      { key: 'agencyContactInfo', label: '招标代理联系方式' },
    ],
  },
  {
    id: 'other',
    title: '其他',
    fields: [
      {
        key: 'specialTenderRequirements',
        label: '招标特殊要求',
        layout: 'full',
        multiline: true,
      },
      {
        key: 'employerSuppliedMaterialsIntent',
        label: '甲供材料及暂估价意向',
        layout: 'full',
        multiline: true,
      },
    ],
  },
];
