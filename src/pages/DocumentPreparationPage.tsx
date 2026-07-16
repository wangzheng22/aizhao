import { useCallback, useEffect, useState } from 'react';
import type { WizardStep } from '../constants/documentPrep';
import { wizardSteps } from '../constants/documentPrep';
import { completenessIssues, getCompletenessPercent } from '../data/completenessIssues';
import { seedComments } from '../data/comments';
import { getSmartReviewCount } from '../data/smartReviewIssues';
import { parsedProjectForm } from '../data/parsedProjectInfo';
import { DocPrepHeader } from '../components/document-prep/DocPrepHeader';
import { DocPrepToolbar } from '../components/document-prep/DocPrepToolbar';
import { DocPrepSidebar } from '../components/document-prep/DocPrepSidebar';
import { DocPrepPreview } from '../components/document-prep/DocPrepPreview';
import type { Comment } from '../types/comment';
import type { ParseStatus, ProjectForm, UploadFiles } from '../types/documentWorkflow';
import { emptyProjectForm } from '../types/documentWorkflow';
import './DocumentPreparationPage.css';

const PARSE_DELAY_MS = 1800;
const GENERATE_DELAY_MS = 2000;
const UPDATE_SUPPLEMENT_DELAY_MS = 1200;

function hasUploadedFiles(files: UploadFiles) {
  return Object.values(files).some((sectionFiles) => sectionFiles.length > 0);
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
  const [completenessOpen, setCompletenessOpen] = useState(false);
  const [smartReviewOpen, setSmartReviewOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [userComments, setUserComments] = useState<Comment[]>([]);

  const completenessPercent = documentGenerated ? getCompletenessPercent(completenessIssues) : 0;
  const smartReviewCount = documentGenerated ? getSmartReviewCount() : 0;
  const commentCount = documentGenerated ? seedComments.length + userComments.length : 0;

  const headerTitle = documentGenerated
    ? `${projectForm.projectName.trim() || '未命名'}招标文件`
    : '未命名';

  const markStepCompleted = useCallback((step: WizardStep) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  const handleTabClick = useCallback(
    (tab: WizardStep) => {
      const currentIndex = wizardSteps.indexOf(currentStep);
      const tabIndex = wizardSteps.indexOf(tab);
      const enabled = tabIndex <= currentIndex || completedSteps.includes(tab);
      if (!enabled) return;

      if (sidebarOpen && currentStep === tab) {
        setSidebarOpen(false);
        return;
      }

      setCurrentStep(tab);
      setSidebarOpen(true);
    },
    [completedSteps, currentStep, sidebarOpen],
  );

  const handleUploadNext = useCallback(() => {
    if (!hasUploadedFiles(uploadFiles)) return;

    markStepCompleted('文件上传');
    setCurrentStep('项目信息');
    setSidebarOpen(true);
    setParseStatus('parsing');
    setProjectForm(emptyProjectForm);
  }, [markStepCompleted, uploadFiles]);

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
    if (generating || updatingSupplement || documentGenerated) return;

    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setDocumentGenerated(true);
      markStepCompleted('范本选择');
    }, GENERATE_DELAY_MS);
  }, [documentGenerated, generating, markStepCompleted, updatingSupplement]);

  const handleRegenerate = useCallback(() => {
    if (generating || updatingSupplement || !documentGenerated) return;

    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
    }, GENERATE_DELAY_MS);
  }, [documentGenerated, generating, updatingSupplement]);

  const handleUpdateSupplement = useCallback(() => {
    if (generating || updatingSupplement || !documentGenerated) return;

    setUpdatingSupplement(true);
    window.setTimeout(() => {
      setUpdatingSupplement(false);
    }, UPDATE_SUPPLEMENT_DELAY_MS);
  }, [documentGenerated, generating, updatingSupplement]);

  useEffect(() => {
    if (parseStatus !== 'parsing') return undefined;

    const timer = window.setTimeout(() => {
      setProjectForm(parsedProjectForm);
      setParseStatus('done');
    }, PARSE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [parseStatus]);

  return (
    <div className="doc-prep-page">
      <DocPrepHeader title={headerTitle} />
      <DocPrepToolbar
        activeTab={currentStep}
        sidebarOpen={sidebarOpen}
        completedSteps={completedSteps}
        currentStep={currentStep}
        onTabClick={handleTabClick}
        completenessOpen={completenessOpen}
        completenessPercent={completenessPercent}
        smartReviewCount={smartReviewCount}
        commentCount={commentCount}
        statsEnabled={documentGenerated}
        smartReviewOpen={smartReviewOpen}
        commentsOpen={commentsOpen}
        onToggleCompleteness={() => {
          setCompletenessOpen((open) => {
            if (!open) {
              setSmartReviewOpen(false);
              setCommentsOpen(false);
            }
            return !open;
          });
        }}
        onToggleSmartReview={() => {
          setSmartReviewOpen((open) => {
            if (!open) {
              setCompletenessOpen(false);
              setCommentsOpen(false);
            }
            return !open;
          });
        }}
        onToggleComments={() => {
          setCommentsOpen((open) => {
            if (!open) {
              setCompletenessOpen(false);
              setSmartReviewOpen(false);
            }
            return !open;
          });
        }}
      />
      <div className="doc-prep-page__body">
        <DocPrepSidebar
          open={sidebarOpen}
          currentStep={currentStep}
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
          documentGenerated={documentGenerated}
          generating={generating}
          updatingSupplement={updatingSupplement}
          sidebarOpen={sidebarOpen}
          completenessOpen={completenessOpen}
          smartReviewOpen={smartReviewOpen}
          commentsOpen={commentsOpen}
          userComments={userComments}
          onUserCommentsChange={setUserComments}
          onCompletenessClose={() => setCompletenessOpen(false)}
          onSmartReviewClose={() => setSmartReviewOpen(false)}
          onCommentsClose={() => setCommentsOpen(false)}
          onCommentsOpen={() => {
            setCompletenessOpen(false);
            setSmartReviewOpen(false);
            setCommentsOpen(true);
          }}
        />
      </div>
    </div>
  );
}
