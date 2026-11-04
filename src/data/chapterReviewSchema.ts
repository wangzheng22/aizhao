import type { ChapterDef, ChapterExtractRow } from '../types/chapterReview';
import { chapterFieldAnchors, fieldAnchorKey } from './chapterFieldAnchors';
import { chapterFieldCatalog } from './chapterFieldCatalog';
import { chapterExtractRows } from './chapterExtractRows';

function slugify(text: string) {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '')
    .slice(0, 48);
}

function rowKey(chapter: string, fieldName: string) {
  return `${chapter.trim()}\0${fieldName.trim()}`;
}

/** 由 Excel 固定字段（C）+ 抽提结果（D）合并为章节卡片结构 */
export function buildChapterDefsFromExtractRows(rows: ChapterExtractRow[]): ChapterDef[] {
  const rowLookup = new Map<string, ChapterExtractRow>();
  const chapterOrder: string[] = [];

  rows.forEach((row) => {
    const chapterName = row.chapter.trim();
    if (!chapterName) return;
    if (!chapterOrder.includes(chapterName)) {
      chapterOrder.push(chapterName);
    }
    rowLookup.set(rowKey(chapterName, row.fieldName), row);
  });

  Object.keys(chapterFieldCatalog).forEach((chapterName) => {
    if (!chapterOrder.includes(chapterName)) {
      chapterOrder.push(chapterName);
    }
  });

  return chapterOrder.map((chapterName) => {
    const id = `ch-${slugify(chapterName)}`;
    const catalog = chapterFieldCatalog[chapterName];
    const fieldNames = catalog
      ? [...catalog]
      : rows.filter((row) => row.chapter.trim() === chapterName).map((row) => row.fieldName.trim());

    const fields = fieldNames.map((fieldName, index) => {
      const hit = rowLookup.get(rowKey(chapterName, fieldName));
      const anchor = chapterFieldAnchors[fieldAnchorKey(chapterName, fieldName)];
      return {
        id: `${id}-${slugify(fieldName) || index}`,
        fieldName,
        extractedValue: hit?.extractedValue ?? '',
        issueRef: hit?.issueRef,
        searchText: hit?.searchText ?? anchor?.searchText,
        pageHint: hit?.pageHint ?? anchor?.pageHint,
      };
    });

    return { id, name: chapterName, fields };
  });
}

export const chapterReviewSchema: ChapterDef[] = buildChapterDefsFromExtractRows(chapterExtractRows);

export { chapterFieldCatalog } from './chapterFieldCatalog';
