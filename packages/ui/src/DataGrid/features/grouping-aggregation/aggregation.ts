import type { GridColDef, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { getCellValue, type ApiRef } from '../../core/columns.js';
import type { GridNode } from '../../core/tree.js';
import type { GridAggregationFunction, GridAggregationModel } from '../../public-types.js';

const numbers = (values: unknown[]) =>
  values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
const comparable = (values: unknown[]) =>
  values.filter((v) => (typeof v === 'number' && !Number.isNaN(v)) || v instanceof Date) as Array<
    number | Date
  >;

export const GRID_AGGREGATION_FUNCTIONS: Record<string, GridAggregationFunction> = {
  sum: {
    label: 'sum',
    columnTypes: ['number'],
    apply: ({ values }) => numbers(values).reduce((a, b) => a + b, 0),
  },
  avg: {
    label: 'avg',
    columnTypes: ['number'],
    apply: ({ values }) => {
      const nums = numbers(values);
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    },
  },
  min: {
    label: 'min',
    columnTypes: ['number', 'date', 'dateTime'],
    apply: ({ values }) => {
      const list = comparable(values);
      return list.length ? list.reduce((a, b) => (b < a ? b : a)) : null;
    },
  },
  max: {
    label: 'max',
    columnTypes: ['number', 'date', 'dateTime'],
    apply: ({ values }) => {
      const list = comparable(values);
      return list.length ? list.reduce((a, b) => (b > a ? b : a)) : null;
    },
  },
  size: {
    label: 'size',
    apply: ({ values }) => values.length,
    valueFormatter: (value) => String(value),
  },
};

export interface AggregationResult {
  /** Aggregates per group node id. */
  byGroup: Map<GridRowId, Record<string, unknown>>;
  /** Aggregates over every (filtered) leaf. */
  total: Record<string, unknown>;
}

export const EMPTY_AGGREGATION: AggregationResult = { byGroup: new Map(), total: {} };

/** Returns the aggregation functions applicable to a column. */
export function availableAggregationFunctions(
  col: GridColDef,
  functions: Record<string, GridAggregationFunction>,
): string[] {
  if ((col as { aggregable?: boolean }).aggregable === false) return [];
  const type = col.type ?? 'string';
  return Object.entries(functions)
    .filter(([, fn]) => !fn.columnTypes || fn.columnTypes.includes(type))
    .map(([name]) => name);
}

/**
 * Bottom-up aggregation over leaf rows (rows without children). Each group receives the values of
 * its filtered descendant leaves; the grand total covers all filtered leaves.
 */
export function aggregateTree<R extends GridValidRowModel>(
  roots: readonly GridNode<R>[],
  model: GridAggregationModel,
  lookup: Record<string, GridColDef<R>>,
  functions: Record<string, GridAggregationFunction>,
  apiRef: ApiRef,
): AggregationResult {
  const entries = Object.entries(model).filter(([field, fn]) => lookup[field] && functions[fn]);
  if (entries.length === 0) return EMPTY_AGGREGATION;
  const byGroup = new Map<GridRowId, Record<string, unknown>>();

  const visit = (node: GridNode<R>): unknown[][] => {
    if (!node.children) {
      return entries.map(([field]) => [getCellValue(node.row!, lookup[field], apiRef)]);
    }
    const acc: unknown[][] = entries.map(() => []);
    for (const child of node.children) {
      const values = visit(child);
      for (let i = 0; i < entries.length; i++) {
        const target = acc[i];
        for (const v of values[i]) target.push(v);
      }
    }
    const result: Record<string, unknown> = {};
    entries.forEach(([field, fn], i) => {
      result[field] = functions[fn].apply({ values: acc[i], field, groupId: node.id });
    });
    byGroup.set(node.id, result);
    return acc;
  };

  const all: unknown[][] = entries.map(() => []);
  for (const root of roots) {
    const values = visit(root);
    for (let i = 0; i < entries.length; i++) for (const v of values[i]) all[i].push(v);
  }
  const total: Record<string, unknown> = {};
  entries.forEach(([field, fn], i) => {
    total[field] = functions[fn].apply({ values: all[i], field, groupId: null });
  });
  return { byGroup, total };
}
