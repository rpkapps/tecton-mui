import { GridLogicOperator, type GridColDef } from '@mui/x-data-grid';
import { resolveColumn, getCellValue, getFormattedValue, getComparator } from '../core/columns.js';
import {
  flattenTree,
  paginate,
  SyntheticRowCache,
  isNodeExpanded,
  groupInfo,
} from '../core/pipeline.js';
import { getSynthetic, getRowAggregates } from '../core/rows.js';
import { collectRows, forEachNode, isGroupNode } from '../core/tree.js';
import { buildTreeDataHierarchy } from '../features/tree-data/treeData.js';
import {
  buildFlatHierarchy,
  buildRowGroupingHierarchy,
} from '../features/grouping-aggregation/rowGrouping.js';
import {
  aggregateTree,
  availableAggregationFunctions,
  EMPTY_AGGREGATION,
  GRID_AGGREGATION_FUNCTIONS,
} from '../features/grouping-aggregation/aggregation.js';
import {
  compileFilterModel,
  countFiltersByField,
  filterTree,
  mergeCommunityFilterModel,
} from '../features/sorting-filtering/filtering.js';
import { nextSortModel, sortTree } from '../features/sorting-filtering/sorting.js';

type Row = {
  id: number;
  name: string;
  dept: string | null;
  salary: number;
  hired: Date;
  path?: string[];
};
const rows: Row[] = [
  { id: 1, name: 'Ada', dept: 'Eng', salary: 300, hired: new Date(2020, 0, 1) },
  { id: 2, name: 'Bob', dept: 'Ops', salary: 100, hired: new Date(2021, 0, 1) },
  { id: 3, name: 'Cy', dept: 'Eng', salary: 200, hired: new Date(2019, 0, 1) },
  { id: 4, name: 'Di', dept: null, salary: 50, hired: new Date(2018, 0, 1) },
];
const cols: GridColDef<Row>[] = [
  { field: 'name' },
  { field: 'dept' },
  { field: 'salary', type: 'number', valueFormatter: (v: number) => `$${v}` },
  { field: 'hired', type: 'date' },
  { field: 'double', type: 'number', valueGetter: (_v, row) => row.salary * 2 },
];
const lookup = Object.fromEntries(cols.map((c) => [c.field, resolveColumn(c)]));
const lookupAll = lookup;
const apiRef = { current: null };
const getId = (r: Row) => r.id;
const ctx = {
  lookup,
  apiRef,
  aggregation: EMPTY_AGGREGATION,
  groupingFields: new Set(['__group__']),
};
const expansionAll = { overrides: new Map(), defaultDepth: -1 };
const inline = () => true;

describe('columns', () => {
  it('resolves type defaults and reads values through valueGetter/formatter', () => {
    expect(lookup.salary.filterOperators?.length).toBeGreaterThan(0);
    expect(getCellValue(rows[0], lookup.double, apiRef)).toBe(600);
    expect(getFormattedValue(rows[0], lookup.salary, apiRef)).toBe('$300');
    expect(getFormattedValue(rows[0], lookup.name, apiRef)).toBe('Ada');
    expect(() => getComparator({ field: 'x' } as GridColDef, 'asc')).toThrow();
  });
});

describe('hierarchy builders', () => {
  it('builds tree data with auto-generated parents and adopts later real parents', () => {
    const tree = buildTreeDataHierarchy(
      [
        { id: 1, path: ['a', 'b'] },
        { id: 2, path: ['a'] },
        { id: 3, path: ['c'] },
        { id: 4, path: [] },
      ],
      (r) => r.id,
      (r) => r.path,
    );
    expect(tree.map((n) => n.id)).toEqual([2, 3]);
    expect(tree[0].children![0].id).toBe(1);
    expect(tree[1].children).toBeNull();
    expect(isGroupNode(tree[0])).toBe(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    buildTreeDataHierarchy(
      [
        { id: 1, path: ['x'] },
        { id: 2, path: ['x'] },
      ],
      (r) => r.id,
      (r) => r.path,
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    const auto = buildTreeDataHierarchy(
      [{ id: 9, path: ['p', 'q'] }],
      (r) => r.id,
      (r) => r.path,
    );
    expect(String(auto[0].id)).toContain('auto-generated-row-');
    expect(auto[0].row).toBeNull();
  });

  it('groups rows by multiple fields in first-appearance order', () => {
    const tree = buildRowGroupingHierarchy(rows, getId, ['dept', 'name'], lookup, apiRef);
    expect(tree.map((n) => n.groupingKey)).toEqual(['Eng', 'Ops', null]);
    expect(tree[0].children!.map((n) => n.groupingKey)).toEqual(['Ada', 'Cy']);
    expect(tree[0].children![0].children![0].row).toBe(rows[0]);
    expect(buildRowGroupingHierarchy(rows, getId, ['unknown'], lookup, apiRef)).toHaveLength(4);
    const byDate = buildRowGroupingHierarchy(rows, getId, ['hired'], lookup, apiRef);
    expect(byDate).toHaveLength(4);
    expect(collectRows(tree)).toHaveLength(4);
    let count = 0;
    forEachNode(tree, () => count++);
    expect(count).toBe(4 + 3 + 4);
  });
});

describe('filtering', () => {
  const quickApiRef = {
    current: {
      getRowFormattedValue: (row: Row, col: GridColDef<Row>) => getFormattedValue(row, col, apiRef),
    },
  } as never;
  const flat = buildFlatHierarchy(rows, getId);
  it('applies AND / OR logic and skips incomplete items', () => {
    const and = compileFilterModel(
      {
        items: [
          { id: 1, field: 'dept', operator: 'equals', value: 'Eng' },
          { id: 2, field: 'salary', operator: '>', value: 250 },
          { id: 3, field: 'name', operator: 'contains', value: '' },
        ],
      },
      lookup,
      apiRef,
    );
    expect(filterTree(flat, and).map((n) => n.id)).toEqual([1]);
    const or = compileFilterModel(
      {
        logicOperator: GridLogicOperator.Or,
        items: [
          { id: 1, field: 'dept', operator: 'equals', value: 'Ops' },
          { id: 2, field: 'salary', operator: '<', value: 60 },
        ],
      },
      lookup,
      apiRef,
    );
    expect(filterTree(flat, or).map((n) => n.id)).toEqual([2, 4]);
    expect(
      compileFilterModel(
        { items: [{ field: 'missing', operator: 'x', value: 1 }] },
        lookup,
        apiRef,
      ),
    ).toBeNull();
    expect(filterTree(flat, null)).toBe(flat);
  });

  it('supports quick filter values (AND/OR) and hidden columns', () => {
    // Quick-filter functions of non-string types read grid state; string columns suffice here.
    const lookup = { name: lookupAll.name, dept: lookupAll.dept, salary: lookupAll.salary };
    const strings = { name: lookup.name, dept: lookup.dept };
    const q = compileFilterModel(
      { items: [], quickFilterValues: ['eng', 'ada'] },
      strings,
      quickApiRef,
    );
    expect(filterTree(flat, q).map((n) => n.id)).toEqual([1]);
    const qOr = compileFilterModel(
      {
        items: [],
        quickFilterValues: ['ops', 'cy'],
        quickFilterLogicOperator: GridLogicOperator.Or,
      },
      strings,
      quickApiRef,
    );
    expect(filterTree(flat, qOr).map((n) => n.id)).toEqual([2, 3]);
    const hidden = compileFilterModel(
      { items: [], quickFilterValues: ['ops'] },
      strings,
      quickApiRef,
      { dept: false },
    );
    expect(filterTree(flat, hidden)).toHaveLength(0);
    const both = compileFilterModel(
      {
        items: [{ id: 1, field: 'salary', operator: '>', value: 150 }],
        quickFilterValues: ['eng'],
      },
      { ...lookup, salary: { ...lookup.salary, getApplyQuickFilterFn: undefined } },
      quickApiRef,
    );
    expect(filterTree(flat, both).map((n) => n.id)).toEqual([1, 3]);
  });

  it('keeps groups with passing descendants and passing tree parents', () => {
    const grouped = buildRowGroupingHierarchy(rows, getId, ['dept'], lookup, apiRef);
    const p = compileFilterModel(
      { items: [{ id: 1, field: 'name', operator: 'equals', value: 'Cy' }] },
      lookup,
      apiRef,
    );
    const out = filterTree(grouped, p);
    expect(out).toHaveLength(1);
    expect(out[0].children!.map((n) => n.id)).toEqual([3]);
    const tree = buildTreeDataHierarchy(
      [
        { id: 1, name: 'parent', path: ['p'] },
        { id: 2, name: 'child', path: ['p', 'c'] },
      ],
      (r) => r.id,
      (r) => r.path,
    );
    const parentOnly = filterTree(tree, (r) => r.name === 'parent');
    expect(parentOnly[0].children).toBeNull();
  });

  it('merges Community filter emissions as upserts and counts per field', () => {
    const current = { items: [{ id: 'a', field: 'name', operator: 'contains', value: 'x' }] };
    const merged = mergeCommunityFilterModel(current, {
      items: [
        { id: 'a', field: 'name', operator: 'contains', value: 'y' },
        { field: 'dept', operator: 'equals' },
        { field: 'name', operator: 'equals' },
      ],
      quickFilterValues: ['q'],
    });
    expect(merged.items).toHaveLength(2);
    expect(merged.items[0].value).toBe('y');
    expect(merged.quickFilterValues).toEqual(['q']);
    expect(countFiltersByField(merged)).toEqual({ name: 1, dept: 1 });
  });
});

describe('sorting', () => {
  it('sorts by multiple columns stably', () => {
    const flat = buildFlatHierarchy(rows, getId);
    const sorted = sortTree(
      flat,
      [
        { field: 'dept', sort: 'asc' },
        { field: 'salary', sort: 'desc' },
      ],
      ctx,
    );
    expect(sorted.map((n) => n.id)).toEqual([4, 1, 3, 2]);
    expect(sortTree(flat, [], ctx)).toBe(flat);
    expect(sortTree(flat, [{ field: 'unknown', sort: 'asc' }], ctx)).toBe(flat);
    const custom = sortTree(flat, [{ field: 'name', sort: 'desc' }], {
      ...ctx,
      lookup: {
        ...lookup,
        name: {
          ...lookup.name,
          getSortComparator: () => (a: string, b: string) => b.localeCompare(a),
        },
      },
    });
    expect(custom.map((n) => n.id)).toEqual([4, 3, 2, 1]);
  });

  it('sorts groups by key (grouping column) and by aggregated values', () => {
    const grouped = buildRowGroupingHierarchy(rows, getId, ['dept'], lookup, apiRef);
    const aggregation = aggregateTree(
      grouped,
      { salary: 'sum' },
      lookup,
      GRID_AGGREGATION_FUNCTIONS,
      apiRef,
    );
    const byKey = sortTree(grouped, [{ field: '__group__', sort: 'desc' }], {
      ...ctx,
      aggregation,
      lookup: { ...lookup, __group__: resolveColumn({ field: '__group__' }) },
    });
    expect(byKey.map((n) => n.groupingKey)).toEqual(['Ops', 'Eng', null]);
    const byAgg = sortTree(grouped, [{ field: 'salary', sort: 'asc' }], { ...ctx, aggregation });
    expect(byAgg.map((n) => n.groupingKey)).toEqual([null, 'Ops', 'Eng']);
    expect(byAgg[2].children!.map((n) => n.id)).toEqual([3, 1]);
  });

  it('computes the next model for header clicks', () => {
    const order = ['asc', 'desc', null] as const;
    expect(nextSortModel([], 'a', order, false)).toEqual([{ field: 'a', sort: 'asc' }]);
    expect(nextSortModel([{ field: 'a', sort: 'asc' }], 'a', order, false)).toEqual([
      { field: 'a', sort: 'desc' },
    ]);
    expect(nextSortModel([{ field: 'a', sort: 'desc' }], 'a', order, false)).toEqual([]);
    const multi = nextSortModel([{ field: 'a', sort: 'asc' }], 'b', order, true);
    expect(multi).toEqual([
      { field: 'a', sort: 'asc' },
      { field: 'b', sort: 'asc' },
    ]);
    expect(nextSortModel(multi, 'b', order, true)[1]).toEqual({ field: 'b', sort: 'desc' });
    expect(nextSortModel([{ field: 'b', sort: 'desc' }], 'b', order, true)).toEqual([]);
    expect(nextSortModel([{ field: 'x', sort: 'asc' }], 'b', [null], true)).toEqual([
      { field: 'x', sort: 'asc' },
    ]);
    expect(nextSortModel([], 'b', [], false)).toEqual([{ field: 'b', sort: 'asc' }]);
  });
});

describe('aggregation', () => {
  it('aggregates leaves bottom-up with built-in functions', () => {
    const grouped = buildRowGroupingHierarchy(rows, getId, ['dept'], lookup, apiRef);
    const result = aggregateTree(
      grouped,
      { salary: 'sum', double: 'avg', hired: 'max', name: 'size', ignored: 'sum' },
      lookup,
      GRID_AGGREGATION_FUNCTIONS,
      apiRef,
    );
    expect(result.total).toMatchObject({ salary: 650, double: 325, name: 4 });
    expect(result.total.hired).toEqual(new Date(2021, 0, 1));
    expect(result.byGroup.get(grouped[0].id)).toMatchObject({ salary: 500, name: 2 });
    expect(aggregateTree(grouped, {}, lookup, GRID_AGGREGATION_FUNCTIONS, apiRef)).toBe(
      EMPTY_AGGREGATION,
    );
    const empty = GRID_AGGREGATION_FUNCTIONS;
    expect(empty.avg.apply({ values: [], field: 'x', groupId: null })).toBeNull();
    expect(empty.min.apply({ values: [3, 1, 2], field: 'x', groupId: null })).toBe(1);
    expect(empty.min.apply({ values: [], field: 'x', groupId: null })).toBeNull();
    expect(empty.max.apply({ values: [], field: 'x', groupId: null })).toBeNull();
    expect(empty.size.valueFormatter!(3)).toBe('3');
  });

  it('lists functions applicable to a column type', () => {
    expect(availableAggregationFunctions(lookup.salary, GRID_AGGREGATION_FUNCTIONS)).toEqual([
      'sum',
      'avg',
      'min',
      'max',
      'size',
    ]);
    expect(availableAggregationFunctions(lookup.name, GRID_AGGREGATION_FUNCTIONS)).toEqual([
      'size',
    ]);
    expect(
      availableAggregationFunctions(
        { ...lookup.name, aggregable: false } as unknown as GridColDef,
        GRID_AGGREGATION_FUNCTIONS,
      ),
    ).toEqual([]);
  });
});

describe('flatten & paginate', () => {
  it('flattens with expansion, stable synthetic rows and detail panels', () => {
    const grouped = buildRowGroupingHierarchy(rows, getId, ['dept'], lookup, apiRef);
    const aggregation = aggregateTree(
      grouped,
      { salary: 'sum' },
      lookup,
      GRID_AGGREGATION_FUNCTIONS,
      apiRef,
    );
    const cache = new SyntheticRowCache();
    const collapsed = flattenTree(
      grouped,
      { overrides: new Map(), defaultDepth: 0 },
      aggregation,
      null,
      cache,
      inline,
    );
    expect(collapsed.rows).toHaveLength(3);
    expect(getSynthetic(collapsed.rows[0])?.aggregates).toEqual({ salary: 500 });
    const expanded = flattenTree(
      grouped,
      { overrides: new Map([[grouped[0].id, true]]), defaultDepth: 0 },
      aggregation,
      new Set([1]),
      cache,
      inline,
    );
    expect(expanded.rows).toHaveLength(6);
    expect(expanded.detailCount).toBe(1);
    expect(getSynthetic(expanded.rows[2])?.kind).toBe('detail');
    // Group rows keep their identity across flattens (no needless Community re-renders).
    expect(expanded.rows[0]).toBe(collapsed.rows[0]);
    expect(expanded.rows[4]).toBe(collapsed.rows[1]);
    expect(expanded.meta.get(grouped[0].id)).toMatchObject({ isGroup: true, childrenCount: 2 });
    const noInline = flattenTree(
      grouped,
      expansionAll,
      aggregation,
      null,
      new SyntheticRowCache(),
      () => false,
    );
    expect(getSynthetic(noInline.rows[0])?.aggregates).toBeUndefined();
  });

  it('attaches aggregates to tree-data parent copies without mutating user rows', () => {
    const data = [
      { id: 1, size: 0, path: ['a'] },
      { id: 2, size: 5, path: ['a', 'b'] },
    ];
    const tree = buildTreeDataHierarchy(
      data,
      (r) => r.id,
      (r) => r.path,
    );
    const sizeCol = { ...resolveColumn({ field: 'size', type: 'number' }) };
    const aggregation = aggregateTree(
      tree,
      { size: 'sum' },
      { size: sizeCol },
      GRID_AGGREGATION_FUNCTIONS,
      apiRef,
    );
    const out = flattenTree(tree, expansionAll, aggregation, null, new SyntheticRowCache(), inline);
    expect(out.rows[0]).not.toBe(data[0]);
    expect(getRowAggregates(out.rows[0])).toEqual({ size: 5 });
    expect(data[0]).not.toHaveProperty('size', 5);
  });

  it('evaluates default expansion rules', () => {
    const node = {
      id: 'g',
      depth: 1,
      row: null,
      children: [],
      groupingField: 'dept',
      groupingKey: 'x',
    };
    expect(isNodeExpanded(node, { overrides: new Map(), defaultDepth: 2 })).toBe(true);
    expect(isNodeExpanded(node, { overrides: new Map(), defaultDepth: 1 })).toBe(false);
    expect(
      isNodeExpanded(node, {
        overrides: new Map(),
        defaultDepth: 0,
        isGroupExpandedByDefault: (n) => n.groupingKey === 'x',
      }),
    ).toBe(true);
    expect(isNodeExpanded(node, { overrides: new Map([['g', false]]), defaultDepth: -1 })).toBe(
      false,
    );
    expect(groupInfo(node)).toMatchObject({ id: 'g', childrenCount: 0 });
  });

  it('paginates, keeping attached rows with their master row', () => {
    const list = ['a', 'a-detail', 'b', 'c', 'c-detail', 'd'];
    const attached = (r: string) => r.endsWith('-detail');
    expect(paginate(list, 0, 2, true, attached)).toEqual(['a', 'a-detail', 'b']);
    expect(paginate(list, 1, 2, true, attached)).toEqual(['c', 'c-detail', 'd']);
    expect(paginate(list, 1, 2, true)).toEqual(['b', 'c']);
    expect(paginate(list, 1, 2, false)).toBe(list);
  });
});
