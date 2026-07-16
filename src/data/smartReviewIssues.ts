import type { SmartReviewIssue } from '../types/smartReview';

export const smartReviewIssues: SmartReviewIssue[] = [
  {
    id: 'sr-exclusive',
    type: 'risk',
    typeLabel: '存在风险',
    title: '条款具有排他性',
    excerpt:
      '无正当理由拒签合同的，给采购人造成损失的，中标人还应当承担民事责任，且采购人有权另行确定中标人或重新招标。',
    searchText: '无正当理由拒签合同',
    pageHint: 32,
    suggestion:
      '建议补充双方协商变更条款的例外情形，避免条款被认定为排除对方主要权利，降低合同无效或被撤销的风险。',
    issueCategory: '基础性',
  },
  {
    id: 'sr-fund-source',
    type: 'optimization',
    typeLabel: '优化建议',
    title: '资金来源不明确',
    excerpt: '预算金额：A 包密集架 96.7595 万元，B 包数字档案馆 152.4450 万元',
    searchText: '预算金额',
    pageHint: 9,
    suggestion: '建议明确资金来源及到位情况，补充"甲方资金已落实"或对应财政批复文号，避免投标人质疑付款保障。',
    issueCategory: '基础性',
  },
  {
    id: 'sr-deadline',
    type: 'optimization',
    typeLabel: '优化建议',
    title: '时间条款表述不清',
    excerpt: '投标截止时间 详见第一章"投标邀请"。',
    searchText: '投标截止时间',
    pageHint: 14,
    suggestion: '建议将"详见第一章"改为直接写明具体日期和时间，避免投标人对截止时间产生歧义。',
    issueCategory: '基础性',
  },
];

export function getSmartReviewCount(issues: SmartReviewIssue[] = smartReviewIssues) {
  return issues.length;
}
