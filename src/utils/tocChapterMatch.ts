import { chapterPageHints } from '../data/chapterPageHints';
import { chapterReviewSchema } from '../data/chapterReviewSchema';
import type { TocItem } from '../types/pdf';

const CHAPTER_NO_RE = /第[0-9一二三四五六七八九十百]+章/;

function chapterNo(text: string) {
  return text.match(CHAPTER_NO_RE)?.[0] ?? '';
}

function normalize(text: string) {
  return text.replace(/\s+/g, '').replace(/[（(].*[）)]/g, '');
}

/** 将 PDF 目录标题映射到章节抽提卡片 id（data-chapter-id） */
export function resolveChapterIdFromTocTitle(tocTitle: string): string | null {
  const trimmed = tocTitle.trim();
  if (!trimmed) return null;

  const tocNo = chapterNo(trimmed);
  const tocNorm = normalize(trimmed);

  for (const chapter of chapterReviewSchema) {
    const nameNo = chapterNo(chapter.name);
    if (tocNo && nameNo && tocNo === nameNo) {
      return chapter.id;
    }
  }

  for (const chapter of chapterReviewSchema) {
    const nameNorm = normalize(chapter.name);
    if (nameNorm.includes(tocNorm) || tocNorm.includes(nameNorm)) {
      return chapter.id;
    }
  }

  if (tocNo) {
    const byPrefix = chapterReviewSchema.find((chapter) => chapter.name.startsWith(tocNo));
    if (byPrefix) return byPrefix.id;
  }

  return null;
}

export function getChapterById(chapterId: string) {
  return chapterReviewSchema.find((chapter) => chapter.id === chapterId);
}

/** 章节在样例 PDF 中的首选起始页（用于目录 ↔ 正文 ↔ 卡片联动） */
export function getChapterDocumentPage(chapterId: string): number | undefined {
  const chapter = getChapterById(chapterId);
  if (!chapter) return undefined;
  return chapterPageHints[chapter.name];
}

/** 目录中第一个映射到该章节卡片的项 */
export function findTocItemForChapter(chapterId: string, items: TocItem[]): TocItem | null {
  for (const item of items) {
    if (resolveChapterIdFromTocTitle(item.title) === chapterId) {
      return item;
    }
  }
  return null;
}

/** 当前阅读页对应的目录高亮项（取页码不大于当前页的最后一项） */
export function findTocItemForPage(items: TocItem[], pageNumber: number): TocItem | null {
  if (!items.length) return null;
  let hit: TocItem | null = null;
  for (const item of items) {
    if (item.pageNumber <= pageNumber) {
      hit = item;
    } else {
      break;
    }
  }
  return hit ?? items[0];
}
