import type { CompletenessIssue } from '../types/completeness';

export const completenessIssues: CompletenessIssue[] = [
  {
    id: 'bid-deadline',
    type: 'missing',
    typeLabel: '内容缺失',
    title: '缺少时间',
    excerpt: '投标截止时间 详见第一章“投标邀请”。',
    searchText: '投标截止时间',
    pageHint: 14,
    suggestion: '补充明确的投标截止时间，或直接填写具体日期。',
    status: 'open',
  },
  {
    id: 'contact-person',
    type: 'missing',
    typeLabel: '内容缺失',
    title: '联系人信息不全',
    excerpt: '联系人：黄州区政府采购中心电话：0713-8880358',
    searchText: '联系人',
    pageHint: 12,
    suggestion: '补充采购代理机构联系人姓名及完整联系方式。',
    status: 'open',
  },
  {
    id: 'contract-refusal',
    type: 'risk',
    typeLabel: '风险提示',
    title: '合同拒签条款',
    excerpt: '无正当理由拒签合同的，给采购人造成损失的，中标人还应当承担民事责任。',
    searchText: '无正当理由拒签合同',
    pageHint: 32,
    suggestion: '已识别，无需修改。',
    status: 'passed',
  },
  {
    id: 'project-name',
    type: 'missing',
    typeLabel: '内容缺失',
    title: '项目名称',
    excerpt: '项目名称： 黄州区档案馆新馆及数字档案馆建设项目',
    searchText: '项目名称',
    pageHint: 1,
    suggestion: '已识别，无需修改。',
    status: 'passed',
  },
  {
    id: 'budget-amount',
    type: 'format',
    typeLabel: '格式问题',
    title: '预算金额',
    excerpt: '预算金额：A 包密集架 96.7595 万元，B 包数字档案馆 152.4450 万元',
    searchText: '预算金额',
    pageHint: 9,
    suggestion: '已识别，无需修改。',
    status: 'passed',
  },
];

export function getCompletenessPercent(issues: CompletenessIssue[]) {
  if (!issues.length) return 100;
  const passed = issues.filter((issue) => issue.status === 'passed').length;
  return Math.round((passed / issues.length) * 100);
}
