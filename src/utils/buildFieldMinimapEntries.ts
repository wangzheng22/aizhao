import type { ChapterFieldStatus, ChapterFieldView, ChapterReviewView } from '../types/chapterReview';

export type FieldMinimapEntry = {
  fieldId: string;
  chapterId: string;
  chapterName: string;
  fieldName: string;
  status: ChapterFieldStatus;
  /** 0–1，在缩略条上的纵向位置 */
  topRatio: number;
  field: ChapterFieldView;
};

const MIN_RATIO = 0.012;
const MAX_RATIO = 0.988;
const CLUSTER_EPS = 0.007;
const MARK_GAP = 0.006;

function clampRatio(value: number) {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));
}

/** 同一页码的多条字段在缩略条上错开，避免只看见一条线 */
function spreadOverlappingEntries(entries: FieldMinimapEntry[]): FieldMinimapEntry[] {
  if (entries.length <= 1) return entries;

  const sorted = [...entries].sort(
    (a, b) => a.topRatio - b.topRatio || a.fieldName.localeCompare(b.fieldName, 'zh-CN'),
  );

  const clusters: FieldMinimapEntry[][] = [];
  sorted.forEach((entry) => {
    const last = clusters[clusters.length - 1];
    if (last && Math.abs(last[0].topRatio - entry.topRatio) <= CLUSTER_EPS) {
      last.push(entry);
    } else {
      clusters.push([entry]);
    }
  });

  const spread: FieldMinimapEntry[] = [];
  clusters.forEach((cluster) => {
    if (cluster.length === 1) {
      spread.push(cluster[0]);
      return;
    }
    const center =
      cluster.reduce((sum, entry) => sum + entry.topRatio, 0) / cluster.length;
    const totalSpan = MARK_GAP * (cluster.length - 1);
    cluster.forEach((entry, index) => {
      const topRatio = center - totalSpan / 2 + MARK_GAP * index;
      spread.push({ ...entry, topRatio: clampRatio(topRatio) });
    });
  });

  return spread.sort((a, b) => a.topRatio - b.topRatio);
}

export function buildFieldMinimapEntries(
  chapters: ChapterReviewView[],
  totalPages: number,
): FieldMinimapEntry[] {
  const raw: Omit<FieldMinimapEntry, 'topRatio'>[] = [];

  chapters.forEach((chapter) => {
    chapter.fields.forEach((field) => {
      raw.push({
        fieldId: field.id,
        chapterId: chapter.id,
        chapterName: chapter.chapterName,
        fieldName: field.fieldName,
        status: field.status,
        field,
      });
    });
  });

  if (raw.length === 0) return [];

  const pageBased = totalPages > 0;
  const positioned = raw.map((item, index) => {
    let topRatio: number;
    const pageHint = item.field.pageHint;
    if (pageBased && pageHint != null && pageHint > 0) {
      topRatio = (pageHint - 0.5) / totalPages;
    } else {
      topRatio = (index + 0.5) / raw.length;
    }
    return { ...item, topRatio: clampRatio(topRatio) };
  });

  return spreadOverlappingEntries(positioned);
}
