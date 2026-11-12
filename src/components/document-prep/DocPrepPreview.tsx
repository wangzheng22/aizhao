import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCompletenessAnchors } from '../../hooks/useCompletenessAnchors';
import { useSmartReviewAnchors } from '../../hooks/useSmartReviewAnchors';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { SAMPLE_PDF_URL, type TocItem } from '../../types/pdf';
import type { FieldAnchor, ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import type { IssueMarkSpec } from '../../utils/extractEditableDocument';
import { DocumentToc } from './DocumentToc';
import {
  EditableDocumentViewer,
  getEditableIssueAnchor,
  scrollToEditableIssue,
  scrollToEditablePage,
  type EditableSelection,
} from './EditableDocumentViewer';
import {
  ReviewChecklistPanel,
  type ChapterLocateRequest,
  type ReviewFilter,
  type ReviewLocateRequest,
} from './ReviewChecklistPanel';
import { buildChapterReviewCards, flattenChapterFields } from '../../utils/buildChapterReviewCards';
import {
  buildChapterFieldMarks,
  buildOkFieldMark,
  fieldMarkCategoryForApply,
} from '../../utils/chapterFieldMarks';
import { applyMarkReplacement } from '../../utils/documentMarkApply';
import { findTextAnchor } from '../../utils/pdfTextAnchor';
import {
  findTocItemForChapter,
  findTocItemForPage,
  getChapterDocumentPage,
  resolveChapterIdFromTocTitle,
} from '../../utils/tocChapterMatch';
import type { ChapterFieldStatus, ChapterFieldView } from '../../types/chapterReview';
import { buildFieldMinimapEntries, type FieldMinimapEntry } from '../../utils/buildFieldMinimapEntries';
import { FieldMinimap } from './FieldMinimap';
import type { UploadFiles } from '../../types/documentWorkflow';
import { resolveExtractSourceFileName } from '../../utils/resolveExtractSourceFileName';
import { TextSelectionOverlay } from './TextSelectionOverlay';
import './DocPrepPreview.css';

/** 文档加载后横向光束上下扫描的时长（与 CSS 动画一致），结束后展开右侧编审清单 */
const DOC_SCAN_SWEEP_DURATION_MS = 2800;

/** 编审清单章节卡片错峰飞入结束后移除动效 class（约最后一章 delay + 动画时长） */
const CHECKLIST_CARD_ENTRANCE_CLEAR_MS = 1200;

function filterForAnchorCategory(category?: FieldAnchor['category']): ReviewFilter {
  if (category === 'completeness') return 'missing';
  if (category === 'smart-review') return 'issue';
  return 'all';
}

function fieldStatusToReviewFilter(status: ChapterFieldStatus): ReviewFilter {
  if (status === 'missing') return 'missing';
  if (status === 'issue') return 'issue';
  return 'ok';
}

type DocPrepPreviewProps = {
  documentGenerated: boolean;
  generating: boolean;
  updatingSupplement?: boolean;
  sidebarOpen: boolean;
  uploadFiles?: UploadFiles;
  projectName?: string;
  onNotice?: (text: string) => void;
};

export function DocPrepPreview({
  documentGenerated,
  generating,
  updatingSupplement = false,
  sidebarOpen,
  uploadFiles = {},
  projectName = '',
  onNotice,
}: DocPrepPreviewProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scanScrollRafRef = useRef<number | null>(null);
  const scanPhaseTimerRef = useRef<number | null>(null);
  const pdfUrl = documentGenerated ? SAMPLE_PDF_URL : null;
  const { pdf, toc, loading, error } = usePdfDocument(pdfUrl);
  const {
    issues: completenessIssueList,
    loading: completenessLoading,
  } = useCompletenessAnchors(pdf);
  const {
    issues: smartReviewIssueList,
    loading: smartReviewLoading,
  } = useSmartReviewAnchors(pdf);
  /** 生成招标文件后默认收起目录，正文全宽展示后再进入扫描 */
  const [tocOpen, setTocOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pinnedTocItemId, setPinnedTocItemId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [locateRequest, setLocateRequest] = useState<ReviewLocateRequest | null>(null);
  const [chapterLocateRequest, setChapterLocateRequest] = useState<ChapterLocateRequest | null>(
    null,
  );
  const [focusedIssueId, setFocusedIssueId] = useState<string | null>(null);
  const [activeMarkId, setActiveMarkId] = useState<string | null>(null);
  const [pendingFieldLocate, setPendingFieldLocate] = useState<{
    markId: string;
    searchText: string;
    pageHint?: number;
  } | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});
  const [appliedTexts, setAppliedTexts] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<EditableSelection | null>(null);
  const [checklistFilterFromMinimap, setChecklistFilterFromMinimap] = useState<ReviewFilter | null>(
    null,
  );
  const [docScanPhase, setDocScanPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [editableBodyReady, setEditableBodyReady] = useState(false);
  const [checklistEntrancePlayed, setChecklistEntrancePlayed] = useState(false);

  const clearScanPhaseTimer = useCallback(() => {
    if (scanPhaseTimerRef.current !== null) {
      window.clearTimeout(scanPhaseTimerRef.current);
      scanPhaseTimerRef.current = null;
    }
  }, []);

  const handleEditableDocReady = useCallback(() => {
    setEditableBodyReady(true);
  }, []);
  const bumpLayoutVersion = useCallback(() => {
    setLayoutVersion((version) => version + 1);
  }, []);

  const suggestionEdit: SuggestionEditHandlers = {
    getSuggestionText: (issueId, original) => editedSuggestions[issueId] ?? original,
    isManualSuggestion: (issueId, original) =>
      issueId in editedSuggestions && editedSuggestions[issueId] !== original,
    onSuggestionSave: (issueId, original, value) => {
      const trimmed = value.trim() || original;
      setEditedSuggestions((prev) => {
        if (trimmed === original) {
          const next = { ...prev };
          delete next[issueId];
          return next;
        }
        return { ...prev, [issueId]: trimmed };
      });
    },
  };

  const openCompletenessIssues = useMemo(
    () =>
      sortIssuesByDocumentOrder(
        completenessIssueList.filter((issue) => issue.status === 'open'),
      ),
    [completenessIssueList],
  );

  const orderedSmartReviewIssues = useMemo(
    () => sortIssuesByDocumentOrder(smartReviewIssueList),
    [smartReviewIssueList],
  );

  const appliedIssueIds = useMemo(() => Object.keys(appliedTexts), [appliedTexts]);

  const extractSourceFileName = useMemo(
    () => resolveExtractSourceFileName(uploadFiles, projectName),
    [uploadFiles, projectName],
  );

  const chapterReviewCards = useMemo(
    () =>
      buildChapterReviewCards(
        completenessIssueList,
        orderedSmartReviewIssues,
        appliedIssueIds,
        extractSourceFileName,
      ),
    [completenessIssueList, orderedSmartReviewIssues, appliedIssueIds, extractSourceFileName],
  );

  const chapterFields = useMemo(
    () => flattenChapterFields(chapterReviewCards),
    [chapterReviewCards],
  );

  const minimapEntries = useMemo(
    () => buildFieldMinimapEntries(chapterReviewCards, pdf?.numPages ?? 0),
    [chapterReviewCards, pdf?.numPages],
  );

  const fieldByMarkId = useMemo(() => {
    const map = new Map<string, ChapterFieldView>();
    chapterFields.forEach((field) => {
      map.set(field.markTargetId, field);
      map.set(field.id, field);
    });
    return map;
  }, [chapterFields]);

  const fieldChapterIdByFieldId = useMemo(() => {
    const map = new Map<string, string>();
    chapterReviewCards.forEach((chapter) => {
      chapter.fields.forEach((field) => {
        map.set(field.id, chapter.id);
        map.set(field.markTargetId, chapter.id);
      });
    });
    return map;
  }, [chapterReviewCards]);

  const activeMinimapFieldId = useMemo(() => {
    if (!activeMarkId) return null;
    const field = fieldByMarkId.get(activeMarkId);
    return field?.id ?? null;
  }, [activeMarkId, fieldByMarkId]);

  const activeTocItemId = useMemo(() => {
    if (pinnedTocItemId) return pinnedTocItemId;
    return findTocItemForPage(toc, activePage)?.id ?? null;
  }, [pinnedTocItemId, toc, activePage]);

  const issueMarks = useMemo((): IssueMarkSpec[] => {
    const fieldMarks = buildChapterFieldMarks(chapterReviewCards, {
      includeStatuses: ['missing', 'issue'],
    });
    const covered = new Set(fieldMarks.map((mark) => mark.id));
    const extras: IssueMarkSpec[] = [];

    openCompletenessIssues.forEach((issue) => {
      if (!issue.searchText || covered.has(issue.id)) return;
      extras.push({
        id: issue.id,
        searchText: issue.searchText,
        category: 'field-missing',
        pageHint: issue.pageHint,
      });
    });
    orderedSmartReviewIssues.forEach((issue) => {
      if (!issue.searchText || covered.has(issue.id)) return;
      const field = fieldByMarkId.get(issue.id);
      if (field?.status === 'ok') return;
      extras.push({
        id: issue.id,
        searchText: issue.searchText,
        category: 'field-issue',
        pageHint: issue.pageHint,
      });
    });

    const marks = [...fieldMarks, ...extras];

    if (activeMarkId) {
      const activeField = fieldByMarkId.get(activeMarkId);
      const okMark = activeField ? buildOkFieldMark(activeField) : null;
      if (okMark && !marks.some((mark) => mark.id === okMark.id)) {
        marks.push(okMark);
      }
    }

    appliedIssueIds.forEach((issueId) => {
      if (marks.some((mark) => mark.id === issueId)) return;
      const field = fieldByMarkId.get(issueId);
      if (field?.searchText) {
        marks.push({
          id: field.markTargetId,
          searchText: field.searchText,
          category: 'field-ok',
          pageHint: field.pageHint,
        });
        return;
      }
      const completeness = completenessIssueList.find((item) => item.id === issueId);
      const smart = orderedSmartReviewIssues.find((item) => item.id === issueId);
      const searchText = completeness?.searchText ?? smart?.searchText;
      if (!searchText) return;
      marks.push({
        id: issueId,
        searchText,
        category: 'field-ok',
        pageHint: completeness?.pageHint ?? smart?.pageHint,
      });
    });

    return marks;
  }, [
    chapterReviewCards,
    openCompletenessIssues,
    orderedSmartReviewIssues,
    activeMarkId,
    fieldByMarkId,
    appliedIssueIds,
    completenessIssueList,
    orderedSmartReviewIssues,
  ]);

  const highlightsLoading = completenessLoading || smartReviewLoading;

  const scrollToPage = useCallback((pageNumber: number) => {
    setActivePage(pageNumber);
    scrollToEditablePage(pageNumber);
  }, []);

  const scrollReviewToChapter = useCallback(
    (chapterId: string, fieldId?: string) => {
      const expanding = !reviewOpen;
      if (expanding) {
        setReviewOpen(true);
      }
      setChapterLocateRequest((prev) => ({
        chapterId,
        fieldId,
        token: (prev?.token ?? 0) + 1,
        expanding,
      }));
    },
    [reviewOpen],
  );

  const syncTocToChapter = useCallback(
    (chapterId: string, pageFallback?: number) => {
      const tocItem = findTocItemForChapter(chapterId, toc);
      if (tocItem) {
        setPinnedTocItemId(tocItem.id);
        return;
      }
      if (pageFallback != null) {
        const byPage = findTocItemForPage(toc, pageFallback);
        if (byPage) setPinnedTocItemId(byPage.id);
      }
    },
    [toc],
  );

  const handleTocItemClick = useCallback(
    (item: TocItem) => {
      setPinnedTocItemId(item.id);

      const chapterId = resolveChapterIdFromTocTitle(item.title);
      const bodyPage = chapterId
        ? (getChapterDocumentPage(chapterId) ?? item.pageNumber)
        : item.pageNumber;
      scrollToPage(bodyPage);

      if (chapterId) {
        scrollReviewToChapter(chapterId);
      }
    },
    [scrollToPage, scrollReviewToChapter],
  );

  const focusIssue = useCallback((issueId: string, pageHint?: number) => {
    setFocusedIssueId(null);
    window.requestAnimationFrame(() => {
      setFocusedIssueId(issueId);
    });

    let attempts = 0;
    const retry = () => {
      if (scrollToEditableIssue(issueId, pageHint) || attempts >= 24) return;
      attempts += 1;
      window.requestAnimationFrame(retry);
    };
    window.setTimeout(retry, 80);
  }, []);

  const handleApplySuggestion = useCallback(
    (issueId: string, suggestion: string) => {
      const trimmed = suggestion.trim();
      if (!trimmed) {
        onNotice?.('修改建议为空，无法替换');
        return;
      }

      const field = fieldByMarkId.get(issueId);
      const completeness = completenessIssueList.find((item) => item.id === issueId);
      const smart = orderedSmartReviewIssues.find((item) => item.id === issueId);
      const searchText =
        field?.searchText ?? completeness?.searchText ?? smart?.searchText ?? trimmed;
      const pageHint = field?.pageHint ?? completeness?.pageHint ?? smart?.pageHint;
      const category = field
        ? fieldMarkCategoryForApply(field)
        : completeness
          ? 'field-missing'
          : 'field-issue';

      setAppliedTexts((prev) => ({ ...prev, [issueId]: trimmed }));

      const applied = applyMarkReplacement({
        markId: issueId,
        newText: trimmed,
        searchText,
        pageHint,
        category,
      });

      if (!applied) {
        onNotice?.('未找到可替换的原文位置');
        return;
      }

      const preview = trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed;
      onNotice?.(`已替换原文：${preview}`);
      setActiveMarkId(issueId);
      focusIssue(issueId, pageHint);
    },
    [
      onNotice,
      focusIssue,
      fieldByMarkId,
      completenessIssueList,
      orderedSmartReviewIssues,
    ],
  );

  const handleRegenerateSuggestion = useCallback(() => {
    onNotice?.('AI 修改建议已重新生成');
  }, [onNotice]);

  const openReviewPanel = useCallback(() => {
    setReviewOpen(true);
  }, []);

  const locateChecklistItem = useCallback(
    (itemId: string, filter: ReviewFilter) => {
      const expanding = !reviewOpen;
      openReviewPanel();
      const field = fieldByMarkId.get(itemId);
      const pageHint =
        field?.pageHint ??
        openCompletenessIssues.find((item) => item.id === itemId)?.pageHint ??
        orderedSmartReviewIssues.find((item) => item.id === itemId)?.pageHint;
      if (pageHint) scrollToPage(pageHint);
      setActiveItemId(itemId);
      setLocateRequest((prev) => ({
        id: itemId,
        filter,
        token: (prev?.token ?? 0) + 1,
        expanding,
      }));
      focusIssue(itemId, pageHint);
    },
    [
      reviewOpen,
      openReviewPanel,
      focusIssue,
      fieldByMarkId,
      openCompletenessIssues,
      orderedSmartReviewIssues,
      scrollToPage,
    ],
  );

  const handleFieldLabelClick = useCallback(
    (chapterId: string, field: ChapterFieldView) => {
      if (!field.searchText) {
        onNotice?.('未找到可定位的原文片段');
        return;
      }
      const locateMarkId = field.id;
      const bodyPage =
        field.pageHint ?? getChapterDocumentPage(chapterId) ?? undefined;
      if (bodyPage) {
        scrollToPage(bodyPage);
      }
      syncTocToChapter(chapterId, bodyPage);
      scrollReviewToChapter(chapterId, field.id);
      setActiveMarkId(locateMarkId);
      setActiveItemId(field.issueId ?? field.id);
      setPendingFieldLocate({
        markId: locateMarkId,
        searchText: field.searchText,
        pageHint: field.pageHint ?? bodyPage,
      });
    },
    [onNotice, scrollToPage, syncTocToChapter, scrollReviewToChapter],
  );

  const handleMinimapFieldSelect = useCallback(
    (entry: FieldMinimapEntry) => {
      setChecklistFilterFromMinimap(fieldStatusToReviewFilter(entry.status));
      openReviewPanel();
      if (entry.field.searchText) {
        handleFieldLabelClick(entry.chapterId, entry.field);
        return;
      }
      const bodyPage =
        entry.field.pageHint ?? getChapterDocumentPage(entry.chapterId) ?? undefined;
      if (bodyPage) scrollToPage(bodyPage);
      syncTocToChapter(entry.chapterId, bodyPage);
      scrollReviewToChapter(entry.chapterId, entry.field.id);
      setActiveMarkId(entry.field.id);
      setActiveItemId(entry.field.issueId ?? entry.field.id);
    },
    [
      handleFieldLabelClick,
      openReviewPanel,
      scrollToPage,
      syncTocToChapter,
      scrollReviewToChapter,
    ],
  );

  const handleIssueMarkClick = useCallback(
    (markId: string) => {
      const field = fieldByMarkId.get(markId);
      if (field) {
        const chapterId = fieldChapterIdByFieldId.get(field.id);
        if (chapterId) {
          handleFieldLabelClick(chapterId, field);
        }
        if (field.issueId) {
          const filter: ReviewFilter =
            field.status === 'missing'
              ? 'missing'
              : field.status === 'issue'
                ? 'issue'
                : field.status === 'ok'
                  ? 'ok'
                  : 'all';
          locateChecklistItem(field.issueId, filter);
        }
        return;
      }

      const completeness = openCompletenessIssues.find((item) => item.id === markId);
      const smart = orderedSmartReviewIssues.find((item) => item.id === markId);
      const category = completeness
        ? 'completeness'
        : smart
          ? 'smart-review'
          : getEditableIssueAnchor(markId)?.category;
      setActiveMarkId(markId);
      locateChecklistItem(markId, filterForAnchorCategory(category));
    },
    [
      fieldByMarkId,
      fieldChapterIdByFieldId,
      handleFieldLabelClick,
      openCompletenessIssues,
      orderedSmartReviewIssues,
      locateChecklistItem,
    ],
  );

  const handleCompletenessIssueClick = useCallback(
    (issue: ResolvedCompletenessIssue) => {
      if (issue.pageHint) scrollToPage(issue.pageHint);
      setActiveItemId(issue.id);
      setActiveMarkId(issue.id);
      focusIssue(issue.id, issue.pageHint);
    },
    [focusIssue, scrollToPage],
  );

  const handleSmartReviewIssueClick = useCallback(
    (issue: ResolvedSmartReviewIssue) => {
      if (issue.pageHint) scrollToPage(issue.pageHint);
      setActiveItemId(issue.id);
      setActiveMarkId(issue.id);
      focusIssue(issue.id, issue.pageHint);
    },
    [focusIssue, scrollToPage],
  );

  useEffect(() => {
    if (!documentGenerated) {
      clearScanPhaseTimer();
      setDocScanPhase('idle');
      setEditableBodyReady(false);
      setChecklistEntrancePlayed(false);
      setReviewOpen(false);
      setActiveItemId(null);
      setAppliedTexts({});
      setSelection(null);
      setTocOpen(false);
      return;
    }
    if (generating || updatingSupplement) {
      clearScanPhaseTimer();
      setDocScanPhase('idle');
      setEditableBodyReady(false);
      setReviewOpen(false);
      setTocOpen(false);
      return;
    }
    if (error) {
      clearScanPhaseTimer();
      setDocScanPhase('done');
      return;
    }
    if (!pdf || loading) {
      clearScanPhaseTimer();
      setDocScanPhase('idle');
      setEditableBodyReady(false);
      return;
    }
  }, [
    documentGenerated,
    generating,
    updatingSupplement,
    pdf,
    loading,
    error,
    clearScanPhaseTimer,
  ]);

  /** 待 PDF 与可编辑正文首帧渲染完成后再开始扫描，避免「只有扫描线没有文档」 */
  useEffect(() => {
    if (!documentGenerated || generating || updatingSupplement || error) return;
    if (!pdf || loading) return;
    if (!editableBodyReady) return;
    if (docScanPhase !== 'idle') return;

    setDocScanPhase('scanning');
    clearScanPhaseTimer();
    scanPhaseTimerRef.current = window.setTimeout(() => {
      setDocScanPhase('done');
      scanPhaseTimerRef.current = null;
    }, DOC_SCAN_SWEEP_DURATION_MS);
  }, [
    documentGenerated,
    generating,
    updatingSupplement,
    pdf,
    loading,
    error,
    editableBodyReady,
    docScanPhase,
    clearScanPhaseTimer,
  ]);

  useEffect(
    () => () => {
      clearScanPhaseTimer();
    },
    [clearScanPhaseTimer],
  );

  /** 扫描中收起目录；扫描结束后展示招标文件目录 */
  useEffect(() => {
    if (docScanPhase === 'scanning') {
      setTocOpen(false);
      return;
    }
    if (docScanPhase === 'done') {
      setTocOpen(true);
    }
  }, [docScanPhase]);

  useEffect(() => {
    if (docScanPhase !== 'scanning' || loading || !pdf) {
      if (scanScrollRafRef.current !== null) {
        window.cancelAnimationFrame(scanScrollRafRef.current);
        scanScrollRafRef.current = null;
      }
      return undefined;
    }

    const pixelsPerFrame = 22;

    const tick = () => {
      const root = viewerRef.current?.querySelector('.editable-doc') as HTMLElement | null;
      if (root && root.scrollHeight > root.clientHeight) {
        const max = root.scrollHeight - root.clientHeight;
        const next = root.scrollTop + pixelsPerFrame;
        root.scrollTop = next >= max - 1 ? 0 : next;
      }
      scanScrollRafRef.current = window.requestAnimationFrame(tick);
    };

    scanScrollRafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (scanScrollRafRef.current !== null) {
        window.cancelAnimationFrame(scanScrollRafRef.current);
        scanScrollRafRef.current = null;
      }
    };
  }, [docScanPhase, loading, pdf]);

  /** 扫描结束：正文回到顶部，便于阅读 */
  useEffect(() => {
    if (docScanPhase !== 'done') return;
    const root = viewerRef.current?.querySelector('.editable-doc') as HTMLElement | null;
    if (root) root.scrollTop = 0;
  }, [docScanPhase]);

  useEffect(() => {
    if (!documentGenerated) {
      setReviewOpen(false);
      return;
    }
    if (generating || updatingSupplement) {
      setReviewOpen(false);
      return;
    }
    setReviewOpen(docScanPhase === 'done');
  }, [documentGenerated, generating, updatingSupplement, docScanPhase]);

  useEffect(() => {
    if (!reviewOpen || docScanPhase !== 'done' || highlightsLoading || checklistEntrancePlayed) {
      return undefined;
    }
    const timerId = window.setTimeout(() => {
      setChecklistEntrancePlayed(true);
    }, CHECKLIST_CARD_ENTRANCE_CLEAR_MS);
    return () => window.clearTimeout(timerId);
  }, [reviewOpen, docScanPhase, highlightsLoading, checklistEntrancePlayed]);

  useEffect(() => {
    if (reviewOpen) return;
    setActiveItemId(null);
    setFocusedIssueId(null);
  }, [reviewOpen]);

  useEffect(() => {
    if (!reviewOpen || activeItemId) return;

    const firstReview = sortIssuesByDocumentOrder([
      ...openCompletenessIssues.map((issue) => ({ kind: 'missing' as const, ...issue })),
      ...orderedSmartReviewIssues.map((issue) => ({ kind: 'issue' as const, ...issue })),
    ]).find((item) => item.anchor || item.searchText);

    if (firstReview?.kind === 'missing') {
      handleCompletenessIssueClick(firstReview);
      return;
    }
    if (firstReview?.kind === 'issue') {
      handleSmartReviewIssueClick(firstReview);
    }
  }, [
    reviewOpen,
    activeItemId,
    openCompletenessIssues,
    orderedSmartReviewIssues,
    handleCompletenessIssueClick,
    handleSmartReviewIssueClick,
  ]);

  useEffect(() => {
    if (!focusedIssueId) return undefined;
    const timer = window.setTimeout(() => setFocusedIssueId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [focusedIssueId]);

  useEffect(() => {
    if (!pendingFieldLocate || !pdf) return undefined;

    let cancelled = false;
    let frame = 0;
    let attempts = 0;

    const finishFocus = (markId: string, pageHint?: number) => {
      setFocusedIssueId(null);
      window.requestAnimationFrame(() => {
        if (!cancelled) setFocusedIssueId(markId);
      });
      focusIssue(markId, pageHint);
    };

    const retry = () => {
      if (cancelled) return;
      const { markId, pageHint } = pendingFieldLocate;
      if (scrollToEditableIssue(markId, pageHint)) {
        finishFocus(markId, pageHint);
        setPendingFieldLocate(null);
        return;
      }
      attempts += 1;
      if (attempts < 96) {
        frame = window.requestAnimationFrame(retry);
        return;
      }

      void (async () => {
        const anchor = await findTextAnchor(
          pdf,
          pendingFieldLocate.searchText,
          pendingFieldLocate.pageHint,
        );
        if (cancelled) return;
        if (anchor?.pageNumber) {
          scrollToPage(anchor.pageNumber);
          window.setTimeout(() => {
            if (scrollToEditableIssue(pendingFieldLocate.markId, anchor.pageNumber)) {
              finishFocus(pendingFieldLocate.markId, anchor.pageNumber);
            } else {
              onNotice?.('已滚动至相近原文所在页');
            }
            setPendingFieldLocate(null);
          }, 120);
          return;
        }
        onNotice?.('未在正文中匹配到该字段片段');
        setPendingFieldLocate(null);
      })();
    };

    frame = window.requestAnimationFrame(retry);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [pendingFieldLocate, pdf, issueMarks, focusIssue, scrollToPage, onNotice]);

  useEffect(() => {
    bumpLayoutVersion();
    const timer = window.setTimeout(bumpLayoutVersion, 280);
    return () => window.clearTimeout(timer);
  }, [reviewOpen, tocOpen, sidebarOpen, bumpLayoutVersion]);

  useEffect(() => {
    const viewer = viewerRef.current?.querySelector('.editable-doc');
    if (!viewer) return undefined;

    const pages = Array.from(viewer.querySelectorAll('[data-page]')) as HTMLElement[];
    if (!pages.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const pageNumber = Number(visible.target.getAttribute('data-page'));
          if (pageNumber) setActivePage(pageNumber);
        }
      },
      { root: viewer, threshold: [0.25, 0.5, 0.75] },
    );

    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [pdf, layoutVersion]);

  return (
    <div className="doc-prep-preview">
      <div className="doc-prep-preview__paper">
        {!documentGenerated && !generating && (
          <div className="doc-prep-preview__empty" aria-hidden="true" />
        )}

        {generating && (
          <div className="doc-prep-preview__generating" role="status" aria-live="polite">
            <div className="doc-prep-preview__generating-spinner" aria-hidden="true" />
            <p className="doc-prep-preview__generating-title">正在生成招标文件…</p>
            <p className="doc-prep-preview__generating-desc">正在根据项目信息与范本生成文档，请稍候</p>
          </div>
        )}

        {updatingSupplement && (
          <div className="doc-prep-preview__generating" role="status" aria-live="polite">
            <div className="doc-prep-preview__generating-spinner" aria-hidden="true" />
            <p className="doc-prep-preview__generating-title">正在更新补充信息…</p>
            <p className="doc-prep-preview__generating-desc">正在同步最新补充内容到招标文件，请稍候</p>
          </div>
        )}

        {documentGenerated && !generating && !updatingSupplement && (
          <>
            <button
              type="button"
              className={[
                'doc-prep-preview__menu',
                tocOpen ? 'doc-prep-preview__menu--active' : '',
                docScanPhase === 'scanning' ? 'doc-prep-preview__menu--scan-hidden' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={tocOpen ? '收起文档目录' : '展开文档目录'}
              aria-expanded={tocOpen}
              onClick={() => setTocOpen((open) => !open)}
            >
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none" aria-hidden="true">
                <path d="M0 1h16M0 6.5h16M0 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="doc-prep-preview__layout">
              <DocumentToc
                open={tocOpen}
                items={toc}
                activePage={activePage}
                activeTocItemId={activeTocItemId}
                loading={loading}
                onItemClick={handleTocItemClick}
              />

              <div ref={workspaceRef} className="doc-prep-preview__workspace">
                <div ref={viewerRef} className="doc-prep-preview__viewer">
                  {loading && <div className="doc-prep-preview__status">正在加载招标文件…</div>}
                  {error && (
                    <div className="doc-prep-preview__status doc-prep-preview__status--error">
                      {error}
                    </div>
                  )}
                  {!loading && !error && pdf && (
                    <EditableDocumentViewer
                      pdf={pdf}
                      marks={issueMarks}
                      appliedTexts={appliedTexts}
                      activeIssueId={activeMarkId ?? activeItemId}
                      focusedIssueId={focusedIssueId}
                      onIssueClick={handleIssueMarkClick}
                      onSelectionChange={setSelection}
                      onReady={handleEditableDocReady}
                    />
                  )}
                  {docScanPhase === 'scanning' && !loading && pdf && (
                    <div
                      className="doc-prep-preview__doc-scan"
                      role="status"
                      aria-live="polite"
                      aria-label="正在扫描招标文件"
                    >
                      <div className="doc-prep-preview__doc-scan-line" aria-hidden="true" />
                      <p className="doc-prep-preview__doc-scan-caption">智能扫描招标文件中…</p>
                    </div>
                  )}
                  {selection && (
                    <TextSelectionOverlay
                      selection={selection}
                      workspaceRef={workspaceRef}
                      viewerRef={viewerRef}
                      onAiWrite={() => {
                        onNotice?.('AI改写功能即将上线');
                      }}
                    />
                  )}
                  {!loading && !error && pdf && docScanPhase !== 'scanning' && (
                    <FieldMinimap
                      entries={minimapEntries}
                      activeFieldId={activeMinimapFieldId}
                      onFieldSelect={handleMinimapFieldSelect}
                    />
                  )}
                </div>

                <ReviewChecklistPanel
                  open={reviewOpen}
                  completenessIssues={completenessIssueList}
                  smartReviewIssues={orderedSmartReviewIssues}
                  extractSourceFileName={extractSourceFileName}
                  activeItemId={activeItemId}
                  locateRequest={locateRequest}
                  chapterLocateRequest={chapterLocateRequest}
                  loading={highlightsLoading}
                  entranceFromScan={
                    docScanPhase === 'done' && reviewOpen && !highlightsLoading && !checklistEntrancePlayed
                  }
                  suggestionEdit={suggestionEdit}
                  onClose={() => setReviewOpen(false)}
                  onCompletenessClick={handleCompletenessIssueClick}
                  onSmartReviewClick={handleSmartReviewIssueClick}
                  appliedIssueIds={appliedIssueIds}
                  onApplySuggestion={handleApplySuggestion}
                  onRegenerateSuggestion={handleRegenerateSuggestion}
                  onFieldLabelClick={handleFieldLabelClick}
                  activeMarkId={activeMarkId}
                  focusFilter={checklistFilterFromMinimap}
                  onLayoutSettled={bumpLayoutVersion}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
