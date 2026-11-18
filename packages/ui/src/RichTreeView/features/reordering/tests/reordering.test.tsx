import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRichTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { RichTreeView } from '../../../index.js';
import {
  ITEMS,
  createCountingItem,
  createDataTransfer,
  dragAndDrop,
  fireDragEvent,
  getContent,
  getItem,
  getLabels,
  mockRowRects,
} from '../../../tests/fixtures.js';

let rectSpy: ReturnType<typeof mockRowRects>;
beforeEach(() => {
  rectSpy = mockRowRects();
});
afterEach(() => {
  rectSpy.mockRestore();
});

function renderTree(props: Partial<React.ComponentProps<typeof RichTreeView>> = {}) {
  const counting = createCountingItem();
  const onItemPositionChange = vi.fn();
  const utils = render(
    <RichTreeView
      items={ITEMS}
      itemsReordering
      defaultExpandedItems={['grid', 'pickers']}
      onItemPositionChange={onItemPositionChange}
      slots={{ item: counting.CountingItem }}
      {...props}
    />,
  );
  return { ...utils, counting, onItemPositionChange };
}

describe('RichTreeView – items reordering (drag and drop)', () => {
  it('makes reorderable items draggable and keeps the others static', () => {
    const { container } = renderTree({ isItemReorderable: (itemId) => itemId !== 'charts' });
    expect(getContent(container, 'grid')).toHaveAttribute('draggable', 'true');
    expect(getContent(container, 'charts')).toHaveAttribute('draggable', 'false');
    const dataTransfer = createDataTransfer();
    const event = fireEvent.dragStart(getContent(container, 'charts'), { dataTransfer });
    expect(event).toBe(false); // default prevented: the drag does not start
  });

  it('reorders an item above a sibling and fires onItemPositionChange', () => {
    const { container, onItemPositionChange } = renderTree();
    dragAndDrop(container, 'grid-premium', 'grid-community', 'above');
    expect(onItemPositionChange).toHaveBeenCalledWith({
      itemId: 'grid-premium',
      oldPosition: { parentId: 'grid', index: 2 },
      newPosition: { parentId: 'grid', index: 0 },
    });
    expect(getLabels(container).slice(0, 4)).toEqual(['Data Grid', 'Premium', 'Community', 'Pro']);
  });

  it('reorders an item below a sibling (index adjusted after removal)', () => {
    const { container, onItemPositionChange } = renderTree();
    dragAndDrop(container, 'grid-community', 'grid-pro', 'below');
    expect(onItemPositionChange).toHaveBeenCalledWith({
      itemId: 'grid-community',
      oldPosition: { parentId: 'grid', index: 0 },
      newPosition: { parentId: 'grid', index: 1 },
    });
    expect(getLabels(container).slice(1, 4)).toEqual(['Pro', 'Community', 'Premium']);
  });

  it('makes an item the last child of the hovered item', () => {
    const { container, onItemPositionChange } = renderTree();
    dragAndDrop(container, 'charts', 'pickers', 'child');
    expect(onItemPositionChange).toHaveBeenCalledWith({
      itemId: 'charts',
      oldPosition: { parentId: null, index: 2 },
      newPosition: { parentId: 'pickers', index: 2 },
    });
    expect(getItem(container, 'pickers').querySelector('[role="group"]')).toHaveTextContent(
      'Charts',
    );
  });

  it('drops below an expanded parent as its first child', () => {
    const { onItemPositionChange, container } = renderTree();
    dragAndDrop(container, 'charts', 'grid', 'below');
    expect(onItemPositionChange).toHaveBeenCalledWith({
      itemId: 'charts',
      oldPosition: { parentId: null, index: 2 },
      newPosition: { parentId: 'grid', index: 0 },
    });
  });

  it('moves the last child out to the parent level when pointing left of its indentation', () => {
    const { container, onItemPositionChange } = renderTree({ itemChildrenIndentation: 24 });
    dragAndDrop(container, 'charts', 'grid-premium', 'below', { clientX: 4 });
    expect(onItemPositionChange).toHaveBeenCalledWith({
      itemId: 'charts',
      oldPosition: { parentId: null, index: 2 },
      newPosition: { parentId: null, index: 1 },
    });
  });

  it('shows the drop overlay on the hovered item only and clears it on drag end', () => {
    const { container } = renderTree();
    dragAndDrop(container, 'charts', 'pickers', 'child', { drop: false });
    const overlays = container.querySelectorAll('.MuiTreeItem-dragAndDropOverlay');
    expect(overlays).toHaveLength(1);
    expect(getItem(container, 'pickers')).toContainElement(overlays[0] as HTMLElement);
    expect(getContent(container, 'charts')).toHaveAttribute('data-dragging');

    fireDragEvent('dragOver', getContent(container, 'tree-view'), {
      dataTransfer: createDataTransfer(),
      clientY: 28,
    });
    expect(
      getItem(container, 'tree-view').querySelector('.MuiTreeItem-dragAndDropOverlay'),
    ).not.toBeNull();
    expect(
      getItem(container, 'pickers').querySelector('.MuiTreeItem-dragAndDropOverlay'),
    ).toBeNull();

    fireEvent.dragEnd(getContent(container, 'charts'));
    expect(container.querySelectorAll('.MuiTreeItem-dragAndDropOverlay')).toHaveLength(0);
    expect(getContent(container, 'charts')).not.toHaveAttribute('data-dragging');
  });

  it('respects canMoveItemToNewPosition', () => {
    const canMoveItemToNewPosition = vi.fn(
      (params: {
        oldPosition: { parentId: string | null };
        newPosition: { parentId: string | null };
      }) => params.oldPosition.parentId === params.newPosition.parentId,
    );
    const { container, onItemPositionChange } = renderTree({ canMoveItemToNewPosition });
    const { target } = dragAndDrop(container, 'charts', 'pickers', 'child');
    expect(canMoveItemToNewPosition).toHaveBeenCalled();
    expect(onItemPositionChange).not.toHaveBeenCalled();
    expect(target.querySelector('.MuiTreeItem-dragAndDropOverlay')).toBeNull();

    dragAndDrop(container, 'charts', 'grid', 'above');
    expect(onItemPositionChange).toHaveBeenCalledWith(
      expect.objectContaining({ newPosition: { parentId: null, index: 0 } }),
    );
  });

  it('never drops an item into itself or its descendants, and ignores no-op moves', () => {
    const { container, onItemPositionChange } = renderTree();
    dragAndDrop(container, 'grid', 'grid-pro', 'child');
    dragAndDrop(container, 'grid', 'grid', 'child');
    dragAndDrop(container, 'charts', 'tree-view', 'above');
    expect(onItemPositionChange).not.toHaveBeenCalled();
  });

  it('calls canMoveItemToNewPosition once per hovered item and action', () => {
    const canMoveItemToNewPosition = vi.fn(() => true);
    const { container } = renderTree({ canMoveItemToNewPosition });
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(getContent(container, 'charts'), { dataTransfer });
    for (let i = 0; i < 10; i += 1) {
      fireDragEvent('dragOver', getContent(container, 'pickers'), { dataTransfer, clientY: 15 });
    }
    expect(canMoveItemToNewPosition).toHaveBeenCalledTimes(1);
  });

  it('ignores drag events when no drag started from the tree', () => {
    const { container, onItemPositionChange } = renderTree();
    const target = getContent(container, 'pickers');
    fireDragEvent('dragOver', target, { dataTransfer: createDataTransfer(), clientY: 15 });
    fireEvent.drop(target, { dataTransfer: createDataTransfer() });
    expect(onItemPositionChange).not.toHaveBeenCalled();
  });

  it('clears the hovered target when the pointer leaves the item', () => {
    const { container } = renderTree();
    dragAndDrop(container, 'charts', 'pickers', 'child', { drop: false });
    const target = getContent(container, 'pickers');
    // Moving into a descendant element does not clear it.
    fireDragEvent('dragLeave', target, { relatedTarget: target.firstElementChild });
    expect(container.querySelectorAll('.MuiTreeItem-dragAndDropOverlay')).toHaveLength(1);
    fireDragEvent('dragLeave', getContent(container, 'charts'), { relatedTarget: document.body });
    expect(container.querySelectorAll('.MuiTreeItem-dragAndDropOverlay')).toHaveLength(1);
    fireDragEvent('dragLeave', target, { relatedTarget: document.body });
    expect(container.querySelectorAll('.MuiTreeItem-dragAndDropOverlay')).toHaveLength(0);
  });

  it('resets the reordered structure when the items prop changes (controlled usage)', () => {
    const { container, rerender, counting } = renderTree();
    dragAndDrop(container, 'charts', 'grid', 'above');
    expect(getLabels(container)[0]).toBe('Charts');
    const nextItems = [...ITEMS].reverse();
    rerender(
      <RichTreeView items={nextItems} itemsReordering slots={{ item: counting.CountingItem }} />,
    );
    const topLevel = Array.from(
      container.querySelectorAll('[role="tree"] > [role="treeitem"] > .MuiTreeItem-content'),
    ).map((content) => content.textContent);
    expect(topLevel).toEqual(['Tree View', 'Charts', 'Date Pickers', 'Data Grid']);
  });

  it('supports custom getItemId / getItemChildren without mutating the models', () => {
    const items = [
      { key: 'a', title: 'A', nodes: [{ key: 'a1', title: 'A1' }] },
      { key: 'b', title: 'B' },
    ];
    const snapshot = JSON.stringify(items);
    const onItemPositionChange = vi.fn();
    const { container } = render(
      <RichTreeView
        items={items}
        itemsReordering
        defaultExpandedItems={['a']}
        getItemId={(item) => item.key}
        getItemLabel={(item) => item.title}
        getItemChildren={(item: any) => item.nodes}
        onItemPositionChange={onItemPositionChange}
      />,
    );
    dragAndDrop(container, 'b', 'a1', 'above');
    expect(onItemPositionChange).toHaveBeenCalledWith(
      expect.objectContaining({ newPosition: { parentId: 'a', index: 0 } }),
    );
    expect(getLabels(container)).toEqual(['A', 'B', 'A1']);
    expect(JSON.stringify(items)).toBe(snapshot);
  });

  it('keeps apiRef.getItemTree in sync and exposes the extended API', () => {
    let apiRef: ReturnType<typeof useRichTreeViewApiRef> | undefined;
    function Demo() {
      apiRef = useRichTreeViewApiRef();
      return <RichTreeView apiRef={apiRef} items={ITEMS} itemsReordering />;
    }
    const { container } = render(<Demo />);
    dragAndDrop(container, 'tree-view', 'grid', 'above');
    expect(apiRef!.current?.getItemTree?.().map((item: any) => item.id)).toEqual([
      'tree-view',
      'grid',
      'pickers',
      'charts',
    ]);
    expect(apiRef!.current).toHaveProperty('updateItemChildren');
  });
});

describe('RichTreeView – items reordering (keyboard and announcements)', () => {
  const press = (element: HTMLElement, key: string) =>
    fireEvent.keyDown(element, { key, altKey: true, shiftKey: true });

  it('moves the focused item with Alt+Shift+Arrow keys and keeps the focus on it', async () => {
    const { container, onItemPositionChange } = renderTree();
    const item = getItem(container, 'grid-pro');
    act(() => item.focus());

    press(getItem(container, 'grid-pro'), 'ArrowUp');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: 'grid', index: 0 } }),
    );
    await waitFor(() => expect(document.activeElement).toBe(getItem(container, 'grid-pro')));

    press(getItem(container, 'grid-pro'), 'ArrowDown');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: 'grid', index: 1 } }),
    );

    // Outdent: becomes the next sibling of its former parent.
    press(getItem(container, 'grid-pro'), 'ArrowLeft');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: null, index: 1 } }),
    );
    await waitFor(() => expect(document.activeElement).toBe(getItem(container, 'grid-pro')));

    // Indent: becomes the last child of the previous sibling.
    press(getItem(container, 'grid-pro'), 'ArrowRight');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: 'grid', index: 2 } }),
    );
    await waitFor(() => expect(document.activeElement).toBe(getItem(container, 'grid-pro')));
  });

  it('moves out of the parent with ArrowUp/ArrowDown at the edges and expands the new parent', async () => {
    const { container, onItemPositionChange } = renderTree({ defaultExpandedItems: ['grid'] });
    press(getItem(container, 'grid-community'), 'ArrowUp');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: null, index: 0 } }),
    );
    press(getItem(container, 'grid-premium'), 'ArrowDown');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: null, index: 2 } }),
    );
    // Indent "charts" under the collapsed "pickers": the new parent gets expanded.
    press(getItem(container, 'charts'), 'ArrowRight');
    expect(onItemPositionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ newPosition: { parentId: 'pickers', index: 2 } }),
    );
    await waitFor(() =>
      expect(getItem(container, 'pickers')).toHaveAttribute('aria-expanded', 'true'),
    );
    await waitFor(() => expect(document.activeElement).toBe(getItem(container, 'charts')));
  });

  it('announces moves and refused moves in a polite live region', () => {
    const { container } = renderTree({ isItemReorderable: (itemId) => itemId !== 'charts' });
    const status = screen.getByRole('status');
    press(getItem(container, 'grid-pro'), 'ArrowUp');
    expect(status).toHaveTextContent('Pro moved to position 1 of 3 in Data Grid.');
    press(getItem(container, 'charts'), 'ArrowUp');
    expect(status).toHaveTextContent('Charts cannot be moved there.');
    press(getItem(container, 'grid'), 'ArrowUp');
    expect(status).toHaveTextContent('Data Grid cannot be moved there.');
    dragAndDrop(container, 'tree-view', 'grid', 'above');
    expect(status).toHaveTextContent('Tree View moved to position 1 of 4 at the top level.');
  });

  it('describes the keyboard alternative on reorderable items with customizable texts', () => {
    const { container } = renderTree({
      isItemReorderable: (itemId) => itemId !== 'charts',
      itemsReorderingLocaleText: { keyboardInstructions: 'Use Alt+Shift+Arrows' },
    });
    const describedBy = getItem(container, 'grid').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent('Use Alt+Shift+Arrows');
    expect(getItem(container, 'charts')).not.toHaveAttribute('aria-describedby');
  });

  it('leaves other key combinations to the Community keyboard navigation', () => {
    const { container, onItemPositionChange } = renderTree();
    const item = getItem(container, 'grid-community');
    act(() => item.focus());
    fireEvent.keyDown(item, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getItem(container, 'grid-pro'));
    fireEvent.keyDown(getItem(container, 'grid-pro'), {
      key: 'ArrowUp',
      altKey: true,
      shiftKey: true,
      ctrlKey: true,
    });
    fireEvent.keyDown(getItem(container, 'grid-pro'), {
      key: 'Home',
      altKey: true,
      shiftKey: true,
    });
    expect(onItemPositionChange).not.toHaveBeenCalled();
  });
});

describe('RichTreeView – reordering performance', () => {
  it('does not re-render the items while dragging over the tree', () => {
    const overlayRenders = new Map<string, number>();
    function CountingOverlay(props: { action?: string; 'data-owner'?: string }) {
      const owner = props['data-owner']!;
      overlayRenders.set(owner, (overlayRenders.get(owner) ?? 0) + 1);
      return props.action ? <div data-testid="overlay">{props.action}</div> : null;
    }
    const counting = createCountingItem();
    const { container } = render(
      <RichTreeView
        items={ITEMS}
        itemsReordering
        defaultExpandedItems={['grid', 'pickers']}
        slots={{ item: counting.CountingItem }}
        slotProps={{
          item: (ownerState: { itemId: string }) =>
            ({
              slots: { dragAndDropOverlay: CountingOverlay },
              slotProps: { dragAndDropOverlay: { 'data-owner': ownerState.itemId } },
            }) as any,
        }}
      />,
    );
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(getContent(container, 'charts'), { dataTransfer });
    counting.reset();
    overlayRenders.clear();

    const targets = ['grid-community', 'grid-pro', 'pickers', 'tree-view'];
    let dragOvers = 0;
    for (let pass = 0; pass < 3; pass += 1) {
      for (const target of targets) {
        for (const clientY of [2, 15, 28]) {
          fireDragEvent('dragOver', getContent(container, target), { dataTransfer, clientY });
          // Repeated events at the same position change nothing.
          fireDragEvent('dragOver', getContent(container, target), { dataTransfer, clientY });
          dragOvers += 2;
        }
      }
    }
    // Pointer moves never re-render the tree items themselves...
    expect(counting.total()).toBe(0);
    // ...only the overlays of the previous and next drop targets.
    expect(overlayRenders.has('charts')).toBe(false);
    expect(overlayRenders.has('grid')).toBe(false);
    expect(overlayRenders.has('grid-premium')).toBe(false);
    const overlayTotal = [...overlayRenders.values()].reduce((sum, value) => sum + value, 0);
    expect(overlayTotal).toBeLessThanOrEqual(dragOvers);
    expect(screen.getAllByTestId('overlay')).toHaveLength(1);
  });

  it('keeps the slots identity stable so items are not remounted on parent re-renders', () => {
    const counting = createCountingItem();
    function Parent({ tick }: { tick: number }) {
      return (
        <div data-tick={tick}>
          <RichTreeView items={ITEMS} itemsReordering slots={{ item: counting.CountingItem }} />
        </div>
      );
    }
    const { rerender } = render(<Parent tick={0} />);
    const mountsBefore = new Map(counting.mounts);
    rerender(<Parent tick={1} />);
    rerender(<Parent tick={2} />);
    expect(counting.mounts).toEqual(mountsBefore);
  });
});
