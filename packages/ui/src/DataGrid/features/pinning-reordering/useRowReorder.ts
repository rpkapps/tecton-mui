import * as React from 'react';
import { DragPreview, SLOT_BACKGROUND, SLOT_EDGE, SLOT_TEXT, cssString } from './dragPreview.js';
import type { GridRootRef } from '../../core/rootElement.js';

export interface RowReorderOptions {
  enabled: boolean;
  rootRef: GridRootRef;
  /** Called on drop with the dragged and target row DOM ids (`data-id`). */
  onDrop: (sourceDomId: string, targetDomId: string, placeAfter: boolean) => void;
  /** Text shown in the drag ghost for a row (defaults to the first data cell's text). */
  getLabel?: (domId: string) => string | undefined;
}

const DRAG_THRESHOLD_PX = 4;
const EDGE_PX = 48;
const MAX_SCROLL_STEP = 16;
const BEING_DRAGGED_CLASS = 'MuiDataGrid-row--beingDragged';
const TRANSITION_TARGETS = '.MuiDataGrid-virtualScrollerRenderZone > .MuiDataGrid-row';
const DETAIL_ROW_CLASS = 'TectonDataGrid-row--detail';

/** A data row plus the detail panel row that follows it, if any. */
interface Block {
  id: string;
  index: number;
  elements: HTMLElement[];
  top: number;
  height: number;
}

/**
 * The part of the scroller that shows rows: below the headers (and header filters / pinned top
 * rows), above the pinned bottom rows and the horizontal scrollbar.
 */
function rowsViewport(root: HTMLElement, scroller: HTMLElement) {
  const rect = scroller.getBoundingClientRect();
  const top = root.querySelector('.MuiDataGrid-topContainer')?.getBoundingClientRect().bottom;
  const bottom = root.querySelector('.MuiDataGrid-bottomContainer')?.getBoundingClientRect().top;
  return {
    left: rect.left,
    width: scroller.clientWidth,
    top: Math.max(rect.top, top ?? rect.top),
    bottom: Math.min(rect.bottom, bottom ?? rect.bottom),
  };
}

/**
 * Pointer-driven row reordering from `[data-row-reorder-handle]`. While dragging, the source row
 * is dimmed (`row--beingDragged`), the rows between it and the drop position slide to open the
 * slot, and a ghost with the row's label follows the pointer. Escape cancels; dragging near the
 * top or bottom edge scrolls. React state changes once, on drop.
 */
export function useRowReorder(options: RowReorderOptions): void {
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });
  React.useEffect(() => {
    if (!options.enabled) return undefined;
    return options.rootRef.observe((root) => {
      let abortActive: (() => void) | null = null;
      // A finished drag keeps its preview briefly (slide back / until the new order renders).
      let lingering: DragPreview | null = null;

      const onPointerDown = (event: PointerEvent) => {
        const handle = (event.target as Element).closest<HTMLElement>('[data-row-reorder-handle]');
        if (!handle || event.button !== 0 || (handle as HTMLButtonElement).disabled) return;
        const sourceRow = handle.closest<HTMLElement>('.MuiDataGrid-row[data-id]');
        if (
          !sourceRow ||
          !sourceRow.parentElement?.matches('.MuiDataGrid-virtualScrollerRenderZone')
        )
          return;
        // Prevent text selection and native drag, but keep keyboard focus on the handle so the
        // Alt+Arrow alternative works right after a click.
        event.preventDefault();
        handle.focus({ preventScroll: true });
        const sourceId = sourceRow.dataset.id!;
        const sourceIndex = Number(sourceRow.dataset.rowindex);
        const scroller = root.querySelector<HTMLElement>('.MuiDataGrid-virtualScroller');
        const pointer = { x: event.clientX, y: event.clientY };
        const startY = event.clientY;
        lingering?.dispose();
        const preview = new DragPreview(root);
        lingering = preview;
        let dragging = false;
        let sourceHeight = sourceRow.getBoundingClientRect().height;
        /** Insert before the row with this index (`index + 1` of the last row = at the end). */
        let insertAt = sourceIndex;
        let raf = 0;

        const readBlocks = (): Block[] => {
          const zone = root.querySelector<HTMLElement>('.MuiDataGrid-virtualScrollerRenderZone');
          if (!zone) return [];
          const rows = Array.from(zone.children).filter(
            (el): el is HTMLElement =>
              el instanceof HTMLElement && el.matches('.MuiDataGrid-row[data-id]'),
          );
          if (!rows.length) return [];
          // offsetTop ignores transforms, so slid rows still report their natural position.
          const zoneTop = zone.getBoundingClientRect().top - rows[0]!.offsetTop;
          const blocks: Block[] = [];
          for (const row of rows) {
            const top = zoneTop + row.offsetTop;
            const last = blocks[blocks.length - 1];
            if (row.classList.contains(DETAIL_ROW_CLASS) && last) {
              last.elements.push(row);
              last.height = top + row.offsetHeight - last.top;
              continue;
            }
            blocks.push({
              id: row.dataset.id!,
              index: Number(row.dataset.rowindex),
              elements: [row],
              top,
              height: row.offsetHeight,
            });
          }
          return blocks;
        };

        const writeShifts = (blocks: Block[], sourceRendered: boolean) => {
          const shifts: Array<{ targets: string[]; transform: string }> = [];
          if (!sourceRendered) {
            preview.setShifts(TRANSITION_TARGETS, shifts);
            return;
          }
          const selectorsOf = (block: Block) =>
            block.elements.map((el) => `.MuiDataGrid-row[data-id="${cssString(el.dataset.id!)}"]`);
          const downward = insertAt > sourceIndex;
          const upward = insertAt < sourceIndex;
          let moved = 0;
          for (const block of blocks) {
            if (block.id === sourceId) continue;
            const affected = downward
              ? block.index > sourceIndex && block.index < insertAt
              : upward && block.index >= insertAt && block.index < sourceIndex;
            if (!affected) continue;
            moved += block.height;
            shifts.push({
              targets: selectorsOf(block),
              transform: `translateY(${downward ? -sourceHeight : sourceHeight}px)`,
            });
          }
          const source = blocks.find((b) => b.id === sourceId);
          if (source && moved)
            shifts.push({
              targets: selectorsOf(source),
              transform: `translateY(${downward ? moved : -moved}px)`,
            });
          preview.setShifts(TRANSITION_TARGETS, shifts);
        };

        // With virtualization the dragged row unmounts once scrolled out of view. Rows then do not
        // slide (the ones that would fill the opened gap may not be rendered either); a drop line
        // between the rows shows where the row lands instead.
        const placeDropLine = (blocks: Block[], sourceRendered: boolean) => {
          if (sourceRendered || !scroller || insertAt === sourceIndex) {
            preview.showSlotBox(null);
            return;
          }
          const others = blocks.filter((b) => b.id !== sourceId);
          const before = others.find((b) => b.index >= insertAt);
          const after = others.filter((b) => b.index < insertAt).pop();
          const y = before ? before.top : after ? after.top + after.height : null;
          const view = rowsViewport(root, scroller);
          if (y === null || y < view.top - 1 || y > view.bottom + 1) {
            preview.showSlotBox(null);
            return;
          }
          const thickness = 4;
          const top = Math.min(Math.max(y - thickness / 2, view.top), view.bottom - thickness);
          preview.showSlotBox({ left: view.left, width: view.width, top, height: thickness });
        };

        const update = () => {
          const blocks = readBlocks();
          const source = blocks.find((b) => b.id === sourceId);
          if (source) sourceHeight = source.height;
          let next: number | null = null;
          for (const block of blocks) {
            if (block.id === sourceId) continue;
            if (pointer.y < block.top + block.height / 2) {
              next = block.index;
              break;
            }
          }
          if (next === null) {
            const last = blocks.filter((b) => b.id !== sourceId).pop();
            next = last ? last.index + 1 : sourceIndex;
          }
          // Inserting directly before or after itself is a no-op.
          const following = blocks.find((b) => b.id !== sourceId && b.index > sourceIndex);
          if (following && next === following.index) next = sourceIndex;
          insertAt = next;
          writeShifts(blocks, !!source);
          placeDropLine(blocks, !!source);
          preview.moveGhost(pointer.x, pointer.y);
        };

        const tick = () => {
          if (scroller) {
            // Edge zones are measured from the rows area: the scroller box also covers the sticky
            // headers, which would push the upper zone off the rows.
            const rect = rowsViewport(root, scroller);
            const above = pointer.y - rect.top;
            const below = rect.bottom - pointer.y;
            const step = (distance: number) =>
              Math.ceil(MAX_SCROLL_STEP * (1 - Math.max(0, distance) / EDGE_PX));
            const before = scroller.scrollTop;
            if (above < EDGE_PX) scroller.scrollTop -= step(above);
            else if (below < EDGE_PX) scroller.scrollTop += step(below);
            preview.animate = scroller.scrollTop === before;
          }
          update();
          raf = requestAnimationFrame(tick);
        };

        const begin = () => {
          dragging = true;
          root.classList.add('TectonDataGrid--rowDragging');
          sourceRow.classList.add(BEING_DRAGGED_CLASS);
          preview.begin();
          // Mark the slot by row id, so a virtualized source row keeps the paint when it remounts.
          const rowSelector = `.MuiDataGrid-row[data-id="${cssString(sourceId)}"]`;
          preview.setSlot(
            [rowSelector],
            `background-color:${SLOT_BACKGROUND} !important;` +
              `box-shadow:inset 0 2px 0 ${SLOT_EDGE},inset 0 -2px 0 ${SLOT_EDGE};`,
            [
              [
                '.MuiDataGrid-cell',
                `color:${SLOT_TEXT} !important;background-color:transparent !important;`,
              ],
            ],
          );
          const ghost = document.createElement('div');
          const icon = handle.querySelector('svg, span, i')?.cloneNode(true);
          if (icon) ghost.appendChild(icon);
          const label = document.createElement('span');
          label.textContent =
            optionsRef.current.getLabel?.(sourceId) ??
            sourceRow.querySelector('.MuiDataGrid-cell:not([data-field^="__"])')?.textContent ??
            '';
          ghost.appendChild(label);
          const rect = sourceRow.getBoundingClientRect();
          preview.showGhost(ghost, rect, pointer, {
            width: Math.min(rect.width, 280),
            height: Math.min(rect.height, 40),
          });
          window.addEventListener('keydown', onKeyDown, true);
          raf = requestAnimationFrame(tick);
        };

        const detach = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          window.removeEventListener('keydown', onKeyDown, true);
          root.classList.remove('TectonDataGrid--rowDragging');
          sourceRow.classList.remove(BEING_DRAGGED_CLASS);
          abortActive = null;
        };
        const finish = (commit: boolean) => {
          detach();
          if (!dragging) return;
          const others = readBlocks().filter((b) => b.id !== sourceId);
          const moveDown = insertAt > sourceIndex;
          const target = moveDown
            ? others.filter((b) => b.index < insertAt).pop()
            : others.find((b) => b.index === insertAt);
          if (!commit || insertAt === sourceIndex || !target || target.id === sourceId) {
            preview.cancel(TRANSITION_TARGETS);
            return;
          }
          // Keep the slide until the source row is rendered next to its target, then drop it before paint.
          preview.end(() => {
            const ids = Array.from(
              root.querySelectorAll<HTMLElement>(
                `.MuiDataGrid-virtualScrollerRenderZone > .MuiDataGrid-row[data-id]:not(.${DETAIL_ROW_CLASS})`,
              ),
            ).map((row) => row.dataset.id);
            const i = ids.indexOf(sourceId);
            return i < 0 || ids[moveDown ? i - 1 : i + 1] === target.id;
          });
          optionsRef.current.onDrop(sourceId, target.id, moveDown);
        };

        const onMove = (e: PointerEvent) => {
          pointer.x = e.clientX;
          pointer.y = e.clientY;
          if (!dragging) {
            if (Math.abs(e.clientY - startY) < DRAG_THRESHOLD_PX) return;
            begin();
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
    });
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
