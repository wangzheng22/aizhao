import { useLayoutEffect, useRef, useState } from 'react';
import './TextSelectionToolbar.css';

type ToolbarAnchor = {
  top: number;
  left: number;
};

type TextSelectionToolbarProps = {
  anchor: ToolbarAnchor;
  workspaceRef: React.RefObject<HTMLElement | null>;
  onAddComment: () => void;
  onAiWrite: () => void;
};

const TOOLBAR_ESTIMATED_WIDTH = 248;

export function TextSelectionToolbar({
  anchor,
  workspaceRef,
  onAddComment,
  onAiWrite,
}: TextSelectionToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<ToolbarAnchor>(anchor);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    const toolbar = toolbarRef.current;
    if (!workspace || !toolbar) {
      setPosition(anchor);
      return undefined;
    }

    const toolbarWidth = toolbar.getBoundingClientRect().width || TOOLBAR_ESTIMATED_WIDTH;
    const toolbarHeight = toolbar.getBoundingClientRect().height || 40;
    const workspaceWidth = workspace.clientWidth;
    const workspaceHeight = workspace.clientHeight;

    let left = anchor.left - toolbarWidth / 2;
    let top = anchor.top;

    const maxLeft = workspaceWidth - toolbarWidth - 12;
    const maxTop = workspaceHeight - toolbarHeight - 12;

    left = Math.min(Math.max(left, 12), Math.max(maxLeft, 12));
    top = Math.min(Math.max(top, 12), Math.max(maxTop, 12));

    setPosition({ top, left });
  }, [anchor, workspaceRef]);

  return (
    <div
      ref={toolbarRef}
      className="text-selection-toolbar text-selection-toolbar--visible"
      style={{ top: position.top, left: position.left }}
      role="toolbar"
      aria-label="文本辅助功能"
      onMouseDown={(event) => event.preventDefault()}
    >
      <button type="button" className="text-selection-toolbar__action" onClick={onAiWrite}>
        <span className="text-selection-toolbar__ai-icon" aria-hidden="true" />
        <span>AI 帮我写</span>
      </button>
      <span className="text-selection-toolbar__divider" aria-hidden="true" />
      <button type="button" className="text-selection-toolbar__action" onClick={onAddComment}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>添加评论</span>
      </button>
    </div>
  );
}
