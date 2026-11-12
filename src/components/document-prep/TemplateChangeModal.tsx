import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TemplatePanel } from './panels/TemplatePanel';
import './TemplateChangeModal.css';

type TemplateChangeModalProps = {
  open: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function TemplateChangeModal({
  open,
  selectedId,
  onSelect,
  onClose,
}: TemplateChangeModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return createPortal(
    <div className="template-change-modal" role="presentation" onClick={onClose}>
      <div
        className="template-change-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-change-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="template-change-modal__header">
          <h3 id="template-change-modal-title" className="template-change-modal__title">
            变更范本
          </h3>
          <button
            type="button"
            className="template-change-modal__close"
            aria-label="关闭"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="template-change-modal__body">
          <TemplatePanel selectedId={selectedId} onSelect={handleSelect} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
