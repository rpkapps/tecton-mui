import { describe, expect, it, vi } from 'vitest';
import { TreeStructureStore } from '../../core/TreeStructureStore.js';
import { getDropAction, indentationToPx } from '../dropAction.js';
import { ReorderingEngine } from '../ReorderingEngine.js';
import { DEFAULT_REORDERING_LOCALE_TEXT } from '../types.js';
import { ITEMS, type TestItem } from '../../../tests/fixtures.js';

const base = {
  offsetX: 150,
  width: 200,
  height: 30,
  depth: 1,
  indentation: 24,
  isRtl: false,
  isLastChild: false,
  canReceiveChildren: true,
};

describe('getDropAction', () => {
  it('maps the pointer position to an action', () => {
    expect(getDropAction({ ...base, offsetY: 2 })).toBe('reorder-above');
    expect(getDropAction({ ...base, offsetY: 15 })).toBe('make-child');
    expect(getDropAction({ ...base, offsetY: 28 })).toBe('reorder-below');
    expect(getDropAction({ ...base, offsetY: 12, canReceiveChildren: false })).toBe(
      'reorder-above',
    );
    expect(getDropAction({ ...base, offsetY: 18, canReceiveChildren: false })).toBe(
      'reorder-below',
    );
    expect(getDropAction({ ...base, height: 0, offsetY: 0 })).toBe('make-child');
  });

  it('detects "move to parent" on the last child, in LTR and RTL', () => {
    const lastChild = { ...base, offsetY: 28, isLastChild: true };
    expect(getDropAction({ ...lastChild, offsetX: 10 })).toBe('move-to-parent');
    expect(getDropAction({ ...lastChild, offsetX: 100 })).toBe('reorder-below');
    expect(getDropAction({ ...lastChild, offsetX: 190, isRtl: true })).toBe('move-to-parent');
    expect(getDropAction({ ...lastChild, depth: 0, offsetX: 0 })).toBe('reorder-below');
  });
});

describe('indentationToPx', () => {
  it('converts CSS lengths', () => {
    expect(indentationToPx(undefined)).toBe(12);
    expect(indentationToPx(20)).toBe(20);
    expect(indentationToPx('24px')).toBe(24);
    expect(indentationToPx('1.5rem')).toBe(24);
    expect(indentationToPx('2em')).toBe(32);
    expect(indentationToPx('10')).toBe(10);
    expect(indentationToPx('calc(1px + 2px)')).toBe(12);
  });
});

describe('ReorderingEngine', () => {
  const create = (api: Record<string, any> = {}) => {
    const structure = new TreeStructureStore<TestItem>();
    structure.configure({ items: ITEMS }, false);
    const engine = new ReorderingEngine(structure, () => api);
    engine.config = { ...engine.config, enabled: true };
    return { structure, engine };
  };

  it('resolves positions for every action', () => {
    const { engine } = create({ isItemExpanded: () => false });
    expect(engine.resolvePosition('charts', 'grid', 'reorder-above')).toEqual({
      parentId: null,
      index: 0,
    });
    expect(engine.resolvePosition('charts', 'grid', 'reorder-below')).toEqual({
      parentId: null,
      index: 1,
    });
    expect(engine.resolvePosition('charts', 'grid', 'make-child')).toEqual({
      parentId: 'grid',
      index: 3,
    });
    expect(engine.resolvePosition('charts', 'grid-premium', 'move-to-parent')).toEqual({
      parentId: null,
      index: 1,
    });
    expect(engine.resolvePosition('charts', 'grid', 'move-to-parent')).toBeNull();
    expect(engine.resolvePosition('charts', 'unknown', 'make-child')).toBeNull();
    expect(engine.resolvePosition('unknown', 'grid', 'make-child')).toBeNull();
    // Moving inside the same parent, to the end.
    expect(engine.resolvePosition('grid-community', 'grid', 'make-child')).toEqual({
      parentId: 'grid',
      index: 2,
    });
  });

  it('refuses parents that cannot receive children', () => {
    const { engine } = create();
    engine.config = { ...engine.config, canItemReceiveChildren: (itemId) => itemId !== 'charts' };
    expect(engine.resolvePosition('tree-view', 'charts', 'make-child')).toBeNull();
    expect(engine.resolvePosition('tree-view', 'grid', 'make-child')).not.toBeNull();
  });

  it('is disabled when the config is disabled', () => {
    const { engine } = create();
    engine.config = { ...engine.config, enabled: false };
    expect(engine.isReorderable('grid')).toBe(false);
    const event = { altKey: true, shiftKey: true, key: 'ArrowUp' } as any;
    expect(engine.handleKeyDown(event, 'grid')).toBe(false);
  });

  it('applies moves, notifies and announces them', () => {
    const onItemPositionChange = vi.fn();
    const { engine, structure } = create();
    engine.config = { ...engine.config, onItemPositionChange };
    const announcer = vi.fn();
    engine.announcer.subscribe(announcer);
    engine.move('grid-pro', { parentId: null, index: 0 }, 'drag');
    expect(structure.getChildrenIds(null)[0]).toBe('grid-pro');
    expect(onItemPositionChange).toHaveBeenCalledWith({
      itemId: 'grid-pro',
      oldPosition: { parentId: 'grid', index: 1 },
      newPosition: { parentId: null, index: 0 },
    });
    expect(engine.announcement.message).toBe(
      DEFAULT_REORDERING_LOCALE_TEXT.itemMoved({
        itemId: 'grid-pro',
        oldPosition: { parentId: 'grid', index: 1 },
        newPosition: { parentId: null, index: 0 },
        label: 'Pro',
        parentLabel: null,
        siblingsCount: 5,
      }),
    );
    expect(announcer).toHaveBeenCalled();
    engine.move('unknown', { parentId: null, index: 0 }, 'drag');
    expect(onItemPositionChange).toHaveBeenCalledTimes(1);
    engine.dispose();
  });

  it('computes keyboard targets at the edges of the tree', () => {
    const { engine } = create();
    const key = (itemId: string, keyName: string) => {
      const target = {};
      return engine.handleKeyDown(
        {
          altKey: true,
          shiftKey: true,
          ctrlKey: false,
          metaKey: false,
          key: keyName,
          target,
          currentTarget: target,
          preventDefault: () => {},
        } as any,
        itemId,
      );
    };
    // Root edges and missing previous sibling: refused (announced) but handled.
    expect(key('grid', 'ArrowUp')).toBe(true);
    expect(engine.announcement.message).toBe('Data Grid cannot be moved there.');
    expect(key('tree-view', 'ArrowDown')).toBe(true);
    expect(key('grid', 'ArrowRight')).toBe(true);
    expect(key('grid', 'ArrowLeft')).toBe(true);
    expect(key('unknown', 'ArrowUp')).toBe(true);
    expect(key('grid', 'Enter')).toBe(false);
    engine.config = { ...engine.config, isRtl: true };
    // In RTL, ArrowLeft indents.
    expect(key('pickers', 'ArrowLeft')).toBe(true);
    expect(engine.announcement.message).toBe('Date Pickers moved to position 4 of 4 in Data Grid.');
  });

  it('ignores drag events without an active drag', () => {
    const { engine } = create();
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as any;
    engine.handleDragOver(event, 'grid');
    engine.handleDrop(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(engine.getAction('grid')).toBeNull();
    expect(engine.getPosition('unknown')).toBeNull();
  });
});
