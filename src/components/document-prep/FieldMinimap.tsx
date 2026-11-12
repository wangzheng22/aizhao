import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChapterFieldStatus } from '../../types/chapterReview';
import type { FieldMinimapEntry } from '../../utils/buildFieldMinimapEntries';
import './FieldMinimap.css';

const PANEL_HIDE_DELAY_MS = 360;

type FieldMinimapProps = {
  entries: FieldMinimapEntry[];
  activeFieldId?: string | null;
  onFieldSelect: (entry: FieldMinimapEntry) => void;
};

function statusLabel(status: ChapterFieldStatus) {
  if (status === 'missing') return '未完成';
  if (status === 'issue') return '问题';
  if (status === 'pending') return '待确认';
  return '正常';
}

export function FieldMinimap({ entries, activeFieldId = null, onFieldSelect }: FieldMinimapProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoverFieldId, setHoverFieldId] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showPanel = useCallback(() => {
    cancelHide();
    setPanelOpen(true);
  }, [cancelHide]);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      setPanelOpen(false);
      setHoverFieldId(null);
      hideTimerRef.current = null;
    }, PANEL_HIDE_DELAY_MS);
  }, [cancelHide]);

  useEffect(() => () => cancelHide(), [cancelHide]);

  const grouped = useMemo(() => {
    const map = new Map<string, { chapterName: string; items: FieldMinimapEntry[] }>();
    entries.forEach((entry) => {
      const hit = map.get(entry.chapterId);
      if (hit) {
        hit.items.push(entry);
      } else {
        map.set(entry.chapterId, { chapterName: entry.chapterName, items: [entry] });
      }
    });
    return [...map.entries()];
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      className={['field-minimap', panelOpen ? 'field-minimap--open' : ''].filter(Boolean).join(' ')}
      aria-hidden={false}
      onMouseEnter={showPanel}
      onMouseLeave={scheduleHide}
    >
      <div className="field-minimap__track">
        {entries.map((entry) => (
          <button
            key={entry.fieldId}
            type="button"
            className={[
              'field-minimap__mark',
              `field-minimap__mark--${entry.status}`,
              hoverFieldId === entry.fieldId ? 'field-minimap__mark--hover' : '',
              activeFieldId === entry.fieldId ? 'field-minimap__mark--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ top: `${entry.topRatio * 100}%` }}
            title={`${entry.fieldName}（${statusLabel(entry.status)}）`}
            aria-label={`${entry.fieldName}，${statusLabel(entry.status)}`}
            onMouseEnter={() => setHoverFieldId(entry.fieldId)}
            onFocus={() => {
              showPanel();
              setHoverFieldId(entry.fieldId);
            }}
            onBlur={scheduleHide}
            onClick={() => onFieldSelect(entry)}
          />
        ))}
      </div>

      {panelOpen && (
        <div className="field-minimap__popover">
          <div className="field-minimap__popover-head">字段目录</div>
          <div className="field-minimap__popover-body">
            {grouped.map(([chapterId, group]) => (
              <div key={chapterId} className="field-minimap__chapter">
                <div className="field-minimap__chapter-title" title={group.chapterName}>
                  {group.chapterName}
                </div>
                {group.items.map((entry) => (
                  <button
                    key={entry.fieldId}
                    type="button"
                    className={[
                      'field-minimap__row',
                      hoverFieldId === entry.fieldId ? 'field-minimap__row--hover' : '',
                      activeFieldId === entry.fieldId ? 'field-minimap__row--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setHoverFieldId(entry.fieldId)}
                    onClick={() => onFieldSelect(entry)}
                  >
                    <span
                      className={['field-minimap__dot', `field-minimap__dot--${entry.status}`].join(
                        ' ',
                      )}
                      aria-hidden="true"
                    />
                    <span className="field-minimap__row-label">{entry.fieldName}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
