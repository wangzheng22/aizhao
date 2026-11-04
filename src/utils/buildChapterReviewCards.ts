import { chapterReviewSchema } from '../data/chapterReviewSchema';
import type { ChapterFieldDef, ChapterFieldView, ChapterReviewView } from '../types/chapterReview';
import type { ResolvedCompletenessIssue } from '../types/completeness';
import type { ReviewBasis } from '../types/reviewCard';
import type { ResolvedSmartReviewIssue } from '../types/smartReview';

function excerptNeedle(excerpt?: string) {
  if (!excerpt) return '';
  const line = excerpt.replace(/\s+/g, ' ').trim();
  if (line.length < 8) return '';
  if (line.length <= 72) return line;
  return line.slice(0, 72);
}

function compactLocateNeedle(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 48) return trimmed;
  const clause = trimmed.split(/[；;。\n]/)[0]?.trim() ?? '';
  if (clause.length >= 6 && clause.length <= 56) return clause;
  return trimmed.slice(0, 48);
}

function pickSearchText(
  fieldDef: ChapterFieldDef,
  completeness?: ResolvedCompletenessIssue,
  smart?: ResolvedSmartReviewIssue,
) {
  if (fieldDef.searchText?.trim()) return fieldDef.searchText.trim();

  const fromExcerpt = excerptNeedle(completeness?.excerpt) || excerptNeedle(smart?.excerpt);
  if (fromExcerpt) return compactLocateNeedle(fromExcerpt);

  if (completeness?.searchText?.trim()) return compactLocateNeedle(completeness.searchText);
  if (smart?.searchText?.trim()) return compactLocateNeedle(smart.searchText);

  const raw = fieldDef.extractedValue?.trim() ?? '';
  if (!raw || raw === '未抽提到') return '';
  return compactLocateNeedle(raw);
}

function pickPageHint(
  fieldDef: ChapterFieldDef,
  completeness?: ResolvedCompletenessIssue,
  smart?: ResolvedSmartReviewIssue,
) {
  return fieldDef.pageHint ?? completeness?.pageHint ?? smart?.pageHint;
}

function defaultExtractBasis(fieldDef: ChapterFieldDef, sourceFileName: string): ReviewBasis {
  return {
    id: `extract-${fieldDef.id}`,
    label: sourceFileName,
    title: sourceFileName,
    source: `文档解析 · ${sourceFileName}`,
    detail: `该字段由系统从《${sourceFileName}》对应章节自动抽提，并与范本字段逐项比对后判定为正常。`,
    applyNote: `抽提来源：${sourceFileName}`,
  };
}

function pickFieldBases(
  fieldDef: ChapterFieldDef,
  sourceFileName: string,
  completeness?: ResolvedCompletenessIssue,
  smart?: ResolvedSmartReviewIssue,
): ReviewBasis[] {
  if (completeness?.bases?.length) return completeness.bases;
  if (smart?.bases?.length) return smart.bases;
  return [defaultExtractBasis(fieldDef, sourceFileName)];
}

function buildFieldView(
  fieldDef: ChapterFieldDef,
  completeness: ResolvedCompletenessIssue | undefined,
  smart: ResolvedSmartReviewIssue | undefined,
  appliedSet: Set<string>,
  sourceFileName: string,
): ChapterFieldView {
  const raw = fieldDef.extractedValue?.trim() ?? '';
  const extractedValue = raw || '未抽提到';
  const searchText = pickSearchText(fieldDef, completeness, smart);
  const pageHint = pickPageHint(fieldDef, completeness, smart);
  const bases = pickFieldBases(fieldDef, sourceFileName, completeness, smart);

  if (completeness) {
    const isOpen = completeness.status === 'open' && !appliedSet.has(completeness.id);
    const anchoredIssue =
      isOpen && (searchText || pageHint != null)
        ? {
            ...completeness,
            ...(searchText ? { searchText } : {}),
            ...(pageHint != null ? { pageHint } : {}),
          }
        : completeness;
    return {
      id: fieldDef.id,
      fieldName: fieldDef.fieldName,
      extractedValue,
      status: isOpen ? 'missing' : 'ok',
      markTargetId: completeness.id,
      searchText: searchText || undefined,
      pageHint,
      issueId: completeness.id,
      issueKind: 'missing',
      completenessIssue: isOpen ? anchoredIssue : undefined,
      bases: isOpen ? undefined : bases,
    };
  }

  if (smart) {
    const isOpen = !appliedSet.has(smart.id);
    const anchoredIssue =
      isOpen && (searchText || pageHint != null)
        ? {
            ...smart,
            ...(searchText ? { searchText } : {}),
            ...(pageHint != null ? { pageHint } : {}),
          }
        : smart;
    return {
      id: fieldDef.id,
      fieldName: fieldDef.fieldName,
      extractedValue,
      status: isOpen ? 'issue' : 'ok',
      markTargetId: smart.id,
      searchText: searchText || undefined,
      pageHint,
      issueId: smart.id,
      issueKind: 'issue',
      smartReviewIssue: isOpen ? anchoredIssue : undefined,
      bases: isOpen ? undefined : bases,
    };
  }

  return {
    id: fieldDef.id,
    fieldName: fieldDef.fieldName,
    extractedValue,
    status: 'ok',
    markTargetId: fieldDef.id,
    searchText: searchText || undefined,
    pageHint,
    bases,
  };
}

export function buildChapterReviewCards(
  completenessIssues: ResolvedCompletenessIssue[],
  smartReviewIssues: ResolvedSmartReviewIssue[],
  appliedIssueIds: string[] = [],
  sourceFileName = '招标文件.pdf',
): ChapterReviewView[] {
  const completenessMap = new Map(completenessIssues.map((issue) => [issue.id, issue]));
  const smartMap = new Map(smartReviewIssues.map((issue) => [issue.id, issue]));
  const appliedSet = new Set(appliedIssueIds);

  return chapterReviewSchema.map((chapter) => {
    const fields: ChapterFieldView[] = chapter.fields.map((fieldDef) => {
      const completeness = fieldDef.issueRef
        ? completenessMap.get(fieldDef.issueRef)
        : undefined;
      const smart =
        !completeness && fieldDef.issueRef ? smartMap.get(fieldDef.issueRef) : undefined;
      return buildFieldView(fieldDef, completeness, smart, appliedSet, sourceFileName);
    });

    const missingCount = fields.filter((field) => field.status === 'missing').length;
    const issueCount = fields.filter((field) => field.status === 'issue').length;
    const okCount = fields.filter((field) => field.status === 'ok').length;

    return {
      id: chapter.id,
      chapterName: chapter.name,
      fields,
      missingCount,
      issueCount,
      okCount,
    };
  });
}

export function flattenChapterFields(chapters: ChapterReviewView[]) {
  return chapters.flatMap((chapter) => chapter.fields);
}

export function countChapterReviewStats(chapters: ChapterReviewView[]) {
  return chapters.reduce(
    (acc, chapter) => ({
      missing: acc.missing + chapter.missingCount,
      issue: acc.issue + chapter.issueCount,
    }),
    { missing: 0, issue: 0 },
  );
}
