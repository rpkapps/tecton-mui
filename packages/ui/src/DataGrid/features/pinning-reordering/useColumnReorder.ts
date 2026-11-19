import * as React from 'react';
import {
  DragPreview,
  SLOT_BACKGROUND,
  SLOT_EDGE,
  SLOT_TEXT,
  cssString,
  isInteractiveTarget,
  logicalScrollLeft,
} from './dragPreview.js';

export interface ColumnReorderOptions {
  enabled: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  /** Whether a field may be dragged (system columns and `disableReorder` columns may not). */
  canMove: (field: string) => boolean;
  /** Section of a field ('left' | 'right' | 'center'); drops are restricted to the same section. */
  sectionOf: (field: string) => string;
  onMove: (field: string, targetField: string, placeAfter: boolean) => void;
  /**
   * Visible columns in visual order with their widths. With column virtualization only some
   * headers are in the DOM; this lets columns scrolled into view during the drag be targets.
   */
  columnLayout?: () => ReadonlyArray<{ field: string; width: number }> | null;
}

const DRAG_THRESHOLD_PX = 6;
const EDGE_PX = 48;
const MAX_SCROLL_STEP = 16;
const MOVING_CLASS = 'MuiDataGrid-columnHeader--moving';
const TRANSITION_TARGETS = '.MuiDataGrid-columnHeader, .MuiDataGrid-cell';

interface Slot {
  field: string;
  /** Logical inline start in content coordinates (scroll-independent for the center section). */
  start: number;
  size: number;
}

/**
 * Pointer-driven column header reordering. While dragging, a ghost of the header follows the
 * pointer and the other columns of the same pinned section slide aside (CSS transforms on headers
 * and cells) to show where the column will land. Escape cancels; dragging near the edges of the
 * scroller scrolls it. React state changes once, on drop. Returns a ref flag used to suppress the
 * click (sort) that ends a drag.
 */
export function useColumnReorder(options: ColumnReorderOptions): React.RefObject<boolean> {
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });
  const suppressClick = React.useRef(false);

  React.useEffect(() => {
    const root = options.rootRef.current;
    if (!root || !options.enabled) return undefined;
    let abortActive: (() => void) | null = null;
    // A finished drag keeps its preview briefly (slide back / until the new order renders).
    let lingering: DragPreview | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || isInteractiveTarget(event.target)) return;
      const header = (event.target as Element).closest<HTMLElement>(
        '.MuiDataGrid-columnHeader[data-field]',
      );
      const field = header?.dataset.field;
      if (!header || !field || !optionsRef.current.canMove(field)) return;
      const pointer = { x: event.clientX, y: event.clientY };
      const startX = event.clientX;
      lingering?.dispose();
      const preview = new DragPreview(root);
      lingering = preview;
      let session: {
        rtl: boolean;
        scroller: HTMLElement | null;
        center: boolean;
        slots: Slot[];
        source: Slot;
        sourceIndex: number;
        targetIndex: number;
      } | null = null;
      let raf = 0;

      const begin = () => {
        const opts = optionsRef.current;
        const section = opts.sectionOf(field);
        const rtl = getComputedStyle(root).direction === 'rtl';
        const scroller = root.querySelector<HTMLElement>('.MuiDataGrid-virtualScroller');
        const center = section === 'center';
        const scroll = center ? logicalScrollLeft(scroller, rtl) : 0;
        const sourceRect = header.getBoundingClientRect();
        const slots =
          layoutSlots(opts, section, field, (rtl ? -sourceRect.right : sourceRect.left) + scroll) ??
          Array.from(root.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]'))
            .filter(
              (h) => opts.sectionOf(h.dataset.field!) === section && opts.canMove(h.dataset.field!),
            )
            .map((h) => {
              const rect = h.getBoundingClientRect();
              return {
                field: h.dataset.field!,
                start: (rtl ? -rect.right : rect.left) + scroll,
                size: rect.width,
              };
            })
            .sort((a, b) => a.start - b.start);
        const sourceIndex = slots.findIndex((s) => s.field === field);
        if (sourceIndex < 0) return false;
        session = {
          rtl,
          scroller,
          center,
          slots,
          source: slots[sourceIndex]!,
          sourceIndex,
          targetIndex: sourceIndex,
        };

        root.classList.add('TectonDataGrid--columnDragging');
        header.classList.add(MOVING_CLASS);
        preview.begin();
        // The dragged column slides with the others: tint it and outline its edges so the slot
        // where it will land is obvious, and mute its content (the ghost carries the label).
        const f = cssString(field);
        preview.setSlot(
          [`.MuiDataGrid-columnHeader[data-field="${f}"]`, `.MuiDataGrid-cell[data-field="${f}"]`],
          `background-color:${SLOT_BACKGROUND} !important;` +
            `box-shadow:inset 2px 0 0 ${SLOT_EDGE},inset -2px 0 0 ${SLOT_EDGE};` +
            `color:${SLOT_TEXT} !important;`,
          [['*', 'opacity:0.5;']],
        );
        const ghost = document.createElement('div');
        ghost.textContent =
          header.querySelector('.MuiDataGrid-columnHeaderTitle')?.textContent ??
          header.textContent ??
          field;
        ghost.style.fontWeight = getComputedStyle(
          header.querySelector('.MuiDataGrid-columnHeaderTitle') ?? header,
        ).fontWeight;
        preview.showGhost(ghost, header.getBoundingClientRect(), pointer, {});
        window.addEventListener('keydown', onKeyDown, true);
        raf = requestAnimationFrame(tick);
        return true;
      };

      const writeShifts = () => {
        const s = session!;
        const others = s.slots.filter((slot) => slot !== s.source);
        const final = [...others];
        final.splice(s.targetIndex, 0, s.source);
        let position = s.slots[0]!.start;
        const shifts: Array<{ targets: string[]; transform: string }> = [];
        for (const slot of final) {
          const shift = position - slot.start;
          position += slot.size;
          if (Math.abs(shift) < 0.5) continue;
          const f = cssString(slot.field);
          shifts.push({
            targets: [
              `.MuiDataGrid-columnHeader[data-field="${f}"]`,
              `.MuiDataGrid-cell[data-field="${f}"]`,
            ],
            transform: `translateX(${s.rtl ? -shift : shift}px)`,
          });
        }
        preview.setShifts(TRANSITION_TARGETS, shifts);
      };

      const update = () => {
        const s = session!;
        const scroll = s.center ? logicalScrollLeft(s.scroller, s.rtl) : 0;
        const p = (s.rtl ? -pointer.x : pointer.x) + scroll;
        let target = 0;
        for (const slot of s.slots) {
          if (slot === s.source) continue;
          if (p > slot.start + slot.size / 2) target++;
        }
        if (target !== s.targetIndex) {
          s.targetIndex = target;
          writeShifts();
        }
        preview.moveGhost(pointer.x, pointer.y);
      };

      const tick = () => {
        const s = session;
        if (!s) return;
        if (s.center && s.scroller) {
          const rect = s.scroller.getBoundingClientRect();
          const before = pointer.x - rect.left;
          const after = rect.right - pointer.x;
          const step = (distance: number) =>
            Math.ceil(MAX_SCROLL_STEP * (1 - Math.max(0, distance) / EDGE_PX));
          const left = s.scroller.scrollLeft;
          if (before < EDGE_PX) s.scroller.scrollLeft -= step(before);
          else if (after < EDGE_PX) s.scroller.scrollLeft += step(after);
          preview.animate = s.scroller.scrollLeft === left;
        }
        update();
        raf = requestAnimationFrame(tick);
      };

      const detach = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('keydown', onKeyDown, true);
        root.classList.remove('TectonDataGrid--columnDragging');
        header.classList.remove(MOVING_CLASS);
        abortActive = null;
      };
      const finish = (commit: boolean) => {
        const s = session;
        detach();
        if (!s) return;
        suppressClick.current = true;
        setTimeout(() => (suppressClick.current = false), 0);
        const others = s.slots.filter((slot) => slot !== s.source);
        if (!commit || s.targetIndex === s.sourceIndex || others.length === 0) {
          preview.cancel(TRANSITION_TARGETS);
          return;
        }
        const final = [...others];
        final.splice(s.targetIndex, 0, s.source);
        const expected = final.map((slot) => slot.field);
        // Keep the slide applied until the grid renders the new order, then drop it before paint.
        preview.end(() => {
          const rendered = Array.from(
            root.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]'),
          )
            .map((h) => h.dataset.field!)
            .filter((f) => expected.includes(f));
          return rendered.join('\u0000') === expected.join('\u0000');
        });
        if (s.targetIndex < others.length)
          optionsRef.current.onMove(field, others[s.targetIndex]!.field, false);
        else optionsRef.current.onMove(field, others[others.length - 1]!.field, true);
      };

      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        if (!session) {
          if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD_PX) return;
          if (!begin()) {
            detach();
            return;
          }
        }
        update();
      };
      const onUp = () => finish(true);
      const onCancel = () => finish(false);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        finish(false);
      };
      abortActive = () => finish(false);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    };
    root.addEventListener('pointerdown', onPointerDown);
    return () => {
      root.removeEventListener('pointerdown', onPointerDown);
      abortActive?.();
      lingering?.dispose();
    };
  }, [options.enabled, options.rootRef]);

  return suppressClick;
}

/**
 * Slots for every visible column of `section` from the grid's column layout, anchored on the
 * dragged header's rendered position (`sourceStart`, logical content coordinates).
 */
export function layoutSlots(
  opts: ColumnReorderOptions,
  section: string,
  field: string,
  sourceStart: number,
): Slot[] | null {
  const layout = opts.columnLayout?.();
  if (!layout) return null;
  const inSection = layout.filter((c) => opts.sectionOf(c.field) === section);
  let offset = 0;
  let sourceOffset: number | null = null;
  const positioned = inSection.map((c) => {
    if (c.field === field) sourceOffset = offset;
    const slot = { field: c.field, start: offset, size: c.width };
    offset += c.width;
    return slot;
  });
  if (sourceOffset === null) return null;
  const origin = sourceStart - sourceOffset;
  return positioned
    .filter((slot) => opts.canMove(slot.field))
    .map((slot) => ({ ...slot, start: origin + slot.start }));
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
