/** 左侧上传分区（「通用」不在此上传，字段由下列材料抽提后汇总到右侧「通用」） */
export const PROJECT_UPLOAD_SECTIONS = [
  {
    id: 'earlyApproval',
    title: '一、前期立项审批类材料',
    description:
      '项目建议书批复、可研批复、初步设计及概算批复、投资估算预算书、预算审核确认表/结论书等',
  },
  {
    id: 'tenderEntity',
    title: '二、招标主体与组织类材料',
    description: '招标方案/核准意见、招标人营业执照/法人证书、招标代理委托合同等',
  },
  {
    id: 'other',
    title: '三、其他',
    description: '项目沟通会议纪要、相关其他材料',
  },
] as const;

export type ProjectUploadSectionId = (typeof PROJECT_UPLOAD_SECTIONS)[number]['id'];

export const PROJECT_UPLOAD_SECTION_ORDER: ProjectUploadSectionId[] = PROJECT_UPLOAD_SECTIONS.map(
  (section) => section.id,
);
