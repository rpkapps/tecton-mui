import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRichTreeViewApiRef } from '@mui/x-tree-view/hooks';
import {
  RichTreeView,
  TreeViewDataSourceCacheDefault,
  type RichTreeViewPublicAPI,
  type TreeViewDataSource,
  type TreeViewDataSourceCache,
} from '../../../index.js';
import {
  createCountingItem,
  deferred,
  getItem,
  getLabels,
  type TestItem,
} from '../../../tests/fixtures.js';

const SERVER: Record<string, TestItem[]> = {
  root: [
    { id: 'a', label: 'A', childrenCount: 2 },
    { id: 'b', label: 'B', childrenCount: -1 },
    { id: 'c', label: 'C', childrenCount: 0 },
  ],
  a: [
    { id: 'a1', label: 'A1', childrenCount: 1 },
    { id: 'a2', label: 'A2', childrenCount: 0 },
  ],
  a1: [{ id: 'a1x', label: 'A1X', childrenCount: 0 }],
  b: [{ id: 'b1', label: 'B1', childrenCount: 0 }],
};

function createDataSource(overrides: Partial<TreeViewDataSource<TestItem>> = {}) {
  const getTreeItems = vi.fn(async (parentId?: string) => SERVER[parentId ?? 'root'] ?? []);
  const dataSource: TreeViewDataSource<TestItem> = {
    getChildrenCount: (item) => item.childrenCount ?? 0,
    getTreeItems,
    ...overrides,
  };
  return {
    dataSource,
    getTreeItems: (overrides.getTreeItems as typeof getTreeItems) ?? getTreeItems,
  };
}

const expand = (container: HTMLElement, itemId: string) =>
  fireEvent.click(getItem(container, itemId).firstElementChild!);

describe('RichTreeView – lazy loading', () => {
  it('fetches the root items on mount and shows the loading state meanwhile', async () => {
    const request = deferred<TestItem[]>();
    const getTreeItems = vi.fn(() => request.promise);
    const { dataSource } = createDataSource({ getTreeItems });
    render(<RichTreeView items={[]} dataSource={dataSource} />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-busy', 'true');
    expect(getTreeItems).toHaveBeenCalledWith(undefined);
    await act(async () => request.resolve(SERVER.root!));
    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-busy');
    expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
      'A',
      'B',
      'C',
    ]);
  });

  it('uses the items prop as initial state and marks items with children as expandable', () => {
    const { dataSource, getTreeItems } = createDataSource();
    const { container } = render(<RichTreeView items={SERVER.root!} dataSource={dataSource} />);
    expect(getTreeItems).not.toHaveBeenCalled();
    expect(getItem(container, 'a')).toHaveAttribute('aria-expanded', 'false');
    expect(getItem(container, 'b')).toHaveAttribute('aria-expanded', 'false'); // count -1
    expect(getItem(container, 'c')).not.toHaveAttribute('aria-expanded'); // leaf
  });

  it('loads the children when an item is expanded, with loading rows and icon', async () => {
    const request = deferred<TestItem[]>();
    const { dataSource, getTreeItems } = createDataSource({
      getTreeItems: vi.fn(async (parentId?: string) =>
        parentId === 'a' ? request.promise : SERVER[parentId ?? 'root']!,
      ),
    });
    const { container } = render(<RichTreeView items={SERVER.root!} dataSource={dataSource} />);
    expand(container, 'a');
    expect(getTreeItems).toHaveBeenCalledWith('a');
    const item = getItem(container, 'a');
    expect(item).toHaveAttribute('aria-expanded', 'true');
    expect(item).toHaveAttribute('aria-busy', 'true');
    expect(item.firstElementChild).toHaveAttribute('data-loading');
    expect(item.querySelector('[data-tecton-tree-loading-icon]')).not.toBeNull();
    // One loading row per known child (getChildrenCount = 2).
    expect(item.querySelectorAll('.MuiTreeItemLoader-root')).toHaveLength(2);

    await act(async () => request.resolve(SERVER.a!));
    expect(item).not.toHaveAttribute('aria-busy');
    expect(item.querySelectorAll('.MuiTreeItemLoader-root')).toHaveLength(0);
    expect(getLabels(container)).toEqual(['A', 'A1', 'A2', 'B', 'C']);
  });

  it('opens unloaded items with the keyboard (ArrowRight) and loads their children', async () => {
    const { dataSource, getTreeItems } = createDataSource();
    const { container } = render(<RichTreeView items={SERVER.root!} dataSource={dataSource} />);
    const item = getItem(container, 'b');
    act(() => item.focus());
    fireEvent.keyDown(item, { key: 'ArrowRight' });
    expect(getTreeItems).toHaveBeenCalledWith('b');
    await waitFor(() => expect(getLabels(container)).toContain('B1'));
    // Once loaded, the Community keyboard navigation takes over.
    fireEvent.keyDown(getItem(container, 'b'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(getItem(container, 'b1'));
  });

  it('serves repeated expansions from the cache, and skips it when disabled', async () => {
    const { dataSource, getTreeItems } = createDataSource();
    const { container } = render(<RichTreeView items={SERVER.root!} dataSource={dataSource} />);
    expand(container, 'a');
    await waitFor(() => expect(getLabels(container)).toContain('A1'));
    expect(getTreeItems).toHaveBeenCalledTimes(1);

    const noCache = createDataSource();
    const second = render(
      <RichTreeView items={SERVER.root!} dataSource={noCache.dataSource} dataSourceCache={null} />,
    );
    expand(second.container, 'a');
    await waitFor(() => expect(getLabels(second.container)).toContain('A1'));
    expect(noCache.getTreeItems).toHaveBeenCalledTimes(1);
  });

  it('reads and writes a custom dataSourceCache', async () => {
    const store = new Map<string, TestItem[]>([['a', [{ id: 'cached', label: 'Cached' }]]]);
    const cache: TreeViewDataSourceCache<TestItem> = {
      get: vi.fn((key: string) => store.get(key)),
      set: vi.fn((key: string, value: TestItem[]) => {
        store.set(key, value);
      }),
      clear: vi.fn(() => store.clear()),
    };
    const { dataSource, getTreeItems } = createDataSource();
    const { container } = render(
      <RichTreeView items={SERVER.root!} dataSource={dataSource} dataSourceCache={cache} />,
    );
    expand(container, 'a');
    await waitFor(() => expect(getLabels(container)).toContain('Cached'));
    expect(getTreeItems).not.toHaveBeenCalled();
    expand(container, 'b');
    await waitFor(() => expect(getLabels(container)).toContain('B1'));
    expect(cache.set).toHaveBeenCalledWith('b', SERVER.b);
  });

  it('collapses the item and shows an error state when the fetch fails, then retries', async () => {
    const onDataSourceError = vi.fn();
    let fail = true;
    const { dataSource, getTreeItems } = createDataSource({
      getTreeItems: vi.fn(async (parentId?: string) => {
        if (fail) {
          throw new Error('network');
        }
        return SERVER[parentId ?? 'root']!;
      }),
    });
    const { container } = render(
      <RichTreeView
        items={SERVER.root!}
        dataSource={dataSource}
        onDataSourceError={onDataSourceError}
      />,
    );
    expand(container, 'a');
    await waitFor(() => expect(onDataSourceError).toHaveBeenCalledWith(expect.any(Error), 'a'));
    const item = getItem(container, 'a');
    expect(item).toHaveAttribute('aria-expanded', 'false');
    expect(item.firstElementChild).toHaveAttribute('data-error');
    expect(item.querySelector('[data-tecton-tree-error-icon]')).not.toBeNull();

    fail = false;
    expand(container, 'a');
    await waitFor(() => expect(getLabels(container)).toContain('A1'));
    expect(getTreeItems).toHaveBeenCalledTimes(2);
    expect(item.firstElementChild).not.toHaveAttribute('data-error');
  });

  it('reports root loading errors', async () => {
    const onDataSourceError = vi.fn();
    const { dataSource } = createDataSource({
      getTreeItems: vi.fn(async () => {
        throw new Error('down');
      }),
    });
    render(
      <RichTreeView items={[]} dataSource={dataSource} onDataSourceError={onDataSourceError} />,
    );
    await waitFor(() => expect(onDataSourceError).toHaveBeenCalledWith(expect.any(Error), null));
    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-busy');
  });

  it('auto-loads the expanded items (defaultExpandedItems), recursively', async () => {
    const { dataSource, getTreeItems } = createDataSource();
    const { container } = render(
      <RichTreeView items={[]} dataSource={dataSource} defaultExpandedItems={['a', 'a1']} />,
    );
    await waitFor(() => expect(getLabels(container)).toEqual(['A', 'A1', 'A1X', 'A2', 'B', 'C']));
    expect(getTreeItems.mock.calls.map((call) => call[0])).toEqual([undefined, 'a', 'a1']);
  });

  it('loads the children of items expanded through a controlled expandedItems prop', async () => {
    const { dataSource } = createDataSource();
    const { container, rerender } = render(
      <RichTreeView items={SERVER.root!} dataSource={dataSource} expandedItems={[]} />,
    );
    rerender(<RichTreeView items={SERVER.root!} dataSource={dataSource} expandedItems={['b']} />);
    await waitFor(() => expect(getLabels(container)).toContain('B1'));
  });

  it('discards superseded responses', async () => {
    const first = deferred<TestItem[]>();
    const second = deferred<TestItem[]>();
    const responses = [first.promise, second.promise];
    const { dataSource } = createDataSource({ getTreeItems: vi.fn(() => responses.shift()!) });
    let apiRef: React.RefObject<Partial<RichTreeViewPublicAPI> | undefined> | undefined;
    function Demo() {
      apiRef = useRichTreeViewApiRef();
      return <RichTreeView apiRef={apiRef} items={[]} dataSource={dataSource} />;
    }
    render(<Demo />);
    await act(async () => {
      void apiRef!.current!.updateItemChildren!(null);
    });
    await act(async () => second.resolve([{ id: 'new', label: 'New' }]));
    await act(async () => first.resolve([{ id: 'old', label: 'Old' }]));
    expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual(['New']);
  });

  it('refetches with apiRef.updateItemChildren (item or whole tree)', async () => {
    let version = 1;
    const { dataSource, getTreeItems } = createDataSource({
      getTreeItems: vi.fn(async (parentId?: string) =>
        (SERVER[parentId ?? 'root'] ?? []).map((item) => ({
          ...item,
          label: `${item.label} v${version}`,
        })),
      ),
    });
    let apiRef: React.RefObject<Partial<RichTreeViewPublicAPI> | undefined> | undefined;
    function Demo() {
      apiRef = useRichTreeViewApiRef();
      return (
        <RichTreeView
          apiRef={apiRef}
          items={[]}
          dataSource={dataSource}
          defaultExpandedItems={['a']}
        />
      );
    }
    const { container } = render(<Demo />);
    await waitFor(() => expect(getLabels(container)).toContain('A1 v1'));
    version = 2;
    await act(async () => apiRef!.current!.updateItemChildren!('a'));
    expect(getLabels(container)).toEqual(['A v1', 'A1 v2', 'A2 v2', 'B v1', 'C v1']);
    expect(getTreeItems).toHaveBeenCalledTimes(3);

    version = 3;
    await act(async () => apiRef!.current!.updateItemChildren!(null));
    await waitFor(() =>
      expect(getLabels(container)).toEqual(['A v3', 'A1 v3', 'A2 v3', 'B v3', 'C v3']),
    );
  });

  it('keeps the extended apiRef.addItems in sync with the structure', async () => {
    const { dataSource } = createDataSource();
    let apiRef: React.RefObject<Partial<RichTreeViewPublicAPI> | undefined> | undefined;
    function Demo() {
      apiRef = useRichTreeViewApiRef();
      return <RichTreeView apiRef={apiRef} items={SERVER.root!} dataSource={dataSource} />;
    }
    const { container } = render(<Demo />);
    act(() => apiRef!.current!.addItems!({ items: [{ id: 'd', label: 'D' }], parentId: null }));
    expect(getLabels(container)).toEqual(['A', 'B', 'C', 'D']);
    // The added item is known by the engines (e.g. not considered lazy).
    expect(getItem(container, 'd')).not.toHaveAttribute('aria-expanded');
  });

  it('does not apply responses arriving after unmount', async () => {
    const request = deferred<TestItem[]>();
    const onDataSourceError = vi.fn();
    const { dataSource } = createDataSource({ getTreeItems: vi.fn(() => request.promise) });
    const { unmount } = render(
      <RichTreeView items={[]} dataSource={dataSource} onDataSourceError={onDataSourceError} />,
    );
    unmount();
    await act(async () => request.reject(new Error('late')));
    expect(onDataSourceError).not.toHaveBeenCalled();
  });

  it('only re-renders the affected branch when children load', async () => {
    const counting = createCountingItem();
    const { dataSource } = createDataSource();
    const { container } = render(
      <RichTreeView
        items={SERVER.root!}
        dataSource={dataSource}
        slots={{ item: counting.CountingItem }}
      />,
    );
    counting.reset();
    expand(container, 'a');
    await waitFor(() => expect(getLabels(container)).toContain('A1'));
    expect(counting.renders.get('b')).toBeUndefined();
    expect(counting.renders.get('c')).toBeUndefined();
    expect(counting.renders.get('a')).toBeGreaterThan(0);
    expect(counting.renders.get('a1')).toBe(1);
  });

  it('works together with checkbox selection', async () => {
    const onSelectedItemsChange = vi.fn();
    const { dataSource } = createDataSource();
    const { container } = render(
      <RichTreeView
        items={SERVER.root!}
        dataSource={dataSource}
        checkboxSelection
        multiSelect
        onSelectedItemsChange={onSelectedItemsChange}
      />,
    );
    expand(container, 'a');
    await waitFor(() => expect(getLabels(container)).toContain('A1'));
    const checkbox = getItem(container, 'a1').querySelector('input[type="checkbox"]')!;
    fireEvent.click(checkbox);
    expect(onSelectedItemsChange).toHaveBeenCalledWith(expect.anything(), ['a1']);
  });

  it('supports custom item loader slots and slot props', async () => {
    const request = deferred<TestItem[]>();
    const { dataSource } = createDataSource({ getTreeItems: vi.fn(() => request.promise) });
    function Loader(props: { ownerState?: { index: number }; className?: string }) {
      return (
        <li role="treeitem" aria-disabled data-testid="custom-loader" className={props.className}>
          loading {props.ownerState?.index}
        </li>
      );
    }
    const { container } = render(
      <RichTreeView
        items={SERVER.root!}
        dataSource={dataSource}
        slots={{ itemLoader: Loader }}
        slotProps={{ itemLoader: () => ({ className: 'loader-row' }) }}
      />,
    );
    expand(container, 'b'); // count -1: 5 rows by default
    expect(screen.getAllByTestId('custom-loader')).toHaveLength(5);
    expect(screen.getAllByTestId('custom-loader')[0]).toHaveClass('loader-row');
    await act(async () => request.resolve(SERVER.b!));
  });
});

describe('TreeViewDataSourceCacheDefault', () => {
  it('expires entries after the time to live', () => {
    vi.useFakeTimers();
    try {
      const cache = new TreeViewDataSourceCacheDefault<TestItem>({ ttl: 1000 });
      const value = [{ id: 'x', label: 'X' }];
      cache.set('a', value);
      expect(cache.get('a')).toBe(value);
      vi.advanceTimersByTime(1001);
      expect(cache.get('a')).toBeUndefined();
      cache.set('b', value);
      cache.clear();
      expect(cache.get('b')).toBeUndefined();
      expect(new TreeViewDataSourceCacheDefault().get('missing')).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
