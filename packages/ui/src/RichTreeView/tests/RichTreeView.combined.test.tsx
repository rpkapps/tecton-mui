import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRichTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { RichTreeView, type TreeViewDataSource } from '../index.js';
import {
  ITEMS,
  createCountingItem,
  dragAndDrop,
  getItem,
  getLabels,
  mockRowRects,
  type TestItem,
} from './fixtures.js';

let rectSpy: ReturnType<typeof mockRowRects>;
beforeEach(() => {
  rectSpy = mockRowRects();
});
afterEach(() => {
  rectSpy.mockRestore();
});

const SERVER: Record<string, TestItem[]> = {
  root: [
    { id: 'a', label: 'A', childrenCount: 2 },
    { id: 'b', label: 'B', childrenCount: 1 },
    { id: 'c', label: 'C', childrenCount: 0 },
  ],
  a: [
    { id: 'a1', label: 'A1', childrenCount: 0 },
    { id: 'a2', label: 'A2', childrenCount: 0 },
  ],
  b: [{ id: 'b1', label: 'B1', childrenCount: 0 }],
};

const dataSource: TreeViewDataSource<TestItem> = {
  getChildrenCount: (item) => item.childrenCount ?? 0,
  getTreeItems: async (parentId) => SERVER[parentId ?? 'root'] ?? [],
};

describe('RichTreeView – feature combinations', () => {
  it('toggles advanced features at runtime without losing the Community state', () => {
    const counting = createCountingItem();
    const { container, rerender } = render(
      <RichTreeView items={ITEMS} slots={{ item: counting.CountingItem }} />,
    );
    fireEvent.click(screen.getByText('Data Grid'));
    expect(getItem(container, 'grid')).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <RichTreeView items={ITEMS} slots={{ item: counting.CountingItem }} itemsReordering />,
    );
    expect(getItem(container, 'grid')).toHaveAttribute('aria-expanded', 'true');
    expect(getItem(container, 'grid')).toHaveAttribute('aria-selected', 'true');
    dragAndDrop(container, 'charts', 'grid', 'above');
    expect(getLabels(container)[0]).toBe('Charts');

    rerender(<RichTreeView items={ITEMS} slots={{ item: counting.CountingItem }} />);
    expect(getItem(container, 'grid')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('reorders lazily loaded items and refuses drops into unloaded items', async () => {
    const onItemPositionChange = vi.fn();
    const { container } = render(
      <RichTreeView
        items={SERVER.root!}
        dataSource={dataSource}
        itemsReordering
        defaultExpandedItems={['a']}
        onItemPositionChange={onItemPositionChange}
      />,
    );
    await waitFor(() => expect(getLabels(container)).toContain('A1'));

    // "b" has unloaded children: it cannot receive a new child yet.
    dragAndDrop(container, 'c', 'b', 'child');
    expect(onItemPositionChange).not.toHaveBeenCalled();

    // A lazily loaded child can be moved; the loaded branch survives the rebuild.
    dragAndDrop(container, 'a2', 'a1', 'above');
    expect(onItemPositionChange).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: 'a2', newPosition: { parentId: 'a', index: 0 } }),
    );
    expect(getLabels(container)).toEqual(['A', 'A2', 'A1', 'B', 'C']);

    fireEvent.click(getItem(container, 'b').firstElementChild!);
    await waitFor(() => expect(getLabels(container)).toContain('B1'));
    dragAndDrop(container, 'c', 'b', 'child');
    expect(getLabels(container)).toEqual(['A', 'A2', 'A1', 'B', 'B1', 'C']);
  });

  it('works in StrictMode', async () => {
    const getTreeItems = vi.fn(dataSource.getTreeItems);
    let apiRef: ReturnType<typeof useRichTreeViewApiRef<TestItem>> | undefined;
    function Demo() {
      apiRef = useRichTreeViewApiRef<TestItem>();
      return (
        <RichTreeView
          apiRef={apiRef}
          items={[] as TestItem[]}
          dataSource={{ ...dataSource, getTreeItems }}
          itemsReordering
        />
      );
    }
    const { container } = render(
      <React.StrictMode>
        <Demo />
      </React.StrictMode>,
    );
    await waitFor(() => expect(getLabels(container)).toEqual(['A', 'B', 'C']));
    fireEvent.click(getItem(container, 'a').firstElementChild!);
    await waitFor(() => expect(getLabels(container)).toEqual(['A', 'A1', 'A2', 'B', 'C']));
    dragAndDrop(container, 'c', 'a', 'above');
    expect(getLabels(container)[0]).toBe('C');
    expect(apiRef!.current?.getItemOrderedChildrenIds?.(null)).toEqual(['c', 'a', 'b']);
  });

  it('supports controlled expansion together with reordering', () => {
    function Controlled() {
      const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
      return (
        <RichTreeView
          items={ITEMS}
          itemsReordering
          expandedItems={expandedItems}
          onExpandedItemsChange={(_, ids) => setExpandedItems(ids)}
        />
      );
    }
    const { container } = render(<Controlled />);
    act(() => {
      fireEvent.click(screen.getByText('Date Pickers'));
    });
    expect(getItem(container, 'pickers')).toHaveAttribute('aria-expanded', 'true');
    dragAndDrop(container, 'charts', 'pickers', 'below');
    // "below" an expanded parent: first child.
    expect(getLabels(container).slice(1, 3)).toEqual(['Date Pickers', 'Charts']);
  });
});
