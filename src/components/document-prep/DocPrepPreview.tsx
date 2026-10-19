import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCompletenessAnchors } from '../../hooks/useCompletenessAnchors';
import { useResolvedComments } from '../../hooks/useResolvedComments';
import { useSmartReviewAnchors } from '../../hooks/useSmartReviewAnchors';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { SAMPLE_PDF_URL } from '../../types/pdf';
import type { Comment } from '../../types/comment';
import type { FieldAnchor, ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import { commentToAnchor } from '../../utils/commentAnchors';
import { formatCommentTime } from '../../utils/commentTime';
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
  type ReviewFilter,
  type ReviewLocateRequest,
} from './ReviewChecklistPanel';
import { TextSelectionOverlay } from './TextSelectionOverlay';
import './DocPrepPreview.css';

function filterForAnchorCategory(
  category?: FieldAnchor['category'],
): Exclude<ReviewFilter, 'confirm'> {
  if (category === 'comment') return 'annotation';
  return 'all';
}

type DocPrepPreviewProps = {
  documentGenerated: boolean;
  generating: boolean;
  updatingSupplement?: boolean;
  sidebarOpen: boolean;
  userComments: Comment[];
  onUserCommentsChange: (comments: Comment[]) => void;
  onNotice?: (text: string) => void;
};

export function DocPrepPreview({
  documentGenerated,
  generating,
  updatingSupplement = false,
  sidebarOpen,
  userComments,
  onUserCommentsChange,
  onNotice,
}: DocPrepPreviewProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
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
  const { comments: allComments } = useResolvedComments(pdf, userComments);

  const [tocOpen, setTocOpen] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [draftCommentId, setDraftCommentId] = useState<string | null>(null);
  const [locateRequest, setLocateRequest] = useState<ReviewLocateRequest | null>(null);
  const [focusedIssueId, setFocusedIssueId] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});
  const [appliedTexts, setAppliedTexts] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<EditableSelection | null>(null);

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

  const orderedComments = useMemo(
    () =>
      sortIssuesByDocumentOrder(
        allComments.map((comment) => ({ ...comment, anchor: commentToAnchor(comment) })),
      ),
    [allComments],
  );

  const issueMarks = useMemo((): IssueMarkSpec[] => {
    const marks: IssueMarkSpec[] = [];
    openCompletenessIssues.forEach((issue) => {
      if (issue.searchText) {
        marks.push({
          id: issue.id,
          searchText: issue.searchText,
          category: 'completeness',
        });
      }
    });
    orderedSmartReviewIssues.forEach((issue) => {
      if (issue.searchText) {
        marks.push({
          id: issue.id,
          searchText: issue.searchText,
          category: 'smart-review',
        });
      }
    });
    return marks;
  }, [openCompletenessIssues, orderedSmartReviewIssues]);

  const highlightsLoading = completenessLoading || smartReviewLoading;

  const scrollToPage = useCallback((pageNumber: number) => {
    setActivePage(pageNumber);
    scrollToEditablePage(pageNumber);
  }, []);

  const focusIssue = useCallback((issueId: string) => {
    setFocusedIssueId(null);
    window.requestAnimationFrame(() => {
      setFocusedIssueId(issueId);
    });

    let attempts = 0;
    const retry = () => {
      if (scrollToEditableIssue(issueId) || attempts >= 24) return;
      attempts += 1;
      window.requestAnimationFrame(retry);
    };
    window.setTimeout(retry, 80);
  }, []);

  const handleAddToConfirmList = useCallback(
    (issueId: string) => {
      const title =
        completenessIssueList.find((item) => item.id === issueId)?.title ||
        smartReviewIssueList.find((item) => item.id === issueId)?.title ||
        issueId;
      onNotice?.(`已加入待确认清单：${title}`);
    },
    [onNotice, completenessIssueList, smartReviewIssueList],
  );

  const handleExportConfirmList = useCallback(
    (items: { id: string; title: string; tagLabel: string; reason: string }[]) => {
      if (!items.length) {
        onNotice?.('请先勾选要导出的待确认项');
        return;
      }
      onNotice?.(`已导出待确认清单（${items.length} 项）`);
    },
    [onNotice],
  );

  const handleApplySuggestion = useCallback(
    (issueId: string, suggestion: string) => {
      const trimmed = suggestion.trim();
      if (!trimmed) {
        onNotice?.('修改建议为空，无法替换');
        return;
      }

      const mark = document.querySelector(
        `.editable-doc__mark[data-issue-id="${CSS.escape(issueId)}"]`,
      );
      if (!mark) {
        onNotice?.('未找到可替换的原文位置');
        return;
      }

      setAppliedTexts((prev) => ({ ...prev, [issueId]: trimmed }));
      const preview = trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed;
      onNotice?.(`已替换原文：${preview}`);
      setActiveItemId(issueId);
      focusIssue(issueId);
    },
    [onNotice, focusIssue],
  );

  const handleRegenerateSuggestion = useCallback(() => {
    onNotice?.('AI 修改建议已重新生成');
  }, [onNotice]);

  const openReviewPanel = useCallback(() => {
    setReviewOpen(true);
  }, []);

  const locateChecklistItem = useCallback(
    (itemId: string, filter: Exclude<ReviewFilter, 'confirm'>) => {
      const expanding = !reviewOpen;
      openReviewPanel();
      setActiveItemId(itemId);
      setLocateRequest((prev) => ({
        id: itemId,
        filter,
        token: (prev?.token ?? 0) + 1,
        expanding,
      }));
      focusIssue(itemId);
    },
    [reviewOpen, openReviewPanel, focusIssue],
  );

  const handleIssueMarkClick = useCallback(
    (issueId: string) => {
      const completeness = openCompletenessIssues.find((item) => item.id === issueId);
      const smart = orderedSmartReviewIssues.find((item) => item.id === issueId);
      const category = completeness
        ? 'completeness'
        : smart
          ? 'smart-review'
          : getEditableIssueAnchor(issueId)?.category;
      locateChecklistItem(issueId, filterForAnchorCategory(category));
    },
    [openCompletenessIssues, orderedSmartReviewIssues, locateChecklistItem],
  );

  const handleCompletenessIssueClick = useCallback(
    (issue: ResolvedCompletenessIssue) => {
      setActiveItemId(issue.id);
      focusIssue(issue.id);
    },
    [focusIssue],
  );

  const handleSmartReviewIssueClick = useCallback(
    (issue: ResolvedSmartReviewIssue) => {
      setActiveItemId(issue.id);
      focusIssue(issue.id);
    },
    [focusIssue],
  );

  const handleCommentClick = useCallback(
    (comment: Comment) => {
      setActiveItemId(comment.id);
      focusIssue(comment.id);
    },
    [focusIssue],
  );

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  const handleAddComment = useCallback(() => {
    if (!selection) return;

    const id = `comment-${Date.now()}`;
    const pageEl = document.getElementById(`doc-page-${selection.pageNumber}`);
    const pageRect = pageEl?.getBoundingClientRect();
    const rect = selection.clientRect;

    const newComment: Comment = {
      id,
      selectedText: selection.text,
      content: '',
      authorName: '李静',
      createdAt: formatCommentTime(),
      pageNumber: selection.pageNumber,
      rect: pageRect
        ? {
            x: rect.left - pageRect.left,
            y: rect.top - pageRect.top,
            width: rect.width,
            height: rect.height,
          }
        : { x: 0, y: 0, width: rect.width, height: rect.height },
      isDraft: true,
    };

    onUserCommentsChange([...userComments, newComment]);
    setDraftCommentId(id);
    setActiveItemId(id);
    clearSelection();
    locateChecklistItem(id, 'annotation');
  }, [selection, userComments, onUserCommentsChange, clearSelection, locateChecklistItem]);

  const handleCommentContentChange = useCallback(
    (commentId: string, content: string) => {
      onUserCommentsChange(
        userComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content,
                isDraft: content.trim() ? false : comment.isDraft,
              }
            : comment,
        ),
      );
    },
    [userComments, onUserCommentsChange],
  );

  const handleCommentDelete = useCallback(
    (commentId: string) => {
      onUserCommentsChange(userComments.filter((comment) => comment.id !== commentId));
      if (activeItemId === commentId) setActiveItemId(null);
      if (draftCommentId === commentId) setDraftCommentId(null);
    },
    [userComments, onUserCommentsChange, activeItemId, draftCommentId],
  );

  useEffect(() => {
    if (documentGenerated) {
      setReviewOpen(true);
    } else {
      setReviewOpen(false);
      setActiveItemId(null);
      setDraftCommentId(null);
      setAppliedTexts({});
      setSelection(null);
    }
  }, [documentGenerated]);

  useEffect(() => {
    if (reviewOpen) return;
    setActiveItemId(null);
    setDraftCommentId(null);
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
              className={`doc-prep-preview__menu ${tocOpen ? 'doc-prep-preview__menu--active' : ''}`}
              aria-label={tocOpen ? '收起文档目录' : '展开文档目录'}
              aria-expanded={tocOpen}
              onClick={() => setTocOpen((open) => !open)}
            >
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none" aria-hidden="true">
                <path d="M0 1h16M0 6.5h16M0 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {!reviewOpen && (
              <button type="button" className="doc-prep-preview__review-tab" onClick={openReviewPanel}>
                智能审查
              </button>
            )}

            <div className="doc-prep-preview__layout">
              <DocumentToc
                open={tocOpen}
                items={toc}
                activePage={activePage}
                loading={loading}
                onItemClick={scrollToPage}
              />

              <div ref={workspaceRef} className="doc-prep-preview__workspace">
                <div ref={viewerRef} className="doc-prep-preview__viewer">
                  {loading && <div className="doc-prep-preview__status">正在加载招标文件…</div>}
                  {error && (
                    <div className="doc-prep-preview__status doc-prep-preview__status--error">{error}</div>
                  )}
                  {!loading && !error && pdf && (
                    <EditableDocumentViewer
                      pdf={pdf}
                      marks={issueMarks}
                      appliedTexts={appliedTexts}
                      activeIssueId={activeItemId}
                      focusedIssueId={focusedIssueId}
                      onIssueClick={handleIssueMarkClick}
                      onSelectionChange={setSelection}
                    />
                  )}
                </div>

                {selection && (
                  <TextSelectionOverlay
                    selection={selection}
                    workspaceRef={workspaceRef}
                    viewerRef={viewerRef}
                    onAddComment={handleAddComment}
                    onAiWrite={() => {
                      onNotice?.('AI改写功能即将上线');
                    }}
                  />
                )}

                <ReviewChecklistPanel
                  open={reviewOpen}
                  completenessIssues={completenessIssueList}
                  smartReviewIssues={orderedSmartReviewIssues}
                  comments={orderedComments}
                  activeItemId={activeItemId}
                  draftCommentId={draftCommentId}
                  locateRequest={locateRequest}
                  loading={highlightsLoading}
                  suggestionEdit={suggestionEdit}
                  onClose={() => setReviewOpen(false)}
                  onCompletenessClick={handleCompletenessIssueClick}
                  onSmartReviewClick={handleSmartReviewIssueClick}
                  onCommentClick={handleCommentClick}
                  onCommentContentChange={handleCommentContentChange}
                  onCommentDelete={handleCommentDelete}
                  appliedIssueIds={Object.keys(appliedTexts)}
                  onAddToConfirmList={handleAddToConfirmList}
                  onApplySuggestion={handleApplySuggestion}
                  onRegenerateSuggestion={handleRegenerateSuggestion}
                  onExportConfirmList={handleExportConfirmList}
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
