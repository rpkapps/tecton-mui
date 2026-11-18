import * as React from 'react';
import { createEvent, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TreeItem, type TreeItemProps } from '@mui/x-tree-view/TreeItem';

export interface TestItem {
  id: string;
  label: string;
  children?: TestItem[];
  childrenCount?: number;
}

export const ITEMS: TestItem[] = [
  {
    id: 'grid',
    label: 'Data Grid',
    children: [
      { id: 'grid-community', label: 'Community' },
      { id: 'grid-pro', label: 'Pro' },
      { id: 'grid-premium', label: 'Premium' },
    ],
  },
  {
    id: 'pickers',
    label: 'Date Pickers',
    children: [
      { id: 'pickers-community', label: 'Pickers Community' },
      { id: 'pickers-pro', label: 'Pickers Pro' },
    ],
  },
  { id: 'charts', label: 'Charts' },
  { id: 'tree-view', label: 'Tree View' },
];

export function createFlatItems(count: number, prefix = 'item'): TestItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    label: `Item ${index}`,
  }));
}

/** Returns the `role="treeitem"` element of an item. */
export function getItem(container: HTMLElement, itemId: string): HTMLElement {
  const content = container.querySelector(`[data-testid="content-${itemId}"]`);
  if (content) {
    return content.closest('[role="treeitem"]') as HTMLElement;
  }
  const items = Array.from(container.querySelectorAll<HTMLElement>('[role="treeitem"]'));
  const match = items.find((item) => item.id.endsWith(`-${itemId}`));
  if (!match) {
    throw new Error(`Item ${itemId} not found`);
  }
  return match;
}

export function getContent(container: HTMLElement, itemId: string): HTMLElement {
  return getItem(container, itemId).firstElementChild as HTMLElement;
}

/** Labels of the rendered items, in DOM order. */
export function getLabels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.MuiTreeItem-label')).map(
    (label) => label.textContent ?? '',
  );
}

/** Mocks row geometry: every element is 30px high and 200px wide. */
export function mockRowRects() {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top: 0,
        left: 0,
        right: 200,
        bottom: 30,
        width: 200,
        height: 30,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  );
}

export function createDataTransfer() {
  const data: Record<string, string> = {};
  return {
    data,
    effectAllowed: 'all',
    dropEffect: 'none',
    setData: (type: string, value: string) => {
      data[type] = value;
    },
    getData: (type: string) => data[type] ?? '',
  };
}

/**
 * Fires a drag event with pointer coordinates (jsdom has no `DragEvent`, so the coordinates
 * of the generic event created by Testing Library are defined manually).
 */
export function fireDragEvent(
  type: 'dragOver' | 'dragEnter' | 'dragLeave' | 'drop',
  element: Element,
  init: {
    dataTransfer?: unknown;
    clientX?: number;
    clientY?: number;
    relatedTarget?: EventTarget | null;
  } = {},
) {
  const { clientX = 150, clientY = 15, relatedTarget = null, ...rest } = init;
  const event = createEvent[type](element, rest);
  Object.defineProperty(event, 'clientX', { value: clientX });
  Object.defineProperty(event, 'clientY', { value: clientY });
  Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
  return fireEvent(element, event);
}

export type DropZone = 'above' | 'child' | 'below';

const ZONE_Y: Record<DropZone, number> = { above: 2, child: 15, below: 28 };

/** Drags `fromId` and drops it on `toId` in the given zone. */
export function dragAndDrop(
  container: HTMLElement,
  fromId: string,
  toId: string,
  zone: DropZone,
  options: { clientX?: number; drop?: boolean } = {},
) {
  const dataTransfer = createDataTransfer();
  const source = getContent(container, fromId);
  const target = getContent(container, toId);
  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragEnter(target, { dataTransfer });
  fireDragEvent('dragOver', target, {
    dataTransfer,
    clientX: options.clientX ?? 150,
    clientY: ZONE_Y[zone],
  });
  if (options.drop !== false) {
    fireEvent.drop(target, { dataTransfer });
    fireEvent.dragEnd(source, { dataTransfer });
  }
  return { dataTransfer, source, target };
}

/** Creates an item slot that counts its renders and mounts per item id. */
export function createCountingItem() {
  const renders = new Map<string, number>();
  const mounts = new Map<string, number>();
  const CountingItem = React.forwardRef(function CountingItem(
    props: TreeItemProps,
    ref: React.Ref<HTMLLIElement>,
  ) {
    renders.set(props.itemId, (renders.get(props.itemId) ?? 0) + 1);
    React.useEffect(() => {
      mounts.set(props.itemId, (mounts.get(props.itemId) ?? 0) + 1);
    }, [props.itemId]);
    return (
      <TreeItem
        ref={ref}
        {...props}
        slotProps={{
          ...props.slotProps,
          content: {
            ...(props.slotProps?.content as object),
            'data-testid': `content-${props.itemId}`,
          } as NonNullable<TreeItemProps['slotProps']>['content'],
        }}
      />
    );
  });
  const reset = () => {
    renders.clear();
  };
  const total = () => [...renders.values()].reduce((sum, value) => sum + value, 0);
  return { CountingItem, renders, mounts, reset, total };
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
