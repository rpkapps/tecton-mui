import * as React from 'react';
import type { GridRootRef } from '../../core/rootElement.js';

type Edge = 'start' | 'middle' | 'end' | 'none';

function edgeOf(position: number, max: number): Edge {
  if (max <= 1) return 'none';
  if (position <= 1) return 'start';
  if (position >= max - 1) return 'end';
  return 'middle';
}

/**
 * Publishes the virtual scroller's horizontal/vertical scroll edges as `data-tdg-scroll-x` /
 * `data-tdg-scroll-y` attributes on the grid root. Pinned-section shadows are pure CSS keyed on
 * these attributes, so scrolling never re-renders React; attributes change only at edge
 * transitions (rAF-throttled).
 */
export function useScrollEdges(rootRef: GridRootRef, enabled: boolean): void {
  React.useEffect(() => {
    if (!enabled) return undefined;
    return rootRef.observe((root) => {
      let scroller: HTMLElement | null = null;
      let frame = 0;
      const update = () => {
        frame = 0;
        if (!scroller) return;
        const rtl = getComputedStyle(scroller).direction === 'rtl';
        const left = rtl ? -scroller.scrollLeft : scroller.scrollLeft;
        const x = edgeOf(Math.abs(left), scroller.scrollWidth - scroller.clientWidth);
        const y = edgeOf(scroller.scrollTop, scroller.scrollHeight - scroller.clientHeight);
        if (root.dataset.tdgScrollX !== x) root.dataset.tdgScrollX = x;
        if (root.dataset.tdgScrollY !== y) root.dataset.tdgScrollY = y;
      };
      const schedule = () => {
        frame ||= requestAnimationFrame(update);
      };
      const attach = () => {
        const next = root.querySelector<HTMLElement>('.MuiDataGrid-virtualScroller');
        if (next === scroller) return;
        scroller?.removeEventListener('scroll', schedule);
        scroller = next;
        scroller?.addEventListener('scroll', schedule, { passive: true });
        schedule();
      };
      attach();
      const resize =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => {
              attach();
              schedule();
            })
          : null;
      resize?.observe(root);
      return () => {
        cancelAnimationFrame(frame);
        scroller?.removeEventListener('scroll', schedule);
        resize?.disconnect();
        delete root.dataset.tdgScrollX;
        delete root.dataset.tdgScrollY;
      };
    });
  }, [rootRef, enabled]);
}
