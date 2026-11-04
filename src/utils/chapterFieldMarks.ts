import type { ChapterFieldView, ChapterReviewView } from '../types/chapterReview';
import type { IssueMarkSpec } from './extractEditableDocument';

export type FieldMarkCategory = 'field-ok' | 'field-missing' | 'field-issue';

export function fieldStatusToMarkCategory(status: 'ok' | 'missing' | 'issue'): FieldMarkCategory {
  if (status === 'missing') return 'field-missing';
  if (status === 'issue') return 'field-issue';
  return 'field-ok';
}

type BuildChapterFieldMarksOptions = {
  includeStatuses?: ChapterFieldView['status'][];
};

function fieldToMark(field: ChapterFieldView): IssueMarkSpec | null {
  if (!field.searchText?.trim()) return null;
  return {
    id: field.markTargetId,
    searchText: field.searchText.trim(),
    category: fieldStatusToMarkCategory(field.status),
    pageHint: field.pageHint,
  };
}

export function buildChapterFieldMarks(
  chapters: ChapterReviewView[],
  options: BuildChapterFieldMarksOptions = {},
): IssueMarkSpec[] {
  const includeStatuses = options.includeStatuses ?? ['missing', 'issue'];
  const marks: IssueMarkSpec[] = [];
  const seen = new Set<string>();

  chapters.forEach((chapter) => {
    chapter.fields.forEach((field) => {
      if (!includeStatuses.includes(field.status)) return;
      if (seen.has(field.markTargetId)) return;
      const mark = fieldToMark(field);
      if (!mark) return;
      seen.add(field.markTargetId);
      marks.push(mark);
    });
  });

  return marks;
}

export function buildOkFieldMark(field: ChapterFieldView): IssueMarkSpec | null {
  if (field.status !== 'ok') return null;
  const mark = fieldToMark(field);
  if (!mark) return null;
  /** 正常字段定位用字段 id，避免与已关闭审查项 id 混用导致高亮/滚动找不到节点 */
  return { ...mark, id: field.id };
}

export function fieldMarkCategoryForApply(field: ChapterFieldView): IssueMarkSpec['category'] {
  return fieldStatusToMarkCategory(field.status);
}
