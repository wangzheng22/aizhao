import { useCallback, useRef, useState } from 'react';

const HOLD_AT_COMPLETE_MS = 280;
const TICK_MS = 32;

export function useDocPrepProgress() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const stopTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const runProgress = useCallback(
    (durationMs: number) => {
      stopTimers();
      setVisible(true);
      setActive(true);
      setProgress(0);

      const startedAt = performance.now();

      intervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const next = Math.min(100, (elapsed / durationMs) * 100);
        setProgress(next);

        if (next < 100) return;

        stopTimers();
        setProgress(100);
        setActive(false);

        hideTimerRef.current = window.setTimeout(() => {
          setVisible(false);
          setProgress(0);
          hideTimerRef.current = null;
        }, HOLD_AT_COMPLETE_MS);
      }, TICK_MS);
    },
    [stopTimers],
  );

  return {
    progress,
    active,
    visible,
    showProgressBar: visible,
    runProgress,
  };
}
