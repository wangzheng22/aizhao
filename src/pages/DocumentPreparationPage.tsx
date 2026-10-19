import { useCallback, useEffect, useRef, useState } from 'react';
import type { WizardStep } from '../constants/documentPrep';
import { wizardSteps } from '../constants/documentPrep';
import { parsedProjectForm } from '../data/parsedProjectInfo';
import { DocPrepHeader, type HeaderNotice } from '../components/document-prep/DocPrepHeader';
import { DocPrepSidebar } from '../components/document-prep/DocPrepSidebar';
import { DocPrepPreview } from '../components/document-prep/DocPrepPreview';
import type { Comment } from '../types/comment';
import type { ParseStatus, ProjectForm, UploadFiles } from '../types/documentWorkflow';
import { emptyProjectForm } from '../types/documentWorkflow';
import './DocumentPreparationPage.css';

const PARSE_DELAY_MS = 1800;
const GENERATE_DELAY_MS = 2000;
const UPDATE_SUPPLEMENT_DELAY_MS = 1200;
const RE_REVIEW_DELAY_MS = 1600;

function hasUploadedFiles(files: UploadFiles) {
  return Object.values(files).some((sectionFiles) => sectionFiles.length > 0);
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/** e.g. 2026.10.16 10:29:23 */
function formatNoticeTime(date = new Date()) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function DocumentPreparationPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('文件上传');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [uploadFiles, setUploadFiles] = useState<UploadFiles>({});
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [selectedTemplateId, setSelectedTemplateId] = useState('rec-1');
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updatingSupplement, setUpdatingSupplement] = useState(false);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [headerNotice, setHeaderNotice] = useState<HeaderNotice>(null);
  const [reviewProgressVisible, setReviewProgressVisible] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  const [reviewProgressActive, setReviewProgressActive] = useState(false);
  const [reReviewing, setReReviewing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const noticeIdRef = useRef(0);
  const progressTimerRef = useRef<number | null>(null);

  const headerTitle = documentGenerated
    ? `${projectForm.projectName.trim() || '未命名'}招标文件`
    : '未命名';

  const pushNotice = useCallback((text: string) => {
    noticeIdRef.current += 1;
    setHeaderNotice({ id: noticeIdRef.current, text });
  }, []);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const runReviewProgress = useCallback(
    (durationMs: number, onDone?: () => void) => {
      clearProgressTimer();
      setReviewProgressVisible(true);
      setReviewProgressActive(true);
      setReviewProgress(0);

      const startedAt = performance.now();
      progressTimerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const next = Math.min(100, (elapsed / durationMs) * 100);
        setReviewProgress(next);

        if (next >= 100) {
          clearProgressTimer();
          setReviewProgressActive(false);
          onDone?.();
        }
      }, 32);
    },
    [clearProgressTimer],
  );

  const markStepCompleted = useCallback((step: WizardStep) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  const handleToggleProjectInfo = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  const handleTabClick = useCallback(
    (tab: WizardStep) => {
      const currentIndex = wizardSteps.indexOf(currentStep);
      const tabIndex = wizardSteps.indexOf(tab);
      const enabled = tabIndex <= currentIndex || completedSteps.includes(tab);
      if (!enabled) return;

      setCurrentStep(tab);
      setSidebarOpen(true);
    },
    [completedSteps, currentStep],
  );

  const handleUploadNext = useCallback(() => {
    if (!hasUploadedFiles(uploadFiles)) return;

    markStepCompleted('文件上传');
    setCurrentStep('项目信息');
    setSidebarOpen(true);
    setParseStatus('parsing');
    setProjectForm(emptyProjectForm);
    setReviewProgressVisible(true);
    runReviewProgress(PARSE_DELAY_MS + 400);
  }, [markStepCompleted, uploadFiles, runReviewProgress]);

  const handleProjectBack = useCallback(() => {
    setCurrentStep('文件上传');
    setParseStatus('idle');
  }, []);

  const handleProjectNext = useCallback(() => {
    if (parseStatus !== 'done') return;

    markStepCompleted('项目信息');
    setCurrentStep('范本选择');
    setSidebarOpen(true);
  }, [markStepCompleted, parseStatus]);

  const handleTemplateBack = useCallback(() => {
    setCurrentStep('项目信息');
  }, []);

  const handleGenerate = useCallback(() => {
    if (generating || updatingSupplement || documentGenerated || reReviewing) return;

    setGenerating(true);
    pushNotice('正在生成招标文件…');
    runReviewProgress(GENERATE_DELAY_MS);
    window.setTimeout(() => {
      setGenerating(false);
      setDocumentGenerated(true);
      markStepCompleted('范本选择');
      setSidebarOpen(false);
      pushNotice(`招标文件已生成 ${formatNoticeTime()}`);
    }, GENERATE_DELAY_MS);
  }, [
    documentGenerated,
    generating,
    markStepCompleted,
    pushNotice,
    updatingSupplement,
    reReviewing,
    runReviewProgress,
  ]);

  const handleRegenerate = useCallback(() => {
    if (generating || updatingSupplement || !documentGenerated || reReviewing) return;

    setGenerating(true);
    pushNotice('正在重新生成招标文件…');
    runReviewProgress(GENERATE_DELAY_MS);
    window.setTimeout(() => {
      setGenerating(false);
      pushNotice(`重新生成完成 ${formatNoticeTime()}`);
    }, GENERATE_DELAY_MS);
  }, [documentGenerated, generating, pushNotice, updatingSupplement, reReviewing, runReviewProgress]);

  const handleUpdateSupplement = useCallback(() => {
    if (generating || updatingSupplement || !documentGenerated || reReviewing) return;

    setUpdatingSupplement(true);
    pushNotice('正在更新补充信息…');
    window.setTimeout(() => {
      setUpdatingSupplement(false);
      pushNotice(`补充信息已更新 ${formatNoticeTime()}`);
    }, UPDATE_SUPPLEMENT_DELAY_MS);
  }, [documentGenerated, generating, pushNotice, updatingSupplement, reReviewing]);

  const handleReReview = useCallback(() => {
    if (!documentGenerated || generating || updatingSupplement || reReviewing) return;

    setReReviewing(true);
    pushNotice('正在重新评审当前招标文件…');
    runReviewProgress(RE_REVIEW_DELAY_MS, () => {
      setPreviewKey((key) => key + 1);
      setUserComments([]);
      setReReviewing(false);
      pushNotice(`已重新评审文件，重新评审当前招标文件 ${formatNoticeTime()}`);
    });
  }, [
    documentGenerated,
    generating,
    updatingSupplement,
    reReviewing,
    pushNotice,
    runReviewProgress,
  ]);

  const handleSave = useCallback(() => {
    pushNotice(`最近保存${formatNoticeTime()}`);
  }, [pushNotice]);

  const handleExport = useCallback(() => {
    pushNotice(`最近导出${formatNoticeTime()}`);
  }, [pushNotice]);

  const handleTraceReport = useCallback(() => {
    pushNotice(`溯源报告已生成${formatNoticeTime()}`);
  }, [pushNotice]);

  useEffect(() => {
    if (parseStatus !== 'parsing') return undefined;

    const timer = window.setTimeout(() => {
      setProjectForm(parsedProjectForm);
      setParseStatus('done');
    }, PARSE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [parseStatus]);

  useEffect(() => () => clearProgressTimer(), [clearProgressTimer]);

  const showProgressBar =
    reviewProgressVisible ||
    completedSteps.includes('文件上传') ||
    documentGenerated ||
    reviewProgressActive;

  return (
    <div className={`doc-prep-page${showProgressBar ? ' doc-prep-page--with-progress' : ''}`}>
      <DocPrepHeader
        title={headerTitle}
        notice={headerNotice}
        projectInfoOpen={sidebarOpen}
        reReviewEnabled={documentGenerated}
        reReviewing={reReviewing}
        onToggleProjectInfo={handleToggleProjectInfo}
        onReReview={handleReReview}
        onSave={handleSave}
        onExport={handleExport}
        onTraceReport={handleTraceReport}
      />

      {showProgressBar && (
        <div
          className={[
            'doc-prep-progress',
            reviewProgressActive ? 'doc-prep-progress--active' : '',
            reviewProgress >= 100 && !reviewProgressActive ? 'doc-prep-progress--done' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="progressbar"
          aria-label="审查招标文件进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(reviewProgress)}
        >
          <div
            className="doc-prep-progress__bar"
            style={{ width: `${Math.max(reviewProgress, reviewProgressActive ? 4 : 0)}%` }}
          />
        </div>
      )}

      <div className="doc-prep-page__body">
        <DocPrepSidebar
          open={sidebarOpen}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onTabClick={handleTabClick}
          uploadFiles={uploadFiles}
          onUploadFilesChange={setUploadFiles}
          projectForm={projectForm}
          parseStatus={parseStatus}
          onProjectFormChange={setProjectForm}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={setSelectedTemplateId}
          generating={generating}
          updatingSupplement={updatingSupplement}
          documentGenerated={documentGenerated}
          onUploadNext={handleUploadNext}
          onProjectBack={handleProjectBack}
          onProjectNext={handleProjectNext}
          onTemplateBack={handleTemplateBack}
          onGenerate={handleGenerate}
          onRegenerate={handleRegenerate}
          onUpdateSupplement={handleUpdateSupplement}
        />
        <DocPrepPreview
          key={previewKey}
          documentGenerated={documentGenerated}
          generating={generating || reReviewing}
          updatingSupplement={updatingSupplement}
          sidebarOpen={sidebarOpen}
          userComments={userComments}
          onUserCommentsChange={setUserComments}
          onNotice={pushNotice}
        />
      </div>
    </div>
  );
}
