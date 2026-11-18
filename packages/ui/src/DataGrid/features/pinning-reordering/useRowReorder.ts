import * as React from 'react';
import { DragIndicator } from './dragIndicator.js';

export interface RowReorderOptions {
  enabled: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  /** Called on drop with the dragged and target row DOM ids (`data-id`). */
  onDrop: (sourceDomId: string, targetDomId: string, placeAfter: boolean) => void;
}

const EDGE_PX = 40;

/** Pointer-driven row reordering from `[data-row-reorder-handle]`, with edge auto-scroll. */
export function useRowReorder(options: RowReorderOptions): void {
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  React.useEffect(() => {
    const root = options.rootRef.current;
    if (!root || !options.enabled) return undefined;
    const indicator = new DragIndicator();
    let raf = 0;

    const onPointerDown = (event: PointerEvent) => {
      const handle = (event.target as Element).closest<HTMLElement>('[data-row-reorder-handle]');
      if (!handle || event.button !== 0 || (handle as HTMLButtonElement).disabled) return;
      const sourceRow = handle.closest<HTMLElement>('.MuiDataGrid-row[data-id]');
      if (!sourceRow) return;
      event.preventDefault();
      const sourceId = sourceRow.dataset.id!;
      const scroller = root.querySelector<HTMLElement>('.MuiDataGrid-virtualScroller');
      let target: { id: string; after: boolean } | null = null;
      let lastY = event.clientY;
      root.classList.add('TectonDataGrid--rowDragging');

      const locate = (x: number, y: number) => {
        const el = document.elementFromPoint(x, y);
        const row = el?.closest<HTMLElement>('.MuiDataGrid-row[data-id]');
        if (!row || !root.contains(row)) return;
        const rect = row.getBoundingClientRect();
        const after = y > rect.top + rect.height / 2;
        target = { id: row.dataset.id!, after };
        indicator.show({
          left: rect.left,
          top: (after ? rect.bottom : rect.top) - 1,
          width: rect.width,
          height: 2,
        });
      };
      const autoScroll = () => {
        if (scroller) {
          const rect = scroller.getBoundingClientRect();
          if (lastY < rect.top + EDGE_PX) scroller.scrollTop -= 10;
          else if (lastY > rect.bottom - EDGE_PX) scroller.scrollTop += 10;
        }
        raf = requestAnimationFrame(autoScroll);
      };
      raf = requestAnimationFrame(autoScroll);
      const move = (e: PointerEvent) => {
        lastY = e.clientY;
        locate(e.clientX, e.clientY);
      };
      const up = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        indicator.hide();
        root.classList.remove('TectonDataGrid--rowDragging');
        const t = target as { id: string; after: boolean } | null;
        if (t && t.id !== sourceId) optionsRef.current.onDrop(sourceId, t.id, t.after);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };
    root.addEventListener('pointerdown', onPointerDown);
    return () => {
      root.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(raf);
      indicator.hide();
    };
  }, [options.enabled, options.rootRef]);
}

/** Pure helper: moves the item with `id` before/after `targetId`. */
export function moveId<T>(order: readonly T[], id: T, targetId: T, after: boolean): T[] {
  const without = order.filter((x) => x !== id);
  const index = without.indexOf(targetId);
  if (index < 0) return [...order];
  without.splice(after ? index + 1 : index, 0, id);
  return without;
}
