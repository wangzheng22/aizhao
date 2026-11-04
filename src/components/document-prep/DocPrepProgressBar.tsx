import '../../pages/DocumentPreparationPage.css';

type DocPrepProgressBarProps = {
  progress: number;
  active: boolean;
  visible: boolean;
  /** fixed：顶栏下方全宽；embedded：嵌入内容区顶部 */
  placement?: 'fixed' | 'embedded';
  ariaLabel: string;
};

export function DocPrepProgressBar({
  progress,
  active,
  visible,
  placement = 'fixed',
  ariaLabel,
}: DocPrepProgressBarProps) {
  if (!visible) return null;

  return (
    <div
      className={[
        'doc-prep-progress',
        placement === 'embedded' ? 'doc-prep-progress--in-body' : '',
        active ? 'doc-prep-progress--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="doc-prep-progress__bar"
        style={{ width: `${Math.max(progress, active ? 4 : 0)}%` }}
      />
    </div>
  );
}
