import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RichTreeView } from '../../../index.js';
import {
  createCountingItem,
  createDataTransfer,
  createFlatItems,
  deferred,
  getContent,
  mockRowRects,
  type TestItem,
} from '../../../tests/fixtures.js';

const VIEWPORT = 160; // 5 rows of 32px
const ROW = 32;

let clientHeightSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  clientHeightSpy = vi
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockImplementation(function getClientHeight(this: HTMLElement) {
      return this.getAttribute('role') === 'tree' ? VIEWPORT : 0;
    });
});
afterEach(() => {
  clientHeightSpy.mockRestore();
});

const rows = () => screen.queryAllByRole('treeitem');
const rowIds = () => rows().map((row) => row.id.replace(/^.*?-(item-\d+.*)$/, '$1'));

function scrollTo(scrollTop: number) {
  const tree = screen.getByRole('tree');
  tree.scrollTop = scrollTop;
  fireEvent.scroll(tree);
}

describe('RichTreeView – virtualization', () => {
  it('only renders the rows intersecting the viewport (plus overscan)', () => {
    const { container } = render(
      <RichTreeView items={createFlatItems(10_000)} virtualization itemHeight={ROW} />,
    );
    // 5 visible rows + 5 rows of overscan below.
    expect(rows()).toHaveLength(10);
    expect(rowIds()[0]).toBe('item-0');
    const sizer = container.querySelector('[data-tecton-tree-virtual-sizer]') as HTMLElement;
    expect(sizer.style.height).toBe(`${10_000 * ROW}px`);
    expect(sizer).toHaveAttribute('aria-hidden', 'true');
    const tree = screen.getByRole('tree');
    expect(tree.style.overflowY).toBe('auto');
    expect(tree).toHaveAttribute('data-tecton-tree-virtualized');
  });

  it('updates the rendered window on scroll and positions the rows', () => {
    render(<RichTreeView items={createFlatItems(1000)} virtualization itemHeight={ROW} />);
    scrollTo(100 * ROW);
    const ids = rowIds();
    expect(ids[0]).toBe('item-95');
    expect(ids[ids.length - 1]).toBe('item-109');
    const row = rows()[5]!;
    expect(row.style.position).toBe('absolute');
    expect(row.style.top).toBe(`${100 * ROW}px`);
    expect(row).toHaveAttribute('aria-level', '1');
    expect(row).toHaveAttribute('aria-posinset', '101');
    expect(row).toHaveAttribute('aria-setsize', '1000');
  });

  it('renders expanded children as flat rows with their hierarchy in aria attributes', () => {
    const items: TestItem[] = [
      { id: 'item-0', label: 'Parent', children: createFlatItems(3, 'item-0-child') },
      ...createFlatItems(3, 'item-x'),
    ];
    render(<RichTreeView items={items} virtualization itemHeight={ROW} />);
    expect(rows()).toHaveLength(4);
    fireEvent.click(screen.getByText('Parent'));
    expect(rows()).toHaveLength(7);
    const child = rows()[1]!;
    expect(child).toHaveAttribute('aria-level', '2');
    expect(child).toHaveAttribute('aria-posinset', '1');
    expect(child).toHaveAttribute('aria-setsize', '3');
    expect(child.style.top).toBe(`${ROW}px`);
    // Flat DOM: children are siblings of their parent.
    expect(child.parentElement).toBe(screen.getByRole('tree'));
  });

  it('scrolls to and focuses rows reached with the keyboard', async () => {
    render(<RichTreeView items={createFlatItems(500)} virtualization itemHeight={ROW} />);
    const first = rows()[0]!;
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'End' });
    await waitFor(() => expect(document.activeElement?.id).toMatch(/item-499$/));
    expect(screen.getByRole('tree').scrollTop).toBe(500 * ROW - VIEWPORT);
    expect(rowIds()).toContain('item-495');

    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    await waitFor(() => expect(document.activeElement?.id).toMatch(/item-0$/));
    expect(screen.getByRole('tree').scrollTop).toBe(0);

    // Walking down past the viewport keeps the focus on mounted rows.
    for (let i = 0; i < 12; i += 1) {
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    }
    await waitFor(() => expect(document.activeElement?.id).toMatch(/item-12$/));
  });

  it('keeps the focused row mounted when it is scrolled away', () => {
    render(<RichTreeView items={createFlatItems(500)} virtualization itemHeight={ROW} />);
    const first = rows()[0]!;
    act(() => first.focus());
    scrollTo(200 * ROW);
    expect(rowIds()[0]).toBe('item-0');
    expect(document.activeElement).toBe(first);
  });

  it('does not re-render rows that stay in the window while scrolling', () => {
    const counting = createCountingItem();
    render(
      <RichTreeView
        items={createFlatItems(1000)}
        virtualization
        itemHeight={ROW}
        slots={{ item: counting.CountingItem }}
      />,
    );
    expect(rows()).toHaveLength(10);
    counting.reset();
    scrollTo(1); // a partial row enters the viewport at the bottom
    expect([...counting.renders.keys()]).toEqual(['item-10']);
    counting.reset();
    scrollTo(20); // same rows intersect the viewport
    expect(counting.total()).toBe(0);
  });

  it('measures the row height when itemHeight is not provided', () => {
    const offsetSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function getOffsetHeight(this: HTMLElement) {
        return this.classList.contains('MuiTreeItem-content') ? 40 : 0;
      });
    try {
      const { container } = render(<RichTreeView items={createFlatItems(100)} virtualization />);
      const sizer = container.querySelector('[data-tecton-tree-virtual-sizer]') as HTMLElement;
      expect(sizer.style.height).toBe(`${100 * 40}px`);
      expect(rows()[1]!.style.top).toBe('40px');
    } finally {
      offsetSpy.mockRestore();
    }
  });

  it('falls back to a default viewport when the container has no height', () => {
    clientHeightSpy.mockImplementation(() => 0);
    render(<RichTreeView items={createFlatItems(100)} virtualization itemHeight={ROW} />);
    expect(rows()).toHaveLength(25); // 20 rows + 5 overscan
  });

  it('is disabled by disableVirtualization or itemHeight={null}', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { unmount } = render(
      <RichTreeView items={createFlatItems(100)} virtualization disableVirtualization />,
    );
    expect(rows()).toHaveLength(100);
    unmount();
    render(<RichTreeView items={createFlatItems(100)} virtualization itemHeight={null} />);
    expect(rows()).toHaveLength(100);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('itemHeight'));
    warn.mockRestore();
  });

  it('wraps a custom root slot and forwards onScroll', () => {
    const onScroll = vi.fn();
    const CustomRoot = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
      function CustomRoot(props, ref) {
        return <ul ref={ref} data-testid="custom-root" {...props} />;
      },
    );
    render(
      <RichTreeView
        items={createFlatItems(100)}
        virtualization
        itemHeight={ROW}
        slots={{ root: CustomRoot }}
        onScroll={onScroll}
      />,
    );
    expect(screen.getByTestId('custom-root')).toBe(screen.getByRole('tree'));
    scrollTo(10 * ROW);
    expect(onScroll).toHaveBeenCalled();
    expect(rowIds()[0]).toBe('item-5');
  });

  it('keeps the dragged row mounted and reorders in the flat list', () => {
    const rectSpy = mockRowRects();
    const onItemPositionChange = vi.fn();
    try {
      const { container } = render(
        <RichTreeView
          items={createFlatItems(200)}
          virtualization
          itemHeight={ROW}
          itemsReordering
          onItemPositionChange={onItemPositionChange}
        />,
      );
      const dataTransfer = createDataTransfer();
      fireEvent.dragStart(getContent(container, 'item-1'), { dataTransfer });
      scrollTo(100 * ROW);
      expect(rowIds()).toContain('item-1');
      const target = getContent(container, 'item-100');
      fireEvent.dragOver(target, { dataTransfer });
      fireEvent.drop(target, { dataTransfer });
      expect(onItemPositionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 'item-1',
          newPosition: { parentId: 'item-100', index: 0 },
        }),
      );
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('renders the loading state of a lazy loaded tree', async () => {
    const request = deferred<TestItem[]>();
    render(
      <RichTreeView
        items={[]}
        virtualization
        itemHeight={ROW}
        dataSource={{ getChildrenCount: () => 0, getTreeItems: () => request.promise }}
      />,
    );
    expect(screen.getByRole('tree')).toHaveAttribute('aria-busy', 'true');
    expect(document.querySelectorAll('.MuiTreeItemLoader-root').length).toBeGreaterThan(0);
    await act(async () => request.resolve(createFlatItems(50)));
    expect(rows()).toHaveLength(10);
  });

  it('shows lazy loading status in the icon of flat rows', async () => {
    const request = deferred<TestItem[]>();
    const items = [{ id: 'item-0', label: 'Lazy', childrenCount: 2 }];
    render(
      <RichTreeView
        items={items}
        virtualization
        itemHeight={ROW}
        dataSource={{
          getChildrenCount: (item: TestItem) => item.childrenCount ?? 0,
          getTreeItems: () => request.promise,
        }}
      />,
    );
    fireEvent.click(screen.getByText('Lazy'));
    expect(document.querySelector('[data-tecton-tree-loading-icon]')).not.toBeNull();
    // Flat structure: no nested loading rows.
    expect(document.querySelectorAll('.MuiTreeItemLoader-root')).toHaveLength(0);
    await act(async () => request.resolve(createFlatItems(2, 'item-0-child')));
    expect(rows()).toHaveLength(3);
  });
});
