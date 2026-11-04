/** 项目列表一行：一项目一标段 */
export type ProjectListItem = {
  id: string;
  projectName: string;
  projectCode: string;
  industryType: string;
  specialtyType: string;
  tenderer: string;
  bidMethod: string;
  qualificationReview: string;
  /** 展示用：YYYY-MM-DD HH:mm */
  updatedAt: string;
  /** 已生成过招标文件时，列表「编制文件」直达编制页 */
  hasGeneratedDocument?: boolean;
};
