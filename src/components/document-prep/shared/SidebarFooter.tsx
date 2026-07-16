import './SidebarFooter.css';

type SidebarFooterProps = {
  showBack?: boolean;
  showNext?: boolean;
  showGenerate?: boolean;
  showRegenerateActions?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  generateDisabled?: boolean;
  generating?: boolean;
  updatingSupplement?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onUpdateSupplement?: () => void;
};

export function SidebarFooter({
  showBack = false,
  showNext = false,
  showGenerate = false,
  showRegenerateActions = false,
  nextLabel = '下一步',
  nextDisabled = false,
  generateDisabled = false,
  generating = false,
  updatingSupplement = false,
  onBack,
  onNext,
  onGenerate,
  onRegenerate,
  onUpdateSupplement,
}: SidebarFooterProps) {
  const actionBusy = generating || updatingSupplement;

  return (
    <div className="sidebar-footer">
      {showBack && (
        <button type="button" className="sidebar-footer__back" onClick={onBack}>
          上一步
        </button>
      )}
      {showNext && (
        <button
          type="button"
          className="sidebar-footer__next"
          disabled={nextDisabled}
          onClick={onNext}
        >
          {nextLabel}
        </button>
      )}
      {showGenerate && (
        <button
          type="button"
          className="sidebar-footer__generate"
          disabled={generateDisabled || generating}
          onClick={onGenerate}
        >
          {generating ? '正在生成…' : '生成招标文件'}
        </button>
      )}
      {showRegenerateActions && (
        <div className="sidebar-footer__actions">
          <button
            type="button"
            className="sidebar-footer__regenerate"
            disabled={actionBusy}
            onClick={onRegenerate}
          >
            {generating ? '正在生成…' : '重新生成招标文件'}
          </button>
          <button
            type="button"
            className="sidebar-footer__update"
            disabled={actionBusy}
            onClick={onUpdateSupplement}
          >
            {updatingSupplement ? '正在更新…' : '仅更新补充信息'}
          </button>
        </div>
      )}
    </div>
  );
}
