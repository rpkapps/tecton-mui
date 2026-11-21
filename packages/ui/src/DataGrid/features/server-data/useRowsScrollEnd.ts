'use client';
// Infinite scrolling for client rows (`onRowsScrollEnd`, same props as the MUI grid): calls the
// handler when the user scrolls within `scrollEndThreshold` px of the last row, once per end
// reached. When the handler appends rows and the content grows, the next end can fire again. It
// also fires when the rows do not fill the viewport, so the grid keeps loading until they do.
import * as React from 'react';
import type { GridApi, GridCallbackDetails, GridColDef } from '@mui/x-data-grid';

export interface GridRowScrollEndParams {
  /** The visible columns. */
  visibleColumns: GridColDef[];
  /** The number of rows that fit in the viewport. */
  viewportPageSize: number;
  /** The number of rows the grid shows. */
  visibleRowsCount: number;
}

export type GridRowsScrollEndHandler = (
  params: GridRowScrollEndParams,
  event: { defaultMuiPrevented?: boolean },
  details: GridCallbackDetails,
) => void;

export interface RowsScrollEndOptions {
  rootRef: React.RefObject<HTMLDivElement | null>;
  apiRef: React.RefObject<GridApi | null>;
  onRowsScrollEnd: GridRowsScrollEndHandler | undefined;
  threshold: number;
  /** Rows shown (changes re-arm the handler and re-check the end). */
  rowCount: number;
}

export function useRowsScrollEnd(options: RowsScrollEndOptions): void {
  const { rootRef, onRowsScrollEnd, rowCount } = options;
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });
  // Content height when the handler last fired; it fires again once the content has grown.
  const firedAt = React.useRef<number | null>(null);
  const enabled = !!onRowsScrollEnd;

  const check = React.useCallback(() => {
    const opts = optionsRef.current;
    const scroller = opts.rootRef.current?.querySelector<HTMLElement>(
      '.MuiDataGrid-virtualScroller',
    );
    if (!opts.onRowsScrollEnd || !scroller || scroller.clientHeight === 0) return;
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (distance > opts.threshold) return;
    if (firedAt.current !== null && scroller.scrollHeight <= firedAt.current) return;
    firedAt.current = scroller.scrollHeight;
    const api = opts.apiRef.current;
    const rowHeight = api?.getRootDimensions().rowHeight || 52;
    opts.onRowsScrollEnd(
      {
        visibleColumns: api ? api.getVisibleColumns() : [],
        viewportPageSize: Math.max(1, Math.floor(scroller.clientHeight / rowHeight)),
        visibleRowsCount: opts.rowCount,
      },
      {},
      { api: api as GridApi, apiRef: opts.apiRef as GridCallbackDetails['apiRef'] },
    );
  }, []);

  React.useEffect(() => {
    if (!enabled) return undefined;
    const scroller = rootRef.current?.querySelector<HTMLElement>('.MuiDataGrid-virtualScroller');
    if (!scroller) return undefined;
    scroller.addEventListener('scroll', check, { passive: true });
    return () => scroller.removeEventListener('scroll', check);
  }, [enabled, rootRef, check]);

  // New rows (or a first render that does not fill the viewport): check once laid out.
  React.useEffect(() => {
    if (!enabled) return undefined;
    const frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [enabled, rowCount, check]);
}
