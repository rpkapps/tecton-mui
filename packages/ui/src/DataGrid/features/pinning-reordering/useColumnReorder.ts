import * as React from 'react';
import { DragIndicator, isInteractiveTarget } from './dragIndicator.js';

export interface ColumnReorderOptions {
  enabled: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  /** Whether a field may be dragged (system columns and `disableReorder` columns may not). */
  canMove: (field: string) => boolean;
  /** Section of a field ('left' | 'right' | 'center'); drops are restricted to the same section. */
  sectionOf: (field: string) => string;
  onMove: (field: string, targetField: string, placeAfter: boolean) => void;
}

const DRAG_THRESHOLD_PX = 6;

/**
 * Pointer-driven column header reordering. All drag feedback is DOM-only; React state changes
 * once, on drop. Returns a ref flag used to suppress the click (sort) that ends a drag.
 */
export function useColumnReorder(options: ColumnReorderOptions): React.RefObject<boolean> {
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const suppressClick = React.useRef(false);

  React.useEffect(() => {
    const root = options.rootRef.current;
    if (!root || !options.enabled) return undefined;
    const indicator = new DragIndicator();

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || isInteractiveTarget(event.target)) return;
      const header = (event.target as Element).closest<HTMLElement>(
        '.MuiDataGrid-columnHeader[data-field]',
      );
      const field = header?.dataset.field;
      if (!header || !field || !optionsRef.current.canMove(field)) return;
      const startX = event.clientX;
      let dragging = false;
      let target: { field: string; after: boolean } | null = null;

      const move = (e: PointerEvent) => {
        if (!dragging && Math.abs(e.clientX - startX) < DRAG_THRESHOLD_PX) return;
        dragging = true;
        root.classList.add('TectonDataGrid--columnDragging');
        const section = optionsRef.current.sectionOf(field);
        const headers = Array.from(
          root.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]'),
        ).filter(
          (h) =>
            optionsRef.current.sectionOf(h.dataset.field!) === section &&
            optionsRef.current.canMove(h.dataset.field!),
        );
        target = null;
        for (const h of headers) {
          const rect = h.getBoundingClientRect();
          if (e.clientX < rect.left + rect.width / 2) {
            target = { field: h.dataset.field!, after: false };
            indicator.show({ left: rect.left - 1, top: rect.top, width: 2, height: rect.height });
            break;
          }
        }
        if (!target && headers.length) {
          const last = headers[headers.length - 1];
          const rect = last.getBoundingClientRect();
          target = { field: last.dataset.field!, after: true };
          indicator.show({ left: rect.right - 1, top: rect.top, width: 2, height: rect.height });
        }
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        indicator.hide();
        root.classList.remove('TectonDataGrid--columnDragging');
        if (dragging) {
          suppressClick.current = true;
          setTimeout(() => (suppressClick.current = false), 0);
          if (target && target.field !== field)
            optionsRef.current.onMove(field, target.field, target.after);
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };
    root.addEventListener('pointerdown', onPointerDown);
    return () => {
      root.removeEventListener('pointerdown', onPointerDown);
      indicator.hide();
    };
  }, [options.enabled, options.rootRef]);

  return suppressClick;
}

/** Pure helper: moves `field` before/after `targetField` in `order`. */
export function moveField(
  order: readonly string[],
  field: string,
  targetField: string,
  after: boolean,
): string[] {
  const without = order.filter((f) => f !== field);
  const index = without.indexOf(targetField);
  if (index < 0) return [...order];
  without.splice(after ? index + 1 : index, 0, field);
  return without;
}
