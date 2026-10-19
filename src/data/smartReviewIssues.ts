import type { SmartReviewIssue } from '../types/smartReview';

export const smartReviewIssues: SmartReviewIssue[] = [
  {
    id: 'sr-exclusive',
    type: 'risk',
    typeLabel: '问题项',
    title: '存在不公正处罚风险，可能导致处罚行为无效的风险',
    reason:
      '逾期竣工违约金按日累计且未设上限，可能构成不合理加重相对方责任，存在被认定为不公正条款的风险。',
    excerpt:
      '无正当理由拒签合同的，给采购人造成损失的，中标人还应当承担民事责任，且采购人有权另行确定中标人或重新招标。',
    searchText: '无正当理由拒签合同',
    pageHint: 32,
    bases: [
      {
        id: 'sr-exclusive-1',
        label: '《民法典》第265条',
        title: '民法典 第二百六十五条',
        detail:
          '私人的合法财产受法律保护，禁止任何组织或者个人侵占、哄抢、破坏。合同条款设置违约金时，应遵循公平原则，不得过分高于造成的损失。',
      },
      {
        id: 'sr-exclusive-2',
        label: '《招标投标法实施条例》第32条',
        title: '招标投标法实施条例 第三十二条',
        detail: '招标人不得以不合理的条件限制、排斥潜在投标人或者投标人，不得设定与项目具体特点和实际需要不相适应的资格、技术、商务条件。',
      },
    ],
    suggestion:
      '建议将逾期竣工违约金调整为按日计取并设置累计上限（例如不超过合同价格的5%），同时补充双方协商变更工期的例外情形。',
    suggestionVariants: [
      '建议补充违约金上限条款：逾期竣工违约金按日计取，累计不超过合同总价的 5%。',
      '建议删除“另行确定中标人”的单方权利表述，改为双方协商或依法重新招标。',
      '建议增加“因不可抗力或发包人原因导致延期的，工期相应顺延且不承担违约金”的例外条款。',
    ],
    issueCategory: '基础性',
  },
  {
    id: 'sr-fund-source',
    type: 'optimization',
    typeLabel: '问题项',
    title: '资金来源不明确',
    reason: '仅列出预算金额，未说明资金来源及落实情况，投标人可能质疑付款保障。',
    excerpt: '预算金额：A 包密集架 96.7595 万元，B 包数字档案馆 152.4450 万元',
    searchText: '预算金额',
    pageHint: 9,
    bases: [
      {
        id: 'sr-fund-1',
        label: '政府采购竞争性磋商办法',
        title: '政府采购竞争性磋商采购方式管理暂行办法',
        detail: '采购文件应当明确采购项目的资金来源与预算金额，保证信息真实、准确、完整。',
      },
    ],
    suggestion: '建议明确资金来源及到位情况，补充“甲方资金已落实”或对应财政批复文号，避免投标人质疑付款保障。',
    suggestionVariants: [
      '建议补充：本项目资金来源为财政拨款，预算已批复，资金已落实。',
      '建议在前附表增加“资金落实情况：已落实”字段，并附批复文号。',
    ],
    issueCategory: '基础性',
  },
  {
    id: 'sr-deadline',
    type: 'optimization',
    typeLabel: '问题项',
    title: '时间条款表述不清',
    reason: '截止时间仅引用其他章节，表述不直观，易产生理解歧义。',
    excerpt: '投标截止时间 详见第一章"投标邀请"。',
    searchText: '投标截止时间',
    pageHint: 14,
    bases: [
      {
        id: 'sr-deadline-1',
        label: '《招标投标法》第24条',
        title: '招标投标法 第二十四条',
        detail: '招标人应当确定投标人编制投标文件所需要的合理时间，并在招标文件中载明具体截止时间。',
      },
    ],
    suggestion: '建议将“详见第一章”改为直接写明具体日期和时间，避免投标人对截止时间产生歧义。',
    suggestionVariants: [
      '建议改为：投标截止时间：2026年11月23日 9:00（北京时间）。',
      '建议在本章直接填写与第一章一致的投标截止时间，删除“详见”引用。',
    ],
    issueCategory: '基础性',
  },
];

export function getSmartReviewCount(issues: SmartReviewIssue[] = smartReviewIssues) {
  return issues.length;
}
