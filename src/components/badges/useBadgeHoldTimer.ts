import { useCallback, useRef, useState } from 'react';

/**
 * Encapsulates the 4-second hold-timer logic for badge activation.
 *
 * How it works:
 *   1. On pointerenter/pointerdown → start a 4s timeout
 *   2. Every frame while held, update progress (0 → 1)
 *   3. If pointer leaves or releases before 4s → cancel immediately
 *   4. If 4s completes → fire onActivate callback, reset progress
 *
 * The progress value (0–1) drives the radial progress ring visual.
 */

const HOLD_DURATION_MS = 2000;

export interface UseBadgeHoldTimerReturn {
  /** Current hold progress 0–1 (drives the progress ring) */
  progress: number;
  /** Whether the timer is currently running */
  isHolding: boolean;
  /** The badge index currently being held, or null */
  holdingIndex: number | null;
  /** Call on pointer enter/down on a badge */
  startHold: (index: number) => void;
  /** Call on pointer leave/up — cancels the timer */
  cancelHold: () => void;
}

export function useBadgeHoldTimer(
  onActivate: (index: number) => void
): UseBadgeHoldTimerReturn {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(-1);

  // Animation loop that updates progress each frame
  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
    setProgress(p);

    if (p >= 1) {
      // Timer complete — fire callback and reset
      const idx = activeIndexRef.current;
      cancelHold();
      if (idx >= 0) onActivate(idx);
      return;
    }

    // Continue the loop
    rafRef.current = requestAnimationFrame(tick);
  }, [onActivate]);

  const cancelHold = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    activeIndexRef.current = -1;
    setHoldingIndex(null);
    setIsHolding(false);
    setProgress(0);
  }, []);

  const startHold = useCallback(
    (index: number) => {
      // Already holding this badge — do nothing
      if (activeIndexRef.current === index) return;

      // Cancel any existing hold first
      cancelHold();

      activeIndexRef.current = index;
      setHoldingIndex(index);
      setIsHolding(true);
      startTimeRef.current = Date.now();

      // Start the progress animation loop
      rafRef.current = requestAnimationFrame(tick);
    },
    [cancelHold, tick]
  );

  return { progress, isHolding, holdingIndex, startHold, cancelHold };
}
