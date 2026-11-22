'use client';
// Resizing right-pinned columns. The wrapper pins columns with sticky positioning on the Community
// grid, which keeps every resize handle on the column's end edge. For a right-pinned column that
// edge is the grid's own edge, so the handle could not be grabbed. As in the MUI grid, the handle of
// a right-pinned column sits on its start edge (CSS below) and dragging it towards the start widens
// the column. Community's resize logic reads the handle's side from internal state, so this drag is
// handled here with the public `setColumnWidth` API (double-click auto-sizing stays Community's).
import * as React from 'react';
import type { GridApi, GridColDef } from '@mui/x-data-grid';
import type { GridRootRef } from '../../core/rootElement.js';

const HANDLE =
  '.MuiDataGrid-columnHeader[class*="tdg-pr-"] .MuiDataGrid-columnSeparator--resizable';

/** Moves the resize handle of right-pinned column headers to their start edge. */
export const pinnedRightResizeSx = {
  '& .MuiDataGrid-columnHeader[class*="tdg-pr-"] .MuiDataGrid-columnSeparator': {
    left: 0,
    right: 'auto',
    transform: 'translateX(-50%)',
  },
  '[dir="rtl"] & .MuiDataGrid-columnHeader[class*="tdg-pr-"] .MuiDataGrid-columnSeparator': {
    left: 'auto',
    right: 0,
    transform: 'translateX(50%)',
  },
  // The last header hides its handle line until hovered; a right-pinned last column keeps it.
  '& .MuiDataGrid-columnHeader--last[class*="tdg-pr-"] .MuiDataGrid-columnSeparator': {
    color: 'inherit',
  },
};

export function usePinnedRightResize(
  rootRef: GridRootRef,
  apiRef: React.RefObject<GridApi | null>,
  enabled: boolean,
): void {
  React.useEffect(() => {
    if (!enabled) return undefined;
    return rootRef.observe((root) => {
      let cleanup: (() => void) | null = null;
      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        const handle = (event.target as HTMLElement).closest<HTMLElement>(HANDLE);
        const header = handle?.closest<HTMLElement>('.MuiDataGrid-columnHeader');
        const api = apiRef.current;
        const field = header?.dataset.field;
        if (!handle || !header || !api || !field) return;
        const column = api.getColumn(field) as GridColDef & { computedWidth?: number };
        // Take over from Community's handle (no compatibility mouse events follow).
        event.preventDefault();
        event.stopPropagation();
        const rtl = getComputedStyle(root).direction === 'rtl';
        const startX = event.clientX;
        const startWidth = column.computedWidth ?? column.width ?? 100;
        const min = column.minWidth ?? 50;
        const max = column.maxWidth ?? Number.POSITIVE_INFINITY;
        const doc = root.ownerDocument;
        const onMove = (move: PointerEvent) => {
          // Towards the start edge (left in LTR) widens the column.
          const delta = (startX - move.clientX) * (rtl ? -1 : 1);
          api.setColumnWidth(field, Math.min(max, Math.max(min, Math.round(startWidth + delta))));
        };
        const stop = () => {
          doc.removeEventListener('pointermove', onMove);
          doc.removeEventListener('pointerup', stop);
          doc.removeEventListener('pointercancel', stop);
          cleanup = null;
        };
        doc.addEventListener('pointermove', onMove);
        doc.addEventListener('pointerup', stop);
        doc.addEventListener('pointercancel', stop);
        cleanup = stop;
      };
      root.addEventListener('pointerdown', onPointerDown, true);
      return () => {
        root.removeEventListener('pointerdown', onPointerDown, true);
        cleanup?.();
      };
    });
  }, [rootRef, apiRef, enabled]);
}
