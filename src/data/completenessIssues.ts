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
        title: '中华人民共和国招标投标法',
        source: '法律 · 全国人大常委会',
        effectiveDate: '2000-01-01 施行 / 2017-12-28 修正',
        detail:
          '招标人应当确定投标人编制投标文件所需要的合理时间；但是，依法必须进行招标的项目，自招标文件开始发出之日起至投标人提交投标文件截止之日止，最短不得少于二十日。',
        articles: [
          {
            no: '第二十四条',
            text: '招标人应当确定投标人编制投标文件所需要的合理时间；但是，依法必须进行招标的项目，自招标文件开始发出之日起至投标人提交投标文件截止之日止，最短不得少于二十日。',
          },
          {
            no: '第十九条（相关）',
            text: '招标人应当根据招标项目的特点和需要编制招标文件。招标文件应当包括招标项目的技术要求、对投标人资格审查的标准、投标报价要求和评标标准等所有实质性要求和条件以及拟签订合同的主要条款。',
          },
        ],
        applyNote:
          '当前文件仅写“详见第一章”，未在本章给出可执行的具体时点。依法必须招标项目还需满足发出之日起不少于二十日的编制期要求，建议直接填写开标/截止时间。',
        relatedCases: [
          '某档案馆项目因截止时间仅交叉引用，被投标人要求澄清并延期开标。',
          '多地财政监管抽查中，时间条款不完整属于高频整改项。',
        ],
      },
      {
        id: 'bid-deadline-law-2',
        label: '范本填写说明',
        title: '电子招标文件范本 · 时间条款填写说明',
        source: '行业范本 / 编制指引（模拟）',
        effectiveDate: '2024 版示范文本',
        detail: '开标时间、投标截止时间应在招标文件显著位置以具体日期与时点填写，不得仅引用其他章节。',
        articles: [
          {
            no: '填写要点 3.2',
            text: '开标时间、投标截止时间应在招标文件显著位置以具体日期与时点填写，日期格式建议为“YYYY年MM月DD日 HH:mm”，并与招标公告保持一致。',
          },
          {
            no: '填写要点 3.3',
            text: '不得仅以“详见投标邀请 / 详见其他章节”代替具体时间；如确需引用，应同时复述完整时点。',
          },
        ],
        applyNote: '范本要求时间信息可独立阅读。当前写法不符合“显著位置填写具体时点”的编制习惯。',
        relatedCases: [
          '电子标系统校验会拦截“空时间 / 仅引用”类字段。',
          '评审专家常将时间条款缺失记为实质性缺陷提示。',
        ],
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
        title: '中华人民共和国政府采购法',
        source: '法律 · 全国人大常委会',
        effectiveDate: '2003-01-01 施行 / 2014-08-31 修正',
        detail:
          '采购人、采购代理机构对政府采购项目的采购文件负有信息一致与及时澄清义务，修改应以书面形式通知所有获取文件的潜在供应商。',
        articles: [
          {
            no: '第四十二条',
            text: '采购人、采购代理机构对招标文件、资格预审文件的澄清或者修改，应当在招标文件、资格预审文件要求提交投标文件、资格预审申请文件截止时间十五日前，以书面形式通知所有获取招标文件、资格预审文件的潜在投标人。该澄清或者修改的内容为招标文件、资格预审文件的组成部分。',
          },
          {
            no: '实践要点（模拟）',
            text: '同一项目多份文件中的开标时间、联系人、应答地点等信息必须保持一致；发现冲突应立即澄清并统一口径。',
          },
        ],
        applyNote: '系统检测到开标相关表述在不同位置不一致，按政府采购信息公开与澄清规则，应统一时间并书面通知。',
        relatedCases: [
          '因公告与招标文件开标日不一致，曾引发质疑并重新公告。',
          '代理机构未同步修改全部文本，被监管谈话提醒。',
        ],
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
        title: '中华人民共和国民法典',
        source: '法律 · 全国人大',
        effectiveDate: '2021-01-01 施行',
        detail:
          '当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。',
        articles: [
          {
            no: '第五百七十七条',
            text: '当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。',
          },
          {
            no: '第五百八十五条（相关）',
            text: '当事人可以约定一方违约时应当根据违约情况向对方支付一定数额的违约金，也可以约定因违约产生的损失赔偿额的计算方法。约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。',
          },
        ],
        applyNote: '拒签合同属于不履行缔约结果义务的典型情形，建议明确损失范围、违约金及另行确定中标人的程序衔接。',
        relatedCases: [
          '中标后拒签引发采购人索赔，法院主要审查损失举证与条款明确性。',
          '条款仅写“承担民事责任”但未量化时，追责成本较高。',
        ],
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
