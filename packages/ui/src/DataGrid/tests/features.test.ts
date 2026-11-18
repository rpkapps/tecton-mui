import {
  defaultSplitClipboardText,
  isModelEmpty,
  mergeModels,
  rangeModel,
  selectionCss,
  selectionOrigin,
  selectionToMatrix,
  toTsv,
  toggleCell,
} from '../features/selection-clipboard/cellSelection.js';
import { HistoryStack, isRedoShortcut, isUndoShortcut } from '../features/undo-redo/history.js';
import {
  applyPinnedOrder,
  normalizePinned,
  pinnedColumnClasses,
  pinnedColumnsSx,
} from '../features/pinning-reordering/columnPinning.js';
import { moveField } from '../features/pinning-reordering/useColumnReorder.js';
import { moveId } from '../features/pinning-reordering/useRowReorder.js';
import {
  DragPreview,
  cssString,
  isInteractiveTarget,
  logicalScrollLeft,
} from '../features/pinning-reordering/dragPreview.js';
import { cacheKey, GridDataSourceCacheDefault } from '../features/server-data/cache.js';
import { Store } from '../core/store.js';

describe('cell selection model', () => {
  const rows = [1, 2, 3];
  const fields = ['a', 'b', 'c'];
  it('builds rectangles, merges and toggles', () => {
    const rect = rangeModel({ id: 3, field: 'c' }, { id: 2, field: 'b' }, rows, fields);
    expect(rect).toEqual({ 2: { b: true, c: true }, 3: { b: true, c: true } });
    expect(rangeModel({ id: 9, field: 'a' }, { id: 1, field: 'a' }, rows, fields)).toEqual({});
    const merged = mergeModels(rect, { 1: { a: true } });
    expect(Object.keys(merged)).toEqual(['1', '2', '3']);
    const toggled = toggleCell(toggleCell({}, { id: 1, field: 'a' }), { id: 1, field: 'a' });
    expect(toggled).toEqual({});
    expect(isModelEmpty(toggled)).toBe(true);
    expect(isModelEmpty(rect)).toBe(false);
  });

  it('generates grouped CSS rules and TSV text', () => {
    const rect = rangeModel({ id: 1, field: 'a' }, { id: 2, field: 'b' }, rows, fields);
    // Without order: one tint rule plus a full border per cell.
    const css = selectionCss('scope', rect);
    expect(css.match(/\{/g)).toHaveLength(2);
    // With order: the 2x2 rectangle gets the tint plus one border rule per corner, each with the
    // two outside edges only.
    const ordered = selectionCss('scope', rect, rows, fields);
    expect(ordered.match(/\{/g)).toHaveLength(5);
    expect(ordered).toContain(
      ':is([data-field="a"]){box-shadow:inset 0 2px 0 0 var(--DataGrid-t-color-interactive-focus, #1976d2),inset 2px 0 0 0',
    );
    const tall = selectionCss(
      'scope',
      rangeModel({ id: 1, field: 'a' }, { id: 3, field: 'a' }, rows, fields),
      rows,
      fields,
    );
    // The middle cell of a 3x1 column has only left and right edges.
    expect(tall).toContain(
      `[data-id="${CSS.escape('2')}"]) > .MuiDataGrid-cell:is([data-field="a"]){box-shadow:inset -2px 0 0 0`,
    );
    expect(css).toContain(`[data-id="${CSS.escape('1')}"]`);
    expect(css).toContain('[data-field="b"]');
    expect(selectionCss('scope', {})).toBe('');
    const matrix = selectionToMatrix(rect, rows, fields, (id, f) => `${id}${f}`);
    expect(matrix).toEqual([
      ['1a', '1b'],
      ['2a', '2b'],
    ]);
    expect(toTsv([['x\ty', 'z']])).toBe('x y\tz');
    expect(selectionOrigin(rect, rows, fields)).toEqual({ id: 1, field: 'a' });
    expect(selectionOrigin({}, rows, fields)).toBeNull();
  });

  it('parses pasted text', () => {
    expect(defaultSplitClipboardText('a\tb\r\nc\td\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(defaultSplitClipboardText('single')).toEqual([['single']]);
  });
});

describe('history', () => {
  it('records, undoes, redoes and bounds the stack', () => {
    const h = new HistoryStack(2);
    h.record({ type: 'rowOrder', before: [1], after: [2] });
    h.record({ type: 'rowOrder', before: [2], after: [3] });
    h.record({ type: 'rowOrder', before: [3], after: [4] });
    expect(h.popUndo()).toMatchObject({ before: [3] });
    expect(h.popUndo()).toMatchObject({ before: [2] });
    expect(h.popUndo()).toBeUndefined();
    expect(h.canRedo()).toBe(true);
    expect(h.popRedo()).toMatchObject({ after: [3] });
    h.record({ type: 'rowOrder', before: [0], after: [0] });
    expect(h.canRedo()).toBe(false);
    h.clear();
    expect(h.canUndo()).toBe(false);
    const disabled = new HistoryStack(0);
    disabled.record({ type: 'rowOrder', before: [], after: [] });
    expect(disabled.canUndo()).toBe(false);
  });

  it('detects shortcuts', () => {
    const ev = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);
    expect(isUndoShortcut(ev({ key: 'z', ctrlKey: true }))).toBe(true);
    expect(isUndoShortcut(ev({ key: 'z', ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(isRedoShortcut(ev({ key: 'Z', metaKey: true, shiftKey: true }))).toBe(true);
    expect(isRedoShortcut(ev({ key: 'y', ctrlKey: true }))).toBe(true);
    expect(isRedoShortcut(ev({ key: 'y' }))).toBe(false);
  });
});

describe('pinning & reordering helpers', () => {
  it('orders and classes pinned columns', () => {
    expect(applyPinnedOrder(['a', 'b', 'c', 'd'], { left: ['c', 'x'], right: ['a'] })).toEqual([
      'c',
      'b',
      'd',
      'a',
    ]);
    expect(normalizePinned({ left: ['a', 'z'], right: ['a', 'b'] }, ['a', 'b'])).toEqual({
      left: ['a'],
      right: ['b'],
    });
    const classes = pinnedColumnClasses({ left: ['a', 'b'], right: ['c'] });
    expect(classes.get('a')!.cell).toContain('MuiDataGrid-cell--pinnedLeft tdg-pl-0');
    expect(classes.get('b')!.cell).toContain('withRightBorder');
    expect(classes.get('c')!.header).toContain('columnHeader--pinnedRight tdg-pr-0');
    expect(pinnedColumnsSx(0, 0)).toBeUndefined();
    expect(pinnedColumnsSx(1, 1)).toEqual({
      '& .tdg-pl-0': { left: 'var(--tdg-pl-0, 0px)' },
      '& .tdg-pr-0': { right: 'var(--tdg-pr-0, 0px)' },
    });
  });

  it('moves fields and ids', () => {
    expect(moveField(['a', 'b', 'c'], 'c', 'a', false)).toEqual(['c', 'a', 'b']);
    expect(moveField(['a', 'b', 'c'], 'a', 'c', true)).toEqual(['b', 'c', 'a']);
    expect(moveField(['a', 'b'], 'a', 'zz', true)).toEqual(['a', 'b']);
    expect(moveId([1, 2, 3], 1, 3, true)).toEqual([2, 3, 1]);
    expect(moveId([1, 2], 1, 9, true)).toEqual([1, 2]);
  });

  it('manages DOM-only drag feedback and detects interactive targets', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const preview = new DragPreview(root);
    preview.begin();
    expect(root.getAttribute('data-tdg-drag')).toMatch(/^tdg-drag-/);
    preview.setShifts('.a', [{ targets: ['.b'], transform: 'translateX(4px)' }]);
    const style = document.querySelector('style[data-tecton-grid-drag]')!;
    expect(style.textContent).toContain(`${preview.selector} .b{transform:translateX(4px)`);
    const ghost = document.createElement('div');
    preview.showGhost(
      ghost,
      { left: 0, top: 0, width: 50, height: 20 } as DOMRect,
      { x: 10, y: 5 },
      {},
    );
    expect(document.querySelectorAll('.TectonDataGrid-dragGhost')).toHaveLength(1);
    expect(ghost.style.boxShadow).not.toMatch(/255/);
    preview.moveGhost(30, 25);
    expect(ghost.style.transform).toBe('translate(20px, 20px)');
    preview.dispose();
    expect(document.querySelector('.TectonDataGrid-dragGhost')).toBeNull();
    expect(document.querySelector('style[data-tecton-grid-drag]')).toBeNull();
    expect(root.hasAttribute('data-tdg-drag')).toBe(false);
    expect(cssString('a"b')).toBe('a\\"b');
    expect(logicalScrollLeft(null, false)).toBe(0);
    root.remove();
    const button = document.createElement('button');
    expect(isInteractiveTarget(button)).toBe(true);
    expect(isInteractiveTarget(document.createElement('div'))).toBe(false);
    expect(isInteractiveTarget(null)).toBe(false);
  });
});

describe('server data cache', () => {
  it('stores with TTL and clears', () => {
    vi.useFakeTimers();
    const cache = new GridDataSourceCacheDefault(1000);
    const key = cacheKey({
      sortModel: [],
      filterModel: { items: [] },
      start: 0,
      end: 9,
      groupKeys: [],
      groupFields: [],
    });
    cache.set(key, { rows: [] });
    expect(cache.get(key)).toEqual({ rows: [] });
    vi.advanceTimersByTime(1001);
    expect(cache.get(key)).toBeUndefined();
    cache.set(key, { rows: [] });
    cache.clear();
    expect(cache.get(key)).toBeUndefined();
    vi.useRealTimers();
  });
});

describe('store', () => {
  it('notifies only on actual changes', () => {
    const store = new Store({ a: 1, b: 2 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setState({ a: 1 });
    expect(listener).not.toHaveBeenCalled();
    store.setState((s) => ({ b: s.b + 1 }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState()).toEqual({ a: 1, b: 3 });
    unsubscribe();
    store.setState({ a: 5 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
