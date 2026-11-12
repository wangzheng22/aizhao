type SidebarTipProps = {
  lines: string[];
  className?: string;
};

export function SidebarTip({ lines, className }: SidebarTipProps) {
  return (
    <div className={['doc-prep-sidebar__tip', className].filter(Boolean).join(' ')}>
      <svg className="doc-prep-sidebar__tip-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" stroke="#fc9306" strokeWidth="1.2" />
        <path d="M8 5v3.5M8 11h.01" stroke="#fc9306" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="doc-prep-sidebar__tip-text">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
