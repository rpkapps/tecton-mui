import {
  GridLogicOperator,
  type GridColDef,
  type GridColumnVisibilityModel,
  type GridFilterItem,
  type GridFilterModel,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import { getCellValue, type ApiRef } from '../../core/columns.js';
import type { GridNode } from '../../core/tree.js';

export const EMPTY_FILTER_MODEL: GridFilterModel = { items: [] };

type RowPredicate<R> = (row: R) => boolean;

function itemPredicate<R extends GridValidRowModel>(
  item: GridFilterItem,
  lookup: Record<string, GridColDef<R>>,
  apiRef: ApiRef,
): RowPredicate<R> | null {
  const col = lookup[item.field];
  if (!col || col.filterable === false) return null;
  const operator = col.filterOperators?.find((op) => op.value === item.operator);
  if (!operator) return null;
  if (
    operator.requiresFilterValue !== false &&
    (item.value === undefined || item.value === '' || item.value === null)
  ) {
    return null;
  }
  const apply = operator.getApplyFilterFn(item, col);
  if (!apply) return null;
  return (row) => apply(getCellValue(row, col, apiRef), row, col, apiRef as never);
}

/**
 * Compiles a (multi-item) filter model into a row predicate, or `null` when nothing filters.
 * Supports `logicOperator` and quick filter values, matching Community operator semantics.
 */
export function compileFilterModel<R extends GridValidRowModel>(
  model: GridFilterModel,
  lookup: Record<string, GridColDef<R>>,
  apiRef: ApiRef,
  columnVisibilityModel: GridColumnVisibilityModel = {},
): RowPredicate<R> | null {
  const predicates = model.items
    .map((item) => itemPredicate(item, lookup, apiRef))
    .filter((p): p is RowPredicate<R> => p !== null);
  const isOr = model.logicOperator === GridLogicOperator.Or;
  const itemsFn: RowPredicate<R> | null =
    predicates.length === 0
      ? null
      : isOr
        ? (row) => predicates.some((p) => p(row))
        : (row) => predicates.every((p) => p(row));

  const quickValues = (model.quickFilterValues ?? []).filter((v) => v !== '' && v != null);
  let quickFn: RowPredicate<R> | null = null;
  if (quickValues.length) {
    const excludeHidden = model.quickFilterExcludeHiddenColumns ?? true;
    const cols = Object.values(lookup).filter(
      (c) =>
        c.getApplyQuickFilterFn &&
        c.filterable !== false &&
        !(excludeHidden && columnVisibilityModel[c.field] === false),
    );
    const perValue = quickValues.map((value) => {
      const fns = cols
        .map((c) => {
          const fn = c.getApplyQuickFilterFn!(value, c as never, apiRef as never);
          return fn
            ? (row: R) => fn(getCellValue(row, c, apiRef) as never, row, c, apiRef as never)
            : null;
        })
        .filter((f): f is RowPredicate<R> => f !== null);
      return (row: R) => fns.some((f) => f(row));
    });
    const quickOr = model.quickFilterLogicOperator === GridLogicOperator.Or;
    quickFn = quickOr
      ? (row) => perValue.some((p) => p(row))
      : (row) => perValue.every((p) => p(row));
  }

  if (!itemsFn && !quickFn) return null;
  if (itemsFn && quickFn) return (row) => itemsFn(row) && quickFn(row);
  return itemsFn ?? quickFn;
}

/**
 * Filters the hierarchy. Groups (and tree-data parents) stay visible while any descendant passes;
 * a tree-data parent that passes itself stays visible even when no child passes.
 */
export function filterTree<R extends GridValidRowModel>(
  roots: GridNode<R>[],
  predicate: RowPredicate<R> | null,
): GridNode<R>[] {
  if (!predicate) return roots;
  const visit = (nodes: GridNode<R>[]): GridNode<R>[] => {
    const out: GridNode<R>[] = [];
    for (const node of nodes) {
      if (!node.children) {
        if (node.row && predicate(node.row)) out.push(node);
        continue;
      }
      const children = visit(node.children);
      const selfPasses = node.row ? predicate(node.row) : false;
      if (children.length > 0 || selfPasses) {
        out.push(
          children.length === node.children.length
            ? node
            : { ...node, children: children.length ? children : null },
        );
      }
    }
    return out;
  };
  return visit(roots);
}

/** Merges filter items coming from Community UI (column menu, quick filter) into our model. */
export function mergeCommunityFilterModel(
  current: GridFilterModel,
  incoming: GridFilterModel,
): GridFilterModel {
  const items = [...current.items];
  for (const item of incoming.items) {
    const byId = item.id != null ? items.findIndex((i) => i.id === item.id) : -1;
    if (byId >= 0) items[byId] = item;
    else if (!items.some((i) => i.field === item.field)) {
      items.push({ ...item, id: item.id ?? `${item.field}-${Date.now()}` });
    }
  }
  return {
    ...current,
    items,
    quickFilterValues: incoming.quickFilterValues ?? current.quickFilterValues,
    quickFilterLogicOperator: incoming.quickFilterLogicOperator ?? current.quickFilterLogicOperator,
  };
}

/** Number of active (complete) filter items per field, for header filter icon counters. */
export function countFiltersByField(
  model: GridFilterModel,
  lookup: Record<string, GridColDef> = {},
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of model.items) {
    const op = lookup[item.field]?.filterOperators?.find((o) => o.value === item.operator);
    const needsValue = op ? op.requiresFilterValue !== false : true;
    const hasValue = !(
      item.value === undefined ||
      item.value === null ||
      item.value === '' ||
      (Array.isArray(item.value) && item.value.length === 0)
    );
    if (needsValue && !hasValue) continue;
    counts[item.field] = (counts[item.field] ?? 0) + 1;
  }
  return counts;
}
