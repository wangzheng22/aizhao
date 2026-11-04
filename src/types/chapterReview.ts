import type { ResolvedCompletenessIssue } from './completeness';
import type { ReviewBasis } from './reviewCard';
import type { ResolvedSmartReviewIssue } from './smartReview';

export type ChapterFieldStatus = 'ok' | 'missing' | 'issue';

export type ChapterFieldView = {
  id: string;
  /** Excel C 列：抽提字段名 */
  fieldName: string;
  /** Excel D 列：从上传文件抽提的信息 */
  extractedValue: string;
  status: ChapterFieldStatus;
  /** 原文 mark 的 data-issue-id（有审查项时用 issueId，否则用字段 id） */
  markTargetId: string;
  /** 在正文中检索并高亮的文本 */
  searchText?: string;
  pageHint?: number;
  issueId?: string;
  issueKind?: 'missing' | 'issue';
  completenessIssue?: ResolvedCompletenessIssue;
  smartReviewIssue?: ResolvedSmartReviewIssue;
  /** 正常项展示审查/抽提依据 */
  bases?: ReviewBasis[];
};

export type ChapterReviewView = {
  id: string;
  chapterName: string;
  fields: ChapterFieldView[];
  missingCount: number;
  issueCount: number;
  okCount: number;
};

/** Excel 一行：B=章节，C=字段，D=抽提值 */
export type ChapterExtractRow = {
  chapter: string;
  fieldName: string;
  extractedValue: string;
  issueRef?: string;
  /** 优先用于正文定位的检索片段 */
  searchText?: string;
  pageHint?: number;
};

export type ChapterFieldDef = {
  id: string;
  fieldName: string;
  extractedValue: string;
  issueRef?: string;
  searchText?: string;
  pageHint?: number;
};

export type ChapterDef = {
  id: string;
  name: string;
  fields: ChapterFieldDef[];
};
