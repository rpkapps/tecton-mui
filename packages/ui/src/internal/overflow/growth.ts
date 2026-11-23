'use client';
// An item that grows into its place in a row of actions (the opening search field) marks itself
// with `data-overflow-growing` while it does, and renders at its full size while the row measures
// (`[data-measuring]`). The row then makes room for it once, before it starts, and lets it grow into
// that room without laying out again on every step, which would re-render the row on each frame.
// Shared by `Heading` and `AppBarActions`.
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';

/** The attribute of an item growing into its place. */
export const GROWING_ATTRIBUTE = 'data-overflow-growing';

/** Whether an item in `root` is growing, its animation running. */
function growing(root: Element) {
  const item = root.querySelector(`[${GROWING_ATTRIBUTE}]`);
  if (!item || typeof item.getAnimations !== 'function') return false;
  return item.getAnimations().some((animation) => animation.playState === 'running');
}

/**
 * The callback for a row's `ResizeObserver`: `requestMeasure`, held back while an item in `rootRef`
 * grows and called once it has.
 */
export function useMeasureAfterGrowth(
  rootRef: React.RefObject<HTMLElement | null>,
  requestMeasure: () => void,
) {
  const pending = React.useRef(false);
  useEnhancedEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const settle = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.hasAttribute(GROWING_ATTRIBUTE)) {
        return;
      }
      if (!pending.current) return;
      pending.current = false;
      requestMeasure();
    };
    root.addEventListener('animationend', settle);
    root.addEventListener('animationcancel', settle);
    return () => {
      root.removeEventListener('animationend', settle);
      root.removeEventListener('animationcancel', settle);
    };
  }, [rootRef, requestMeasure]);

  return React.useCallback(() => {
    const root = rootRef.current;
    if (root && growing(root)) {
      pending.current = true;
      return;
    }
    pending.current = false;
    requestMeasure();
  }, [rootRef, requestMeasure]);
}
