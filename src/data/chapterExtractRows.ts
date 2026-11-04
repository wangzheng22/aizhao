import type { ChapterExtractRow } from '../types/chapterReview';

/**
 * 与 Excel 抽提结果表一致：B=chapter，C=fieldName，D=extractedValue。
 * 后续可用 scripts/import-chapter-extract-xlsx.mjs 从 xlsx 重新生成。
 */
export const chapterExtractRows: ChapterExtractRow[] = [
  // 第一章 招标公告（投标邀请）
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '项目名称',
    extractedValue: '黄州区档案馆新馆及数字档案馆建设项目',
    searchText: '项目名称：黄州区档案馆新馆及数字档案馆建设项目',
    pageHint: 9,
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '项目编号',
    extractedValue: 'GSHD-WT-2026-001',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '招标人',
    extractedValue: '甘肃华电甘州新能源有限公司',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '招标代理机构',
    extractedValue: '甘肃华电招标有限公司',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '行业类型',
    extractedValue: '电力、热力、燃气及水生产和供应业',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '专业类型',
    extractedValue: '风力发电设备采购',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '资金来源及比例',
    extractedValue: '财政性资金 249.2045 万元（A/B 分包合计）；前附表写财政性资金 2492045 元，未单独说明落实状态',
    issueRef: 'sr-fund-source',
    searchText: '财政性资金：2492045',
    pageHint: 13,
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '招标方式',
    extractedValue: '公开招标',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '建设地点',
    extractedValue: '甘肃省张掖市甘州区平山湖蒙古族乡',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '招标控制价',
    extractedValue: '以立项批复及招标控制价文件为准',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '评标方法',
    extractedValue: '综合评估法',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '资格审查方式',
    extractedValue: '资格后审',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '招标范围',
    extractedValue:
      '10万千瓦风电项目风力发电机组（含塔筒、锚栓等）采购、运输、安装指导及相关技术服务',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '交货期',
    extractedValue: '合同生效后180日历天内完成全部设备交货',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '预算金额',
    extractedValue: 'A 包密集架 96.7595 万元，B 包数字档案馆 152.4450 万元，合计 249.2045 万元',
    searchText: '预算金额：A 包密集架 96.7595 万元',
    pageHint: 9,
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '投标截止时间',
    extractedValue: '2026 年 02 月 26 日 09 时 30 分（投标邀请）；前附表写「详见第一章投标邀请」',
    issueRef: 'bid-deadline',
    searchText: '2026 年 02 月 26 日 09 点 30 分',
    pageHint: 9,
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '开标时间',
    extractedValue:
      '投标邀请：2026 年 02 月 26 日 09:30；正文另写截止 2025-02-26、开标 2026-02-26 09:30，年份不一致',
    issueRef: 'bid-open-time-conflict',
    searchText: '截止时间：2025',
    pageHint: 11,
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '开标地点',
    extractedValue: '甘肃省公共资源交易中心电子开标系统',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '联系人',
    extractedValue: '招标采购部 张先生',
  },
  {
    chapter: '第一章 招标公告（投标邀请）',
    fieldName: '联系电话',
    extractedValue: '0936-8888888',
  },

  // 第二章 投标人须知
  {
    chapter: '第二章 投标人须知',
    fieldName: '投标人资格-基本要求',
    extractedValue: '具有独立法人资格，持有有效营业执照，具备履行合同所需的设备与专业技术能力',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '投标人资格-业绩要求',
    extractedValue: '近5年至少1个单机容量5MW及以上风电机组供货业绩',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '招标文件组成',
    extractedValue: '招标公告、投标人须知、评标办法、合同条款、技术规范、图纸及工程量清单等',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '投标保证金',
    extractedValue: '人民币 80 万元（电汇或银行保函，有效期不少于投标有效期）',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '投标有效期',
    extractedValue: '自投标截止日起 90 日历天',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '投标截止时间',
    extractedValue: '前附表 19.1：投标截止时间详见第一章「投标邀请」（投标邀请为 2026-02-26 09:30）',
    issueRef: 'sr-deadline',
    searchText: '投标截止时间 详见第一章',
    pageHint: 14,
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '开标程序',
    extractedValue: '采用电子开标，投标人登录交易系统参与解密与唱标',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '评标委员会组成',
    extractedValue: '5人及以上单数，其中招标人代表不超过1/3',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '招标人及联系方式',
    extractedValue: '甘肃华电甘州新能源有限公司招标采购部 0936-8888888',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '澄清与修改',
    extractedValue: '投标截止前15日以书面形式通知所有获取招标文件的潜在投标人',
  },
  {
    chapter: '第二章 投标人须知',
    fieldName: '踏勘现场',
    extractedValue: '不组织统一踏勘，投标人可自行踏勘，费用自理',
  },

  // 第三章 评标办法
  {
    chapter: '第三章 评标办法',
    fieldName: '评标方法',
    extractedValue: '综合评估法',
  },
  {
    chapter: '第三章 评标办法',
    fieldName: '资格审查方式',
    extractedValue: '资格后审',
  },
  {
    chapter: '第三章 评标办法',
    fieldName: '分值构成-商务标',
    extractedValue: '30分',
  },
  {
    chapter: '第三章 评标办法',
    fieldName: '分值构成-技术标',
    extractedValue: '50分',
  },
  {
    chapter: '第三章 评标办法',
    fieldName: '分值构成-投标报价',
    extractedValue: '20分',
  },
  {
    chapter: '第三章 评标办法',
    fieldName: '价格分计算方法',
    extractedValue: '满足招标文件要求且投标价格最低的投标报价为评标基准价',
  },
  {
    chapter: '第三章 评标办法',
    fieldName: '无效投标情形',
    extractedValue: '未按招标文件要求密封、签字盖章、提交保证金等按无效标处理',
  },

  // 第四章 合同条款及格式（C 列字段清单固定，D 列为本章抽提结果）
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '工程名称',
    extractedValue: '黄州区档案馆新馆及数字档案馆建设项目（前附表 2.5 项目名称）',
    searchText: '2.5 项目名称 黄州区档案馆新馆及数字档案馆建设项目',
    pageHint: 13,
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '工程地点',
    extractedValue: '黄州区（前附表 2.6 项目地点）',
    searchText: '2.6 项目地点 黄州区',
    pageHint: 13,
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '签约合同价',
    extractedValue: '固定总价，以中标通知书及合同协议书载明金额为准',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '计划工期',
    extractedValue: '总工期180日历天（含设备制造、运输、现场安装指导及调试配合）',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '质量目标',
    extractedValue: '工程质量达到国家现行施工质量验收规范合格标准，设备性能指标满足技术规范',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '承包范围摘要',
    extractedValue:
      '10台5MW风电机组（含塔筒、锚栓）供货、运输、卸货、安装指导、系统调试配合、质保期服务及相关技术资料提交',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '项目经理',
    extractedValue: '',
    issueRef: 'ch4-project-manager',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '发包人提供施工条件',
    extractedValue:
      '发包人提供进场道路、吊装平台、现场水电接入条件及协调办理施工所需相关手续，具体以现场交接记录为准',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '进度款支付方式/比例',
    extractedValue: '预付款10%（合同签订后），到货款60%，验收款25%，质保金5%（质保期满无遗留问题后无息退还）',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '安全生产责任',
    extractedValue:
      '承包人对其现场作业人员及设备安全负全责，应编制专项安全方案并接受发包人、监理安全检查；发生安全事故按规定报告并承担相应责任',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '强制性标准符合性',
    extractedValue: '工程和设备应执行国家、行业现行强制性标准；标准不一致时，按其中较严格者执行',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '质量终身责任制',
    extractedValue: '',
    issueRef: 'ch4-quality-lifetime',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '文明施工/扬尘治理要求',
    extractedValue:
      '施工现场应满足属地文明施工管理规定，采取围挡、覆盖、洒水降尘等措施，建筑垃圾及时清运',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '造价控制目标',
    extractedValue: '',
    issueRef: 'ch4-cost-control',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '农民工工资专用账户',
    extractedValue: '',
    issueRef: 'ch4-migrant-account',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '竣工图编制与配合',
    extractedValue: '承包人应配合竣工资料整理，但本章未明确竣工图编制主体、份数及提交时限',
    issueRef: 'ch4-as-built',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '工期延误违约金比例',
    extractedValue: '每延误一日按签约合同价0.5‰计收，未约定累计上限及发包人原因顺延除外情形（正文未检索到对应条款）',
    issueRef: 'ch4-delay-penalty',
  },
  {
    chapter: '第四章 合同条款及格式',
    fieldName: '质量不合格违约金',
    extractedValue:
      '抽提：未达标准按合同价 3% 扣罚；正文为服务质保与免费维修条款，未见 3% 违约金表述',
    issueRef: 'ch4-quality-penalty',
    searchText: '质保期内，中标人应提供',
    pageHint: 62,
  },

  // 第五章 工程量清单
  {
    chapter: '第五章 工程量清单',
    fieldName: '清单编制依据',
    extractedValue: '依据上传工程量清单及立项批复、设计文件编制',
  },
  {
    chapter: '第五章 工程量清单',
    fieldName: '清单计价方式',
    extractedValue: '综合单价法，措施项目单列',
  },
  {
    chapter: '第五章 工程量清单',
    fieldName: '主要工程量-风电机组',
    extractedValue: '10台 5MW 风电机组（含塔筒、锚栓）',
  },
  {
    chapter: '第五章 工程量清单',
    fieldName: '暂列金额',
    extractedValue: '200万元（用于不可预见工程及变更）',
  },

  // 第六章 图纸
  {
    chapter: '第六章 图纸',
    fieldName: '图纸目录',
    extractedValue: '已关联上传图纸：总平面布置图、风机基础图、集电线路图、升压站一次图',
  },
  {
    chapter: '第六章 图纸',
    fieldName: '图纸版本',
    extractedValue: '2026版 第1次送审',
  },
  {
    chapter: '第六章 图纸',
    fieldName: '供图说明',
    extractedValue: '招标阶段图纸仅供投标参考，最终以施工图设计为准',
  },

  // 第七章 技术标准和要求
  {
    chapter: '第七章 技术标准和要求',
    fieldName: '质量标准',
    extractedValue: '符合国家现行施工质量验收规范、风电行业相关标准及设计文件要求',
  },
  {
    chapter: '第七章 技术标准和要求',
    fieldName: '设备技术标准',
    extractedValue: 'GB/T 18451、IEC 61400 等现行有效标准',
  },
  {
    chapter: '第七章 技术标准和要求',
    fieldName: '单机容量',
    extractedValue: '5MW',
  },
  {
    chapter: '第七章 技术标准和要求',
    fieldName: '轮毂高度',
    extractedValue: '140m（可调整范围见技术规范）',
  },
  {
    chapter: '第七章 技术标准和要求',
    fieldName: '并网要求',
    extractedValue: '满足电网公司并网技术规范及调度要求',
  },
  {
    chapter: '第七章 技术标准和要求',
    fieldName: '售后服务',
    extractedValue: '提供不少于2年免费运维培训及备品备件清单',
  },
];
