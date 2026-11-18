import * as React from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExpansionTracker } from '../ExpansionTracker.js';
import { KeyedEmitter } from '../KeyedEmitter.js';
import { ROOT_KEY, TreeStructureStore, toKey } from '../TreeStructureStore.js';
import {
  composeHandlers,
  mergeSlotProps,
  useGlobalSnapshot,
  useKeyedSnapshot,
  useShallowStable,
} from '../hooks.js';
import { ITEMS, type TestItem } from '../../../tests/fixtures.js';

describe('KeyedEmitter', () => {
  it('notifies keyed subscribers of the emitted keys only, plus global subscribers', () => {
    const emitter = new KeyedEmitter();
    const a = vi.fn();
    const b = vi.fn();
    const global = vi.fn();
    const unsubscribeA = emitter.subscribeKey('a', a);
    emitter.subscribeKey('b', b);
    const unsubscribeGlobal = emitter.subscribe(global);
    emitter.emit(['a', 'a', 'missing']);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
    expect(global).toHaveBeenCalledTimes(1);
    emitter.emitAll();
    expect(b).toHaveBeenCalledTimes(1);
    expect(emitter.listenerCount('a')).toBe(1);
    unsubscribeA();
    unsubscribeA();
    expect(emitter.listenerCount('a')).toBe(0);
    unsubscribeGlobal();
    emitter.emit();
    expect(global).toHaveBeenCalledTimes(2);
  });
});

describe('TreeStructureStore', () => {
  const create = (items: TestItem[] = ITEMS) => {
    const store = new TreeStructureStore<TestItem>();
    store.configure({ items }, false);
    return store;
  };

  it('indexes the tree (parent, depth, sibling index)', () => {
    const store = create();
    expect(store.getItemCount()).toBe(9);
    expect(store.getEntry('grid-pro')).toEqual({
      id: 'grid-pro',
      parentId: 'grid',
      depth: 1,
      index: 1,
    });
    expect(store.getChildrenIds(null)).toEqual(['grid', 'pickers', 'charts', 'tree-view']);
    expect(store.getChildrenIds('charts')).toEqual([]);
    expect(store.getModel('charts')).toBe(ITEMS[2]);
    expect(store.getChildren('unknown')).toEqual([]);
    expect(store.isSelfOrAncestor('grid', 'grid-pro')).toBe(true);
    expect(store.isSelfOrAncestor('pickers', 'grid-pro')).toBe(false);
    expect(store.getItemLabel(ITEMS[0]!)).toBe('Data Grid');
    expect(toKey(null)).toBe(ROOT_KEY);
  });

  it('moves items without mutating the models and rebuilds the community items', () => {
    const store = create();
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.communityItems;
    store.moveItem('charts', 'grid', 0);
    expect(listener).toHaveBeenCalled();
    expect(store.communityItems).not.toBe(before);
    expect(store.getChildrenIds('grid')).toEqual([
      'charts',
      'grid-community',
      'grid-pro',
      'grid-premium',
    ]);
    expect(store.getChildrenIds(null)).toEqual(['grid', 'pickers', 'tree-view']);
    expect(ITEMS[0]!.children).toHaveLength(3);
    expect(store.getChildrenForCommunity(ITEMS[0]!)?.map((item) => item.id)).toContain('charts');
    expect(store.getChildrenForCommunity(ITEMS[3]!)).toBeUndefined();
    store.moveItem('unknown', null, 0);
    store.clearOverrides();
    expect(store.getChildrenIds(null)).toHaveLength(4);
  });

  it('applies incremental children updates without rebuilding the community items', () => {
    const store = create([{ id: 'a', label: 'A' }]);
    const before = store.communityItems;
    store.getChildrenIds(null);
    store.setChildren('a', [{ id: 'a1', label: 'A1' }], false);
    expect(store.communityItems).toBe(before);
    expect(store.getEntry('a1')).toMatchObject({ parentId: 'a', depth: 1 });
    store.insertChildren('a', [{ id: 'a0', label: 'A0' }], 0);
    expect(store.getChildrenIds('a')).toEqual(['a0', 'a1']);
    store.insertChildren(null, [{ id: 'b', label: 'B' }]);
    expect(store.getChildrenIds(null)).toEqual(['a', 'b']);
  });

  it('resets on configuration changes, or keeps the structure in data source mode', () => {
    const store = new TreeStructureStore<TestItem>();
    const items = [{ id: 'a', label: 'A' }];
    store.configure({ items }, true);
    store.setChildren('a', [{ id: 'a1', label: 'A1' }], true);
    store.flush();
    const listener = vi.fn();
    store.subscribe(listener);
    // Same configuration: no-op.
    store.configure({ items }, true);
    store.flush();
    expect(listener).not.toHaveBeenCalled();
    // Data source mode: new items are ignored, overrides kept, accessors refreshed.
    store.configure({ items: [], getItemLabel: (item) => item.label.toLowerCase() }, true);
    expect(store.getChildrenIds('a')).toEqual(['a1']);
    expect(store.getItemLabel(items[0]!)).toBe('a');
    store.configure({ items: [], getItemId: (item) => `x-${item.id}` }, true);
    expect(store.getChildrenIds(null)).toEqual(['x-a']);
    store.flush();
    expect(listener).toHaveBeenCalledTimes(1);
    // Regular mode: everything is reset.
    store.configure({ items: [{ id: 'z', label: 'Z' }] }, false);
    expect(store.hasOverride('a')).toBe(false);
    expect(store.getChildrenIds(null)).toEqual(['z']);
  });

  it('supports custom accessors', () => {
    const store = new TreeStructureStore<{ key: string; nodes?: { key: string }[] }>();
    store.configure(
      {
        items: [{ key: 'a', nodes: [{ key: 'b' }] }],
        getItemId: (item) => item.key,
        getItemChildren: (item) => item.nodes as any,
      },
      false,
    );
    expect(store.getEntry('b')?.parentId).toBe('a');
    expect(store.getItemLabel({ key: 'a' })).toBe('');
  });
});

describe('ExpansionTracker', () => {
  it('tracks the expanded items and reports diffs', () => {
    const tracker = new ExpansionTracker();
    tracker.initialize(['a']);
    tracker.initialize(['ignored']);
    expect(tracker.isExpanded('a')).toBe(true);
    const onDiff = vi.fn();
    const unsubscribe = tracker.onDiff(onDiff);
    expect(tracker.set(['a', 'b'])).toEqual({ added: ['b'], removed: [] });
    expect(onDiff).toHaveBeenCalledWith({ added: ['b'], removed: [] });
    expect(tracker.set(['b'])).toEqual({ added: [], removed: ['a'] });
    tracker.set(['b']);
    expect(onDiff).toHaveBeenCalledTimes(2);
    unsubscribe();
    tracker.set([]);
    expect(onDiff).toHaveBeenCalledTimes(2);
    expect([...tracker.getExpanded()]).toEqual([]);
    const fresh = new ExpansionTracker();
    fresh.initialize(undefined);
    expect(fresh.getExpanded().size).toBe(0);
  });
});

describe('hooks', () => {
  it('useKeyedSnapshot / useGlobalSnapshot re-render on their emits only', () => {
    const emitter = new KeyedEmitter();
    let value = 0;
    const renders = vi.fn();
    function Keyed() {
      renders('keyed');
      return <span>{useKeyedSnapshot(emitter, 'a', () => value)}</span>;
    }
    function Global() {
      renders('global');
      return <span>{useGlobalSnapshot(emitter, () => value)}</span>;
    }
    const { container } = render(
      <React.Fragment>
        <Keyed />
        <Global />
      </React.Fragment>,
    );
    renders.mockClear();
    act(() => {
      value = 1;
      emitter.emit(['b']);
    });
    expect(renders.mock.calls).toEqual([['global']]);
    act(() => emitter.emit(['a']));
    expect(container.textContent).toBe('11');
  });

  it('useShallowStable keeps the previous object while shallowly equal', () => {
    const A = () => null;
    const { result, rerender } = renderHook(({ value }) => useShallowStable(value), {
      initialProps: { value: { item: A } as Record<string, unknown> | undefined },
    });
    const first = result.current;
    rerender({ value: { item: A } });
    expect(result.current).toBe(first);
    rerender({ value: { item: A, other: 1 } });
    expect(result.current).not.toBe(first);
    rerender({ value: undefined });
    expect(result.current).toBeUndefined();
  });

  it('composeHandlers chains handlers', () => {
    const first = vi.fn();
    const second = vi.fn();
    expect(composeHandlers(undefined, second)).toBe(second);
    expect(composeHandlers(first, undefined)).toBe(first);
    composeHandlers(first, second)!('x');
    expect(first).toHaveBeenCalledWith('x');
    expect(second).toHaveBeenCalledWith('x');
  });

  it('mergeSlotProps merges objects and functions, chaining handlers and styles', () => {
    const consumer = vi.fn();
    const ours = vi.fn();
    const merged = mergeSlotProps(
      { onDrop: consumer, style: { color: 'red' }, title: 'a' },
      { onDrop: ours, style: { top: 1 }, draggable: true },
    ) as Record<string, any>;
    merged.onDrop('event');
    expect(consumer).toHaveBeenCalledWith('event');
    expect(ours).toHaveBeenCalledWith('event');
    expect(merged.style).toEqual({ color: 'red', top: 1 });
    expect(merged.title).toBe('a');
    expect(merged.draggable).toBe(true);

    const fromFunction = mergeSlotProps((ownerState: { id: string }) => ({ id: ownerState.id }), {
      draggable: true,
    }) as (ownerState: { id: string }) => Record<string, unknown>;
    expect(fromFunction({ id: 'x' })).toEqual({ id: 'x', draggable: true });
    expect(mergeSlotProps(undefined, { a: 1 })).toEqual({ a: 1 });
  });
});
