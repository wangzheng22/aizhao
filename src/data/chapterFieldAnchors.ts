/** 字段在样本 PDF 中的定位锚点（chapter\\0fieldName → 检索片段 + 页码） */
export type FieldDocumentAnchor = {
  searchText: string;
  pageHint: number;
};

export function fieldAnchorKey(chapter: string, fieldName: string) {
  return `${chapter.trim()}\0${fieldName.trim()}`;
}

export const chapterFieldAnchors: Record<string, FieldDocumentAnchor> = {
  // 第一章 招标公告（投标邀请）
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '项目名称')]: {
    searchText: '3.项目名称：黄州区档案馆新馆及数字档案馆建设项目',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '项目编号')]: {
    searchText: '1.项目编号：HZJY(2026)H001',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '招标人')]: {
    searchText: '名称：黄州区档案馆',
    pageHint: 11,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '招标代理机构')]: {
    searchText: '名称：黄州区政府采购中心',
    pageHint: 12,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '行业类型')]: {
    searchText: '2.8 项目属性 服务',
    pageHint: 13,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '专业类型')]: {
    searchText: '7.采购需求：密集架及数字档案馆建设',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '资金来源及比例')]: {
    searchText: '财政性资金：2492045',
    pageHint: 13,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '招标方式')]: {
    searchText: '4.采购方式：公开招标',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '建设地点')]: {
    searchText: '2.6 项目地点 黄州区',
    pageHint: 13,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '招标控制价')]: {
    searchText: '6.最高限价：A 包密集架 96.7595 万元',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '评标方法')]: {
    searchText: '第五章 评标办法及标准',
    pageHint: 25,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '资格审查方式')]: {
    searchText: '第四章 资格审查方法及标准',
    pageHint: 25,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '招标范围')]: {
    searchText: '7.采购需求：密集架及数字档案馆建设',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '交货期')]: {
    searchText: '8.合同履行期限：合同签订后 60 日内',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '预算金额')]: {
    searchText: '5.预算金额：A 包密集架 96.7595 万元',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '投标截止时间')]: {
    searchText: '2026 年 02 月 26 日 09 点 30 分',
    pageHint: 9,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '开标时间')]: {
    searchText: '4.开标时间：2026 年 02 月 26 日 09 时 30 分',
    pageHint: 11,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '开标地点')]: {
    searchText: '进入开标大厅后使用电脑远程解密开启文件',
    pageHint: 11,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '联系人')]: {
    searchText: '项目联系人：黄州区政府采购中心',
    pageHint: 12,
  },
  [fieldAnchorKey('第一章 招标公告（投标邀请）', '联系电话')]: {
    searchText: '电话：0713-8880358',
    pageHint: 12,
  },

  // 第二章 投标人须知
  [fieldAnchorKey('第二章 投标人须知', '投标人资格-基本要求')]: {
    searchText: '二、投标人资格要求1.满足《中华人民共和国政府采购法》第二十二条规定',
    pageHint: 9,
  },
  [fieldAnchorKey('第二章 投标人须知', '投标人资格-业绩要求')]: {
    searchText: '类似项目业绩的，每提供 1 个得 2 分',
    pageHint: 76,
  },
  [fieldAnchorKey('第二章 投标人须知', '招标文件组成')]: {
    searchText: '14.投标文件的组成',
    pageHint: 27,
  },
  [fieldAnchorKey('第二章 投标人须知', '投标保证金')]: {
    searchText: '16.1 投标有效期 投标截止日期后 90 日历日',
    pageHint: 14,
  },
  [fieldAnchorKey('第二章 投标人须知', '投标有效期')]: {
    searchText: '16.1 投标有效期 投标截止日期后 90 日历日',
    pageHint: 14,
  },
  [fieldAnchorKey('第二章 投标人须知', '投标截止时间')]: {
    searchText: '19.1 投标截止时间 详见第一章',
    pageHint: 14,
  },
  [fieldAnchorKey('第二章 投标人须知', '开标程序')]: {
    searchText: '24.1 投标文件开启环境准备',
    pageHint: 14,
  },
  [fieldAnchorKey('第二章 投标人须知', '评标委员会组成')]: {
    searchText: '评标委员会',
    pageHint: 29,
  },
  [fieldAnchorKey('第二章 投标人须知', '招标人及联系方式')]: {
    searchText: '联系方式：0713-8357875',
    pageHint: 12,
  },
  [fieldAnchorKey('第二章 投标人须知', '澄清与修改')]: {
    searchText: '13.2 采购人或者采购代理机构可以对已发出的招标文件进行必要的澄清或者修改',
    pageHint: 25,
  },
  [fieldAnchorKey('第二章 投标人须知', '踏勘现场')]: {
    searchText: '9.1 现场考察和答疑会',
    pageHint: 13,
  },

  // 第三章 评标办法
  [fieldAnchorKey('第三章 评标办法', '评标方法')]: {
    searchText: '第五章 评标办法及标准',
    pageHint: 25,
  },
  [fieldAnchorKey('第三章 评标办法', '资格审查方式')]: {
    searchText: '第四章 资格审查方法及标准',
    pageHint: 25,
  },
  [fieldAnchorKey('第三章 评标办法', '分值构成-商务标')]: {
    searchText: '3、商务评分（29 分）',
    pageHint: 76,
  },
  [fieldAnchorKey('第三章 评标办法', '分值构成-技术标')]: {
    searchText: '2.1 技术参数响应 39',
    pageHint: 76,
  },
  [fieldAnchorKey('第三章 评标办法', '分值构成-投标报价')]: {
    searchText: '价格分计算方法',
    pageHint: 76,
  },
  [fieldAnchorKey('第三章 评标办法', '价格分计算方法')]: {
    searchText: '投标报价不得超过',
    pageHint: 27,
  },
  [fieldAnchorKey('第三章 评标办法', '无效投标情形')]: {
    searchText: '40.无效投标40.1 投标文件存在',
    pageHint: 34,
  },

  // 第四章 合同条款及格式
  [fieldAnchorKey('第四章 合同条款及格式', '工程名称')]: {
    searchText: '2.5 项目名称 黄州区档案馆新馆及数字档案馆建设项目',
    pageHint: 13,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '工程地点')]: {
    searchText: '2.6 项目地点 黄州区',
    pageHint: 13,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '签约合同价')]: {
    searchText: '15.6 最高限价 详见第一章',
    pageHint: 14,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '计划工期')]: {
    searchText: '4.合同履行期限合同签订后 60 日内',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '质量目标')]: {
    searchText: '5.验收标准在合同履行期限内',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '承包范围摘要')]: {
    searchText: '2.7 项目内容 黄州区档案馆新馆数字馆建设',
    pageHint: 13,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '项目经理')]: {
    searchText: '指定专职项目负责人全面统筹项目管理工作',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '发包人提供施工条件')]: {
    searchText: '1.1 采购方负责对项目建设进行整体统筹指导',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '进度款支付方式/比例')]: {
    searchText: '6.报价范围报价方式',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '安全生产责任')]: {
    searchText: '至少派遣两名专业技术人员驻场实施三个月',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '强制性标准符合性')]: {
    searchText: 'GB/T',
    pageHint: 40,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '质量终身责任制')]: {
    searchText: '3.质保期自验收合格之日起',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '文明施工/扬尘治理要求')]: {
    searchText: '培训服务方案',
    pageHint: 76,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '造价控制目标')]: {
    searchText: '报价须包含该项目的全部采购内容',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '农民工工资专用账户')]: {
    searchText: '合同包干价',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '竣工图编制与配合')]: {
    searchText: '数字馆测评及相关资料整理工作',
    pageHint: 63,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '工期延误违约金比例')]: {
    searchText: '35.1 采购人和中标人应当自中标通知书发出之日起 30 天内',
    pageHint: 32,
  },
  [fieldAnchorKey('第四章 合同条款及格式', '质量不合格违约金')]: {
    searchText: '质保期内，中标人应提供',
    pageHint: 62,
  },

  // 第五章 工程量清单
  [fieldAnchorKey('第五章 工程量清单', '清单编制依据')]: {
    searchText: '（三）分项报价表',
    pageHint: 27,
  },
  [fieldAnchorKey('第五章 工程量清单', '清单计价方式')]: {
    searchText: '15.2 投标人应按照本招标文件规定的报价方式进行报价',
    pageHint: 27,
  },
  [fieldAnchorKey('第五章 工程量清单', '主要工程量-风电机组')]: {
    searchText: '7.采购需求：密集架及数字档案馆建设',
    pageHint: 9,
  },
  [fieldAnchorKey('第五章 工程量清单', '暂列金额')]: {
    searchText: '6.最高限价：A 包密集架 96.7595 万元',
    pageHint: 9,
  },

  // 第六章 图纸
  [fieldAnchorKey('第六章 图纸', '图纸目录')]: {
    searchText: '图纸',
    pageHint: 81,
  },
  [fieldAnchorKey('第六章 图纸', '图纸版本')]: {
    searchText: '图纸',
    pageHint: 81,
  },
  [fieldAnchorKey('第六章 图纸', '供图说明')]: {
    searchText: '图纸',
    pageHint: 81,
  },

  // 第七章 技术标准和要求
  [fieldAnchorKey('第七章 技术标准和要求', '质量标准')]: {
    searchText: '5.验收标准在合同履行期限内',
    pageHint: 63,
  },
  [fieldAnchorKey('第七章 技术标准和要求', '设备技术标准')]: {
    searchText: 'GB/T',
    pageHint: 40,
  },
  [fieldAnchorKey('第七章 技术标准和要求', '单机容量')]: {
    searchText: '5MW',
    pageHint: 55,
  },
  [fieldAnchorKey('第七章 技术标准和要求', '轮毂高度')]: {
    searchText: '140m',
    pageHint: 55,
  },
  [fieldAnchorKey('第七章 技术标准和要求', '并网要求')]: {
    searchText: '电网',
    pageHint: 55,
  },
  [fieldAnchorKey('第七章 技术标准和要求', '售后服务')]: {
    searchText: '3.质保期自验收合格之日起，提供 5 年的运维服务',
    pageHint: 63,
  },
};
