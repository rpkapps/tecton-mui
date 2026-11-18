import * as React from 'react';
import { gridClasses, type GridColDef } from '@mui/x-data-grid';
import type { ApiRef } from '../../core/columns.js';
import type { GridPinnedColumnFields } from '../../public-types.js';

export const EMPTY_PINNED: GridPinnedColumnFields = { left: [], right: [] };

/** Moves left-pinned fields first and right-pinned fields last, keeping the remaining order. */
export function applyPinnedOrder(
  fields: readonly string[],
  pinned: GridPinnedColumnFields,
): string[] {
  const present = new Set(fields);
  const left = (pinned.left ?? []).filter((f) => present.has(f));
  const right = (pinned.right ?? []).filter((f) => present.has(f) && !left.includes(f));
  const middle = fields.filter((f) => !left.includes(f) && !right.includes(f));
  return [...left, ...middle, ...right];
}

export function normalizePinned(
  pinned: GridPinnedColumnFields,
  fields: readonly string[],
): { left: string[]; right: string[] } {
  const present = new Set(fields);
  const left = (pinned.left ?? []).filter((f) => present.has(f));
  return { left, right: (pinned.right ?? []).filter((f) => present.has(f) && !left.includes(f)) };
}

/** Pinned-column CSS classes per field. Community's root styles make these sticky and opaque. */
export function pinnedColumnClasses(pinned: {
  left: string[];
  right: string[];
}): Map<string, { cell: string; header: string }> {
  const map = new Map<string, { cell: string; header: string }>();
  pinned.left.forEach((field, i) => {
    const last = i === pinned.left.length - 1;
    map.set(field, {
      cell: `${gridClasses['cell--pinnedLeft']} tdg-pl-${i}${last ? ` ${gridClasses['cell--withRightBorder']}` : ''}`,
      header: `${gridClasses['columnHeader--pinnedLeft']} tdg-pl-${i}${last ? ` ${gridClasses['columnHeader--withRightBorder']}` : ''}`,
    });
  });
  pinned.right.forEach((field, i) => {
    const first = i === 0;
    map.set(field, {
      cell: `${gridClasses['cell--pinnedRight']} tdg-pr-${i}${first ? ` ${gridClasses['cell--withLeftBorder']}` : ''}`,
      header: `${gridClasses['columnHeader--pinnedRight']} tdg-pr-${i}${first ? ` ${gridClasses['columnHeader--withLeftBorder']}` : ''}`,
    });
  });
  return map;
}

/** Offset rules: offsets themselves are CSS variables written by `usePinnedColumnOffsets`. */
export function pinnedColumnsSx(
  leftCount: number,
  rightCount: number,
): Record<string, unknown> | undefined {
  if (!leftCount && !rightCount) return undefined;
  const sx: Record<string, unknown> = {};
  for (let i = 0; i < leftCount; i++) sx[`& .tdg-pl-${i}`] = { left: `var(--tdg-pl-${i}, 0px)` };
  for (let i = 0; i < rightCount; i++) sx[`& .tdg-pr-${i}`] = { right: `var(--tdg-pr-${i}, 0px)` };
  return sx;
}

/**
 * Keeps sticky offsets in sync with column widths by writing CSS variables directly on the grid
 * root on resize/column events: resizing a pinned column never re-renders React.
 */
export function usePinnedColumnOffsets(
  apiRef: ApiRef,
  rootRef: React.RefObject<HTMLDivElement | null>,
  pinned: { left: string[]; right: string[] },
): void {
  const key = `${pinned.left.join(',')}|${pinned.right.join(',')}`;
  React.useEffect(() => {
    const api = apiRef.current;
    const root = rootRef.current;
    if (!api || !root || (!pinned.left.length && !pinned.right.length)) return undefined;
    const width = (field: string) => {
      const col = api.getColumn(field) as (GridColDef & { computedWidth?: number }) | undefined;
      const visible = api.getVisibleColumns().some((c: GridColDef) => c.field === field);
      return visible ? (col?.computedWidth ?? 0) : 0;
    };
    const update = () => {
      let acc = 0;
      pinned.left.forEach((field, i) => {
        root.style.setProperty(`--tdg-pl-${i}`, `${acc}px`);
        acc += width(field);
      });
      acc = 0;
      for (let i = pinned.right.length - 1; i >= 0; i--) {
        root.style.setProperty(`--tdg-pr-${i}`, `${acc}px`);
        acc += width(pinned.right[i]);
      }
    };
    update();
    const events = [
      'columnWidthChange',
      'columnResize',
      'columnsChange',
      'columnVisibilityModelChange',
      'viewportInnerSizeChange',
    ] as const;
    const unsubs = events.map((name) => api.subscribeEvent(name as never, update as never));
    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRef, rootRef, key]);
}
