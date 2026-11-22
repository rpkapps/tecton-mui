import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import type { GridApi } from '@mui/x-data-grid';
import {
  useRowsScrollEnd,
  type GridRowsScrollEndHandler,
} from '../features/server-data/useRowsScrollEnd.js';
import { createGridRootRef } from '../core/rootElement.js';

// A grid root with a virtual scroller whose sizes the test controls (jsdom has no layout).
function makeRoot() {
  const root = document.createElement('div');
  const scroller = document.createElement('div');
  scroller.className = 'MuiDataGrid-virtualScroller';
  root.append(scroller);
  document.body.append(root);
  const size = { scrollHeight: 1000, clientHeight: 300, scrollTop: 0 };
  for (const key of ['scrollHeight', 'clientHeight', 'scrollTop'] as const)
    Object.defineProperty(scroller, key, { configurable: true, get: () => size[key] });
  const scrollTo = (top: number) => {
    size.scrollTop = top;
    scroller.dispatchEvent(new Event('scroll'));
  };
  const rootRef = createGridRootRef();
  rootRef.setRef(root);
  return { root, rootRef, size, scrollTo };
}

const api = {
  getVisibleColumns: () => [{ field: 'a' }],
  getRootDimensions: () => ({ rowHeight: 50 }),
} as unknown as GridApi;

const flushFrame = () => act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));

describe('onRowsScrollEnd (infinite scroll)', () => {
  it('fires once near the end, again only after the content grows', async () => {
    const { root, rootRef, size, scrollTo } = makeRoot();
    const onRowsScrollEnd = vi.fn<GridRowsScrollEndHandler>();
    const { rerender } = renderHook(
      ({ rowCount }: { rowCount: number }) =>
        useRowsScrollEnd({
          rootRef,
          apiRef: { current: api },
          onRowsScrollEnd,
          threshold: 80,
          rowCount,
        }),
      { initialProps: { rowCount: 20 } },
    );
    await flushFrame();
    expect(onRowsScrollEnd).not.toHaveBeenCalled();
    scrollTo(500); // 200px from the end: outside the threshold.
    expect(onRowsScrollEnd).not.toHaveBeenCalled();
    scrollTo(650); // 50px from the end.
    expect(onRowsScrollEnd).toHaveBeenCalledTimes(1);
    expect(onRowsScrollEnd.mock.calls[0]![0]).toEqual({
      visibleColumns: [{ field: 'a' }],
      viewportPageSize: 6,
      visibleRowsCount: 20,
    });
    scrollTo(700);
    expect(onRowsScrollEnd).toHaveBeenCalledTimes(1);
    // Rows appended: the content grows and the next end fires again.
    size.scrollHeight = 2000;
    rerender({ rowCount: 40 });
    await flushFrame();
    scrollTo(1650);
    expect(onRowsScrollEnd).toHaveBeenCalledTimes(2);
    root.remove();
  });

  it('fires when the rows do not fill the viewport, and not without a handler', async () => {
    const { root, rootRef, size } = makeRoot();
    size.scrollHeight = 200; // shorter than the 300px viewport
    const onRowsScrollEnd = vi.fn<GridRowsScrollEndHandler>();
    const { rerender } = renderHook(
      ({ handler }: { handler?: GridRowsScrollEndHandler }) =>
        useRowsScrollEnd({
          rootRef,
          apiRef: { current: api },
          onRowsScrollEnd: handler,
          threshold: 80,
          rowCount: 4,
        }),
      { initialProps: { handler: undefined as GridRowsScrollEndHandler | undefined } },
    );
    await flushFrame();
    expect(onRowsScrollEnd).not.toHaveBeenCalled();
    rerender({ handler: onRowsScrollEnd });
    await flushFrame();
    expect(onRowsScrollEnd).toHaveBeenCalledTimes(1);
    root.remove();
  });

  it('listens once a root mounts after the hook (hydration)', async () => {
    const { root, size, scrollTo } = makeRoot();
    const rootRef = createGridRootRef(); // no root yet, as in the first commit after hydration
    const onRowsScrollEnd = vi.fn<GridRowsScrollEndHandler>();
    renderHook(() =>
      useRowsScrollEnd({
        rootRef,
        apiRef: { current: api },
        onRowsScrollEnd,
        threshold: 80,
        rowCount: 20,
      }),
    );
    await flushFrame();
    expect(onRowsScrollEnd).not.toHaveBeenCalled();
    act(() => rootRef.setRef(root));
    await flushFrame();
    expect(onRowsScrollEnd).not.toHaveBeenCalled(); // 700px from the end
    scrollTo(650);
    expect(onRowsScrollEnd).toHaveBeenCalledTimes(1);
    // The first check after mounting also fires when the rows do not fill the viewport.
    const late = makeRoot();
    late.size.scrollHeight = 200;
    const lateRef = createGridRootRef();
    const onLate = vi.fn<GridRowsScrollEndHandler>();
    renderHook(() =>
      useRowsScrollEnd({
        rootRef: lateRef,
        apiRef: { current: api },
        onRowsScrollEnd: onLate,
        threshold: 80,
        rowCount: 4,
      }),
    );
    await flushFrame();
    act(() => lateRef.setRef(late.root));
    await flushFrame();
    expect(onLate).toHaveBeenCalledTimes(1);
    void size;
    root.remove();
    late.root.remove();
  });
});

// Keeps React in scope for the JSX transform settings of this package.
void React;
