import type { CompletenessIssue } from '../types/completeness';

export const completenessIssues: CompletenessIssue[] = [
  {
    id: 'bid-deadline',
    type: 'missing',
    typeLabel: '缺失项',
    title: '开标日期未明确',
    reason: '招标文件中未写明具体开标日期与时间，投标人无法据此安排递交与出席。',
    excerpt: '投标截止时间 详见第一章“投标邀请”。',
    searchText: '投标截止时间',
    pageHint: 14,
    bases: [
      {
        id: 'bid-deadline-law-1',
        label: '《招标投标法》第24条',
        title: '招标投标法 第二十四条',
        detail:
          '招标人应当确定投标人编制投标文件所需要的合理时间；但是，依法必须进行招标的项目，自招标文件开始发出之日起至投标人提交投标文件截止之日止，最短不得少于二十日。',
      },
      {
        id: 'bid-deadline-law-2',
        label: '范本填写说明',
        title: '电子招标文件范本 · 时间条款',
        detail: '开标时间、投标截止时间应在招标文件显著位置以具体日期与时点填写，不得仅引用其他章节。',
      },
    ],
    suggestion: '2026年11月23日 9:00',
    suggestionVariants: [
      '2026年11月25日 9:30',
      '2026年12月1日 14:00',
      '请于招标公告发布之日起第20日上午9:00开标',
    ],
    status: 'open',
  },
  {
    id: 'contact-person',
    type: 'missing',
    typeLabel: '缺失项',
    title: '开标日期出现冲突',
    reason: '不同文件中的开标日期表述不一致，存在理解歧义与投诉风险。',
    excerpt: '联系人：黄州区政府采购中心电话：0713-8880358',
    searchText: '联系人',
    pageHint: 12,
    bases: [
      {
        id: 'contact-law-1',
        label: '《政府采购法》第42条',
        title: '政府采购法 第四十二条',
        detail: '采购人、采购代理机构对招标文件的澄清或修改应当以书面形式通知所有获取招标文件的潜在投标人，并保证内容前后一致。',
      },
    ],
    suggestion: '统一开标时间为 2026年11月23日 9:00，并同步修正招标公告与投标人须知前附表。',
    suggestionVariants: [
      '以招标公告发布的开标时间为准：2026年11月23日 9:00，请删除冲突表述。',
      '开标时间以本章前附表为准，其他章节冲突表述一律删除。',
    ],
    status: 'open',
  },
  {
    id: 'contract-refusal',
    type: 'risk',
    typeLabel: '缺失项',
    title: '合同拒签条款',
    reason: '拒签合同责任约定不完整，可能影响违约追责。',
    excerpt: '无正当理由拒签合同的，给采购人造成损失的，中标人还应当承担民事责任。',
    searchText: '无正当理由拒签合同',
    pageHint: 32,
    bases: [
      {
        id: 'contract-law-1',
        label: '《民法典》第577条',
        title: '民法典 第五百七十七条',
        detail: '当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。',
      },
    ],
    suggestion: '已识别，无需修改。',
    status: 'passed',
  },
  {
    id: 'project-name',
    type: 'missing',
    typeLabel: '缺失项',
    title: '项目名称',
    reason: '项目名称已识别。',
    excerpt: '项目名称： 黄州区档案馆新馆及数字档案馆建设项目',
    searchText: '项目名称',
    pageHint: 1,
    bases: [],
    suggestion: '已识别，无需修改。',
    status: 'passed',
  },
  {
    id: 'budget-amount',
    type: 'format',
    typeLabel: '缺失项',
    title: '预算金额',
    reason: '预算金额格式已识别。',
    excerpt: '预算金额：A 包密集架 96.7595 万元，B 包数字档案馆 152.4450 万元',
    searchText: '预算金额',
    pageHint: 9,
    bases: [],
    suggestion: '已识别，无需修改。',
    status: 'passed',
  },
];

export function getCompletenessPercent(issues: CompletenessIssue[]) {
  if (!issues.length) return 100;
  const passed = issues.filter((issue) => issue.status === 'passed').length;
  return Math.round((passed / issues.length) * 100);
}
