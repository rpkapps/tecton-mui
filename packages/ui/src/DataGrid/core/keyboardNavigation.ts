'use client';
// Arrow-key navigation through the rows the wrapper adds to the Community grid, which Community's
// own keyboard navigation does not know about:
// - the header filter row sits between the column headers and the first row;
// - detail panel rows are not navigation stops (as in the MUI grid): Up/Down step over them.
// It also moves a focused column header with Alt+Left/Right (column reordering from the keyboard).
// Runs in the capture phase on the grid root so it takes over these keys before Community moves
// the focus (Community's handler cannot be cancelled through `defaultMuiPrevented`).
import * as React from 'react';
import type { GridApi, GridRowId } from '@mui/x-data-grid';
import { focusHeaderFilter } from '../features/sorting-filtering/HeaderFilterRow.js';

export interface KeyboardNavigationOptions {
  rootRef: React.RefObject<HTMLDivElement | null>;
  apiRef: React.RefObject<GridApi | null>;
  headerFilters: boolean;
  /** Rows of the current page as given to Community, and whether a row is a detail panel. */
  pageRows: () => readonly object[];
  isDetailRow: (row: object) => boolean;
  getRowId: (row: object) => GridRowId;
  /** Moves a column one place within its section; false when it cannot move. */
  moveColumn?: (field: string, delta: number) => boolean;
}

const isPlain = (e: KeyboardEvent) => !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;

export function useKeyboardNavigation(options: KeyboardNavigationOptions): void {
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });
  React.useEffect(() => {
    const root = options.rootRef.current;
    if (!root) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        moveHeader(event);
        return;
      }
      if ((event.key !== 'ArrowDown' && event.key !== 'ArrowUp') || !isPlain(event)) return;
      const opts = optionsRef.current;
      const api = opts.apiRef.current;
      const target = event.target as HTMLElement;
      if (!api || target.closest('.TectonDataGrid-headerFilterCell')) return;
      const header = target.closest<HTMLElement>('.MuiDataGrid-columnHeader[data-field]');
      if (header) {
        // Column header -> its header filter.
        if (event.key !== 'ArrowDown' || !opts.headerFilters) return;
        if (focusHeaderFilter(root, header.dataset.field!)) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      const cell = target.closest<HTMLElement>('.MuiDataGrid-cell[data-field]');
      const row = cell?.closest<HTMLElement>('.MuiDataGrid-row[data-id]');
      if (!cell || !row || !row.parentElement?.matches('.MuiDataGrid-virtualScrollerRenderZone'))
        return;
      // A cell in edit mode (or a control in it) keeps the arrow keys.
      if (cell.classList.contains('MuiDataGrid-cell--editing')) return;
      const field = cell.dataset.field!;
      const rows = opts.pageRows();
      const index = Number(row.dataset.rowindex);
      if (Number.isNaN(index)) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      let next = index + step;
      while (rows[next] && opts.isDetailRow(rows[next]!)) next += step;
      if (next < 0) {
        // First row -> header filter of the column.
        if (opts.headerFilters && focusHeaderFilter(root, field)) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      // Only step over detail rows; plain moves stay with Community.
      if (next === index + step || !rows[next]) return;
      event.preventDefault();
      event.stopPropagation();
      const colIndex = api.getColumnIndex(field);
      api.scrollToIndexes({ rowIndex: next, colIndex });
      api.setCellFocus(opts.getRowId(rows[next]!), field);
    };
    // Alt+Left/Right on a column header moves the column within its pinned section.
    let refocus = 0;
    const moveHeader = (event: KeyboardEvent) => {
      const { moveColumn, apiRef } = optionsRef.current;
      const header = (event.target as HTMLElement).closest<HTMLElement>(
        '.MuiDataGrid-columnHeader[data-field]',
      );
      if (!moveColumn || !header || !root.contains(header)) return;
      // Alt+Left/Right is also the browser's Back/Forward: never leave the page from a header.
      event.preventDefault();
      event.stopPropagation();
      const field = header.dataset.field!;
      const rtl = getComputedStyle(header).direction === 'rtl';
      if (!moveColumn(field, (event.key === 'ArrowLeft') !== rtl ? -1 : 1)) return;
      // The header re-renders in its new place once the grid takes the new columns; keep the
      // keyboard on it.
      cancelAnimationFrame(refocus);
      refocus = requestAnimationFrame(() => {
        refocus = requestAnimationFrame(() => {
          const api = apiRef.current;
          if (api) api.scrollToIndexes({ colIndex: api.getColumnIndex(field) });
          const moved = root.querySelector<HTMLElement>(
            `.MuiDataGrid-columnHeader[data-field="${field.replace(/["\\]/g, '\\$&')}"]`,
          );
          if (moved && moved !== document.activeElement) moved.focus({ preventScroll: true });
        });
      });
    };
    root.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(refocus);
      root.removeEventListener('keydown', onKeyDown, true);
    };
  }, [options.rootRef]);
}
