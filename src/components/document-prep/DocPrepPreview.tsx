import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { completenessIssues, getCompletenessPercent } from '../../data/completenessIssues';
import { getSmartReviewCount } from '../../data/smartReviewIssues';
import { useCompletenessAnchors } from '../../hooks/useCompletenessAnchors';
import { usePdfTextSelection } from '../../hooks/usePdfTextSelection';
import { useResolvedComments } from '../../hooks/useResolvedComments';
import { useSmartReviewAnchors } from '../../hooks/useSmartReviewAnchors';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { SAMPLE_PDF_URL } from '../../types/pdf';
import type { Comment } from '../../types/comment';
import type { FieldAnchor, ResolvedCompletenessIssue } from '../../types/completeness';
import type { SuggestionEditHandlers } from '../../types/suggestionEdit';
import type { ResolvedSmartReviewIssue } from '../../types/smartReview';
import { commentToAnchor, commentToMarkerIssue } from '../../utils/commentAnchors';
import { formatCommentTime } from '../../utils/commentTime';
import { getNextVisibleIssueId, getScrollContainer } from '../../utils/issueVisibility';
import { sortIssuesByDocumentOrder } from '../../utils/issueDocumentOrder';
import { getSmartReviewMarkerClass } from '../../utils/markerLabels';
import { CommentsPanel } from './CommentsPanel';
import { CompletenessPanel } from './CompletenessPanel';
import { DocumentToc } from './DocumentToc';
import { PageIssueMarkersOverlay } from './PageIssueMarkersOverlay';
import { PageIssuePopover } from './PageIssuePopover';
import { PdfDocumentViewer } from './PdfDocumentViewer';
import { SmartReviewPanel } from './SmartReviewPanel';
import { SmartReviewPopover } from './SmartReviewPopover';
import { TextSelectionOverlay } from './TextSelectionOverlay';
import './DocPrepPreview.css';

type DocPrepPreviewProps = {
  documentGenerated: boolean;
  generating: boolean;
  updatingSupplement?: boolean;
  sidebarOpen: boolean;
  completenessOpen: boolean;
  smartReviewOpen: boolean;
  commentsOpen: boolean;
  userComments: Comment[];
  onUserCommentsChange: (comments: Comment[]) => void;
  onCompletenessClose: () => void;
  onSmartReviewClose: () => void;
  onCommentsClose: () => void;
  onCommentsOpen: () => void;
};

export function DocPrepPreview({
  documentGenerated,
  generating,
  updatingSupplement = false,
  sidebarOpen,
  completenessOpen,
  smartReviewOpen,
  commentsOpen,
  userComments,
  onUserCommentsChange,
  onCompletenessClose,
  onSmartReviewClose,
  onCommentsClose,
  onCommentsOpen,
}: DocPrepPreviewProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pdfUrl = documentGenerated ? SAMPLE_PDF_URL : null;
  const { pdf, toc, numPages, loading, error } = usePdfDocument(pdfUrl);
  const {
    issues: completenessIssueList,
    anchors: completenessAnchors,
    loading: completenessLoading,
  } = useCompletenessAnchors(pdf);
  const {
    issues: smartReviewIssueList,
    anchors: smartReviewAnchors,
    loading: smartReviewLoading,
  } = useSmartReviewAnchors(pdf);
  const { comments: allComments } = useResolvedComments(pdf, userComments);
  const { selection, clearSelection } = usePdfTextSelection(viewerRef);

  const [tocOpen, setTocOpen] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [activeSmartReviewIssueId, setActiveSmartReviewIssueId] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [draftCommentId, setDraftCommentId] = useState<string | null>(null);
  const [focusedIssueId, setFocusedIssueId] = useState<string | null>(null);
  const [inlineIssueId, setInlineIssueId] = useState<string | null>(null);
  const [inlineSmartReviewIssueId, setInlineSmartReviewIssueId] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});

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

  const completenessPercent = getCompletenessPercent(completenessIssues);
  const smartReviewCount = getSmartReviewCount();
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
    () => sortIssuesByDocumentOrder(allComments.map((comment) => ({ ...comment, anchor: commentToAnchor(comment) }))),
    [allComments],
  );

  const commentAnchors = useMemo(
    () => allComments.map(commentToAnchor),
    [allComments],
  );

  const commentMarkerIssues = useMemo(
    () => (!commentsOpen ? orderedComments.map(commentToMarkerIssue) : []),
    [commentsOpen, orderedComments],
  );

  const highlightAnchors = [...completenessAnchors, ...smartReviewAnchors, ...commentAnchors];

  const markerAnchorIssues = [
    ...(!completenessOpen ? openCompletenessIssues : []),
    ...(!smartReviewOpen ? orderedSmartReviewIssues : []),
    ...commentMarkerIssues,
  ];

  const highlightsLoading = completenessLoading || smartReviewLoading;

  const showHighlights = documentGenerated && !highlightsLoading && highlightAnchors.length > 0;

  const displayActiveIssueId = completenessOpen
    ? activeIssueId
    : smartReviewOpen
      ? activeSmartReviewIssueId
      : commentsOpen
        ? activeCommentId
        : inlineIssueId ?? inlineSmartReviewIssueId ?? activeCommentId;
  const inlineIssue = inlineIssueId
    ? completenessIssueList.find((issue) => issue.id === inlineIssueId) ?? null
    : null;
  const inlineSmartReviewIssue = inlineSmartReviewIssueId
    ? smartReviewIssueList.find((issue) => issue.id === inlineSmartReviewIssueId) ?? null
    : null;

  const scrollToPage = useCallback((pageNumber: number) => {
    setActivePage(pageNumber);
    document.getElementById(`pdf-page-${pageNumber}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const scrollToIssue = useCallback((anchor: FieldAnchor) => {
    setActivePage(anchor.pageNumber);

    const scrollToHighlight = () => {
      const highlight = document.querySelector<HTMLElement>(
        `.field-highlight[data-issue-id="${anchor.issueId}"]`,
      );

      if (highlight) {
        highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }

      return false;
    };

    document.getElementById(`pdf-page-${anchor.pageNumber}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    let attempts = 0;
    const retry = () => {
      if (scrollToHighlight() || attempts >= 24) return;
      attempts += 1;
      window.requestAnimationFrame(retry);
    };

    window.setTimeout(retry, 120);
  }, []);

  const focusIssue = useCallback(
    (issueId: string, anchor?: FieldAnchor) => {
      setFocusedIssueId(null);

      window.requestAnimationFrame(() => {
        setFocusedIssueId(issueId);
      });

      if (anchor) {
        scrollToIssue(anchor);
      }
    },
    [scrollToIssue],
  );

  const handleCompletenessIssueClick = useCallback(
    (issue: ResolvedCompletenessIssue) => {
      setActiveIssueId(issue.id);
      focusIssue(issue.id, issue.anchor);
    },
    [focusIssue],
  );

  const handleSmartReviewIssueClick = useCallback(
    (issue: ResolvedSmartReviewIssue) => {
      setActiveSmartReviewIssueId(issue.id);
      focusIssue(issue.id, issue.anchor);
    },
    [focusIssue],
  );

  const handleCommentClick = useCallback(
    (comment: Comment) => {
      setActiveCommentId(comment.id);
      focusIssue(comment.id, commentToAnchor(comment));
    },
    [focusIssue],
  );

  const handleAddComment = useCallback(() => {
    if (!selection) return;

    const id = `comment-${Date.now()}`;
    const newComment: Comment = {
      id,
      selectedText: selection.text,
      content: '',
      authorName: '李静',
      createdAt: formatCommentTime(),
      pageNumber: selection.pageNumber,
      rect: selection.rect,
      isDraft: true,
    };

    onUserCommentsChange([...userComments, newComment]);
    setDraftCommentId(id);
    setActiveCommentId(id);
    clearSelection();
    onCommentsOpen();
    focusIssue(id, commentToAnchor(newComment));
  }, [selection, userComments, onUserCommentsChange, clearSelection, onCommentsOpen, focusIssue]);

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
      if (activeCommentId === commentId) {
        setActiveCommentId(null);
      }
      if (draftCommentId === commentId) {
        setDraftCommentId(null);
      }
    },
    [userComments, onUserCommentsChange, activeCommentId, draftCommentId],
  );

  const handleCommentMarkerClick = useCallback(
    (comment: Comment) => {
      onCommentsOpen();
      setActiveCommentId(comment.id);
      focusIssue(comment.id, commentToAnchor(comment));
    },
    [onCommentsOpen, focusIssue],
  );

  const handleInlineMarkerClick = useCallback(
    (issue: ResolvedCompletenessIssue) => {
      if (inlineIssueId === issue.id) {
        setInlineIssueId(null);
        setFocusedIssueId(null);
        return;
      }

      setInlineIssueId(issue.id);
      setInlineSmartReviewIssueId(null);
      setFocusedIssueId(issue.id);
    },
    [inlineIssueId],
  );

  const handleInlineSmartReviewClick = useCallback(
    (issue: ResolvedSmartReviewIssue) => {
      if (inlineSmartReviewIssueId === issue.id) {
        setInlineSmartReviewIssueId(null);
        setFocusedIssueId(null);
        return;
      }

      setInlineSmartReviewIssueId(issue.id);
      setInlineIssueId(null);
      setFocusedIssueId(issue.id);
    },
    [inlineSmartReviewIssueId],
  );

  const handleInlineClose = useCallback(() => {
    setInlineIssueId(null);
    setInlineSmartReviewIssueId(null);
    setFocusedIssueId(null);
  }, []);

  useEffect(() => {
    if (!inlineIssueId || completenessOpen || completenessLoading) return undefined;

    const syncVisibleIssue = () => {
      const nextIssueId = getNextVisibleIssueId(openCompletenessIssues, inlineIssueId, viewerRef.current);
      if (nextIssueId === null) {
        setInlineIssueId(null);
        setFocusedIssueId(null);
        return;
      }
      if (nextIssueId !== inlineIssueId) {
        setInlineIssueId(nextIssueId);
        setFocusedIssueId(nextIssueId);
      }
    };

    const scrollEl = getScrollContainer(viewerRef.current);
    scrollEl?.addEventListener('scroll', syncVisibleIssue, { passive: true });
    window.addEventListener('resize', syncVisibleIssue);

    const observer = new ResizeObserver(syncVisibleIssue);
    if (viewerRef.current) observer.observe(viewerRef.current);
    if (scrollEl) observer.observe(scrollEl);

    return () => {
      scrollEl?.removeEventListener('scroll', syncVisibleIssue);
      window.removeEventListener('resize', syncVisibleIssue);
      observer.disconnect();
    };
  }, [inlineIssueId, completenessOpen, completenessLoading, openCompletenessIssues]);

  useEffect(() => {
    if (!inlineSmartReviewIssueId || smartReviewOpen || smartReviewLoading) return undefined;

    const syncVisibleIssue = () => {
      const nextIssueId = getNextVisibleIssueId(
        orderedSmartReviewIssues,
        inlineSmartReviewIssueId,
        viewerRef.current,
      );
      if (nextIssueId === null) {
        setInlineSmartReviewIssueId(null);
        setFocusedIssueId(null);
        return;
      }
      if (nextIssueId !== inlineSmartReviewIssueId) {
        setInlineSmartReviewIssueId(nextIssueId);
        setFocusedIssueId(nextIssueId);
      }
    };

    const scrollEl = getScrollContainer(viewerRef.current);
    scrollEl?.addEventListener('scroll', syncVisibleIssue, { passive: true });
    window.addEventListener('resize', syncVisibleIssue);

    const observer = new ResizeObserver(syncVisibleIssue);
    if (viewerRef.current) observer.observe(viewerRef.current);
    if (scrollEl) observer.observe(scrollEl);

    return () => {
      scrollEl?.removeEventListener('scroll', syncVisibleIssue);
      window.removeEventListener('resize', syncVisibleIssue);
      observer.disconnect();
    };
  }, [inlineSmartReviewIssueId, smartReviewOpen, smartReviewLoading, orderedSmartReviewIssues]);

  useEffect(() => {
    if (completenessOpen) {
      setInlineIssueId(null);
      return;
    }

    setActiveIssueId(null);
    setFocusedIssueId((current) =>
      current && openCompletenessIssues.some((issue) => issue.id === current) ? null : current,
    );
  }, [completenessOpen, openCompletenessIssues]);

  useEffect(() => {
    if (smartReviewOpen) {
      setInlineSmartReviewIssueId(null);
      return;
    }

    setActiveSmartReviewIssueId(null);
    setFocusedIssueId((current) =>
      current && orderedSmartReviewIssues.some((issue) => issue.id === current) ? null : current,
    );
  }, [smartReviewOpen, orderedSmartReviewIssues]);

  useEffect(() => {
    if (commentsOpen) return;

    setActiveCommentId(null);
    setDraftCommentId(null);
    setFocusedIssueId((current) =>
      current && orderedComments.some((comment) => comment.id === current) ? null : current,
    );
  }, [commentsOpen, orderedComments]);

  useEffect(() => {
    if (!completenessOpen || activeIssueId) return;

    const firstOpenIssue = openCompletenessIssues.find((issue) => issue.anchor);
    if (firstOpenIssue) {
      handleCompletenessIssueClick(firstOpenIssue);
    }
  }, [completenessOpen, openCompletenessIssues, activeIssueId, handleCompletenessIssueClick]);

  useEffect(() => {
    if (!smartReviewOpen || activeSmartReviewIssueId) return;

    const firstIssue = orderedSmartReviewIssues.find((issue) => issue.anchor);
    if (firstIssue) {
      handleSmartReviewIssueClick(firstIssue);
    }
  }, [smartReviewOpen, orderedSmartReviewIssues, activeSmartReviewIssueId, handleSmartReviewIssueClick]);

  useEffect(() => {
    if (!focusedIssueId) return undefined;

    const timer = window.setTimeout(() => {
      setFocusedIssueId(null);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [focusedIssueId]);

  useEffect(() => {
    bumpLayoutVersion();
    const timer = window.setTimeout(bumpLayoutVersion, 280);
    return () => window.clearTimeout(timer);
  }, [completenessOpen, smartReviewOpen, commentsOpen, tocOpen, sidebarOpen, bumpLayoutVersion]);

  useEffect(() => {
    if (!pdf || !numPages) return undefined;

    let intersectionObserver: IntersectionObserver | undefined;

    const frameId = window.requestAnimationFrame(() => {
      const viewer = document.querySelector('.pdf-viewer');
      if (!viewer) return;

      const pages = Array.from(viewer.querySelectorAll('[data-page]')) as HTMLElement[];
      if (!pages.length) return;

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (visible) {
            const pageNumber = Number(visible.target.getAttribute('data-page'));
            if (pageNumber) {
              setActivePage(pageNumber);
            }
          }
        },
        { root: viewer, threshold: [0.25, 0.5, 0.75] },
      );

      pages.forEach((page) => intersectionObserver!.observe(page));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      intersectionObserver?.disconnect();
    };
  }, [pdf, numPages]);

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
                  {error && <div className="doc-prep-preview__status doc-prep-preview__status--error">{error}</div>}
                  {!loading && !error && pdf && (
                    <PdfDocumentViewer
                      pdf={pdf}
                      numPages={numPages}
                      anchors={highlightAnchors}
                      markerIssues={markerAnchorIssues}
                      activeIssueId={displayActiveIssueId}
                      focusedIssueId={focusedIssueId}
                      showHighlights={showHighlights}
                      layoutVersion={layoutVersion}
                      enableTextSelection
                      textSelection={
                        selection && !commentsOpen
                          ? { pageNumber: selection.pageNumber, rect: selection.rect }
                          : null
                      }
                    />
                  )}

                  {!completenessOpen && !completenessLoading && (
                    <PageIssueMarkersOverlay
                      viewerRef={viewerRef}
                      issues={openCompletenessIssues}
                      inlineIssueId={inlineIssueId}
                      layoutVersion={layoutVersion}
                      active={!completenessOpen}
                      getMarkerClass={() => 'page-issue-marker--completeness'}
                      onIssueClick={(issue) => {
                        const matched = openCompletenessIssues.find((item) => item.id === issue.id);
                        if (matched) handleInlineMarkerClick(matched);
                      }}
                    />
                  )}

                  {!smartReviewOpen && !smartReviewLoading && (
                    <PageIssueMarkersOverlay
                      viewerRef={viewerRef}
                      issues={orderedSmartReviewIssues}
                      inlineIssueId={inlineSmartReviewIssueId}
                      layoutVersion={layoutVersion}
                      active={!smartReviewOpen}
                      getMarkerClass={getSmartReviewMarkerClass}
                      onIssueClick={(issue) => {
                        const matched = orderedSmartReviewIssues.find((item) => item.id === issue.id);
                        if (matched) handleInlineSmartReviewClick(matched);
                      }}
                    />
                  )}

                  {!commentsOpen && (
                    <PageIssueMarkersOverlay
                      viewerRef={viewerRef}
                      issues={commentMarkerIssues}
                      inlineIssueId={activeCommentId}
                      layoutVersion={layoutVersion}
                      active={!commentsOpen}
                      getMarkerClass={() => 'page-issue-marker--comment'}
                      onIssueClick={(issue) => {
                        const matched = orderedComments.find((item) => item.id === issue.id);
                        if (matched) handleCommentMarkerClick(matched);
                      }}
                    />
                  )}
                </div>

                {selection && !commentsOpen && (
                  <TextSelectionOverlay
                    selection={selection}
                    workspaceRef={workspaceRef}
                    viewerRef={viewerRef}
                    onAddComment={handleAddComment}
                    onAiWrite={() => {
                      window.alert('AI 帮我写功能即将上线');
                    }}
                  />
                )}

                {!completenessOpen && inlineIssue && (
                  <PageIssuePopover
                    issue={inlineIssue}
                    workspaceRef={workspaceRef}
                    viewerRef={viewerRef}
                    suggestionEdit={suggestionEdit}
                    onClose={handleInlineClose}
                  />
                )}

                {!smartReviewOpen && inlineSmartReviewIssue && (
                  <SmartReviewPopover
                    issue={inlineSmartReviewIssue}
                    workspaceRef={workspaceRef}
                    viewerRef={viewerRef}
                    suggestionEdit={suggestionEdit}
                    onClose={handleInlineClose}
                  />
                )}

                <CompletenessPanel
                  open={completenessOpen}
                  percent={completenessPercent}
                  issues={completenessIssueList}
                  activeIssueId={activeIssueId}
                  loading={completenessLoading}
                  suggestionEdit={suggestionEdit}
                  onClose={onCompletenessClose}
                  onIssueClick={handleCompletenessIssueClick}
                  onLayoutSettled={bumpLayoutVersion}
                />

                <SmartReviewPanel
                  open={smartReviewOpen}
                  count={smartReviewCount}
                  issues={orderedSmartReviewIssues}
                  activeIssueId={activeSmartReviewIssueId}
                  loading={smartReviewLoading}
                  suggestionEdit={suggestionEdit}
                  onClose={onSmartReviewClose}
                  onIssueClick={handleSmartReviewIssueClick}
                  onLayoutSettled={bumpLayoutVersion}
                />

                <CommentsPanel
                  open={commentsOpen}
                  comments={orderedComments}
                  activeCommentId={activeCommentId}
                  draftCommentId={draftCommentId}
                  onClose={onCommentsClose}
                  onCommentClick={handleCommentClick}
                  onCommentContentChange={handleCommentContentChange}
                  onCommentDelete={handleCommentDelete}
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
