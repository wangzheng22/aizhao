import type { WizardStep } from '../../constants/documentPrep';
import { wizardSteps } from '../../constants/documentPrep';
import './DocPrepToolbar.css';

type DocPrepToolbarProps = {
  activeTab: WizardStep;
  sidebarOpen: boolean;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onTabClick: (tab: WizardStep) => void;
  completenessOpen: boolean;
  smartReviewOpen: boolean;
  commentsOpen: boolean;
  completenessPercent: number;
  smartReviewCount: number;
  commentCount: number;
  statsEnabled: boolean;
  onToggleCompleteness: () => void;
  onToggleSmartReview: () => void;
  onToggleComments: () => void;
};

export function DocPrepToolbar({
  activeTab,
  sidebarOpen,
  currentStep,
  completedSteps,
  onTabClick,
  completenessOpen,
  smartReviewOpen,
  commentsOpen,
  completenessPercent,
  smartReviewCount,
  commentCount,
  statsEnabled,
  onToggleCompleteness,
  onToggleSmartReview,
  onToggleComments,
}: DocPrepToolbarProps) {
  const currentIndex = wizardSteps.indexOf(currentStep);

  const isTabEnabled = (tab: WizardStep) => {
    const tabIndex = wizardSteps.indexOf(tab);
    return tabIndex <= currentIndex || completedSteps.includes(tab);
  };

  const isTabActive = (tab: WizardStep) => sidebarOpen && activeTab === tab;

  return (
    <div className="doc-prep-toolbar">
      <div className="doc-prep-toolbar__left">
        <div className="doc-prep-toolbar__tabs" role="tablist" aria-label="编制步骤">
          {wizardSteps.map((tab) => {
            const enabled = isTabEnabled(tab);
            const active = isTabActive(tab);
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={!enabled}
                className={[
                  'doc-prep-toolbar__tab',
                  active ? 'doc-prep-toolbar__tab--active' : '',
                  !enabled ? 'doc-prep-toolbar__tab--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onTabClick(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="doc-prep-toolbar__right">
        <button
          type="button"
          className={[
            'doc-prep-toolbar__stat',
            completenessOpen ? 'doc-prep-toolbar__stat--active' : '',
            !statsEnabled ? 'doc-prep-toolbar__stat--muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={completenessOpen}
          disabled={!statsEnabled}
          onClick={() => statsEnabled && onToggleCompleteness()}
        >
          <span>完整性</span>
          <span className="doc-prep-toolbar__stat-value">{completenessPercent}%</span>
        </button>
        <button
          type="button"
          className={[
            'doc-prep-toolbar__stat',
            smartReviewOpen ? 'doc-prep-toolbar__stat--active' : '',
            !statsEnabled ? 'doc-prep-toolbar__stat--muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={smartReviewOpen}
          disabled={!statsEnabled}
          onClick={() => statsEnabled && onToggleSmartReview()}
        >
          <span>智能审</span>
          <span className="doc-prep-toolbar__stat-value">{smartReviewCount} 项</span>
        </button>
        <button
          type="button"
          className={[
            'doc-prep-toolbar__stat',
            commentsOpen ? 'doc-prep-toolbar__stat--active' : '',
            !statsEnabled ? 'doc-prep-toolbar__stat--muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={commentsOpen}
          disabled={!statsEnabled}
          onClick={() => statsEnabled && onToggleComments()}
        >
          <span>评论</span>
          <span className="doc-prep-toolbar__stat-value">{commentCount} 项</span>
        </button>
      </div>
    </div>
  );
}
