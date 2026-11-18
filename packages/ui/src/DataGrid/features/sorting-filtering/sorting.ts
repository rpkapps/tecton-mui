type GridSortItem = GridSortModel[number];
import type {
  GridColDef,
  GridComparatorFn,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { getCellValue, getComparator, type ApiRef } from '../../core/columns.js';
import type { GridNode } from '../../core/tree.js';
import type { AggregationResult } from '../grouping-aggregation/aggregation.js';

export interface SortContext<R extends GridValidRowModel> {
  lookup: Record<string, GridColDef<R>>;
  apiRef: ApiRef;
  aggregation: AggregationResult;
  /** Fields of generated grouping columns: sorting them orders groups by key / tree labels. */
  groupingFields: ReadonlySet<string>;
}

interface PreparedItem {
  field: string;
  comparator: GridComparatorFn;
  col: GridColDef;
}

function prepare<R extends GridValidRowModel>(
  model: GridSortModel,
  ctx: SortContext<R>,
): PreparedItem[] {
  const out: PreparedItem[] = [];
  for (const item of model) {
    if (!item.sort) continue;
    const col = ctx.lookup[item.field];
    if (!col || col.sortable === false) continue;
    const base = col.getSortComparator?.(item.sort);
    const comparator = base ?? directional(getComparator(col, item.sort), item);
    out.push({ field: item.field, comparator, col });
  }
  return out;
}

const directional = (cmp: GridComparatorFn, item: GridSortItem): GridComparatorFn =>
  item.sort === 'desc' ? (a, b, p1, p2) => -cmp(a, b, p1, p2) : cmp;

function nodeValue<R extends GridValidRowModel>(
  node: GridNode<R>,
  item: PreparedItem,
  ctx: SortContext<R>,
): unknown {
  if (ctx.groupingFields.has(item.field)) {
    if (node.label !== undefined) return node.label;
    return node.groupingField !== null ? node.groupingKey : undefined;
  }
  if (node.row) return getCellValue(node.row, item.col as GridColDef<R>, ctx.apiRef);
  return ctx.aggregation.byGroup.get(node.id)?.[item.field];
}

/**
 * Multi-column stable sort applied independently at every level of the hierarchy. Values are read
 * once per node and sort item (decorate-sort-undecorate) to keep large sorts fast.
 */
export function sortTree<R extends GridValidRowModel>(
  roots: GridNode<R>[],
  model: GridSortModel,
  ctx: SortContext<R>,
): GridNode<R>[] {
  const items = prepare(model, ctx);
  if (items.length === 0) return roots;
  const api = ctx.apiRef.current;

  const sortLevel = (nodes: GridNode<R>[]): GridNode<R>[] => {
    const decorated = nodes.map((node) => ({
      node,
      values: items.map((item) => nodeValue(node, item, ctx)),
      params: items.map((item) => ({
        id: node.id,
        field: item.field,
        value: undefined as unknown,
        rowNode: { id: node.id, depth: node.depth, type: node.children ? 'group' : 'leaf' },
        api,
      })),
    }));
    for (const d of decorated) d.params.forEach((p, i) => (p.value = d.values[i]));
    decorated.sort((a, b) => {
      for (let i = 0; i < items.length; i++) {
        const result = items[i].comparator(
          a.values[i],
          b.values[i],
          a.params[i] as never,
          b.params[i] as never,
        );
        if (result !== 0) return result;
      }
      return 0;
    });
    return decorated.map(({ node }) =>
      node.children ? { ...node, children: sortLevel(node.children) } : node,
    );
  };
  return sortLevel(roots);
}

/**
 * Next sort model after a header click: cycles the clicked column through `sortingOrder`
 * (asc -> desc -> none by default). With `multi`, other items are kept; otherwise replaced.
 */
export function nextSortModel(
  model: GridSortModel,
  field: string,
  sortingOrder: ReadonlyArray<GridSortItem['sort']>,
  multi: boolean,
): GridSortModel {
  const existing = model.find((i) => i.field === field);
  const order = sortingOrder.length ? sortingOrder : (['asc', 'desc', null] as const);
  const currentIndex = existing ? order.indexOf(existing.sort) : -1;
  const next = order[(currentIndex + 1) % order.length] ?? null;
  if (!multi) return next ? [{ field, sort: next }] : [];
  if (!existing) return next ? [...model, { field, sort: next }] : model;
  return next
    ? model.map((i) => (i.field === field ? { field, sort: next } : i))
    : model.filter((i) => i.field !== field);
}
