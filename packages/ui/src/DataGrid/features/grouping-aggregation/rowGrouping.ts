import type { GridColDef, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { GROUP_ID_PREFIX } from '../../core/rows.js';
import { getCellValue, type ApiRef } from '../../core/columns.js';
import type { GridNode } from '../../core/tree.js';

export const ROW_GROUPING_SINGLE_FIELD = '__row_group_by_columns_group__';
export const rowGroupingMultipleField = (field: string) =>
  `__row_group_by_columns_group_${field}__`;

/** Normalized key used for group identity (Dates by time, nullish as empty). */
function keyOf(value: unknown): unknown {
  if (value instanceof Date) return value.getTime();
  return value ?? '';
}

export function getGroupingValue<R extends GridValidRowModel>(
  row: R,
  col: GridColDef<R>,
  apiRef: ApiRef,
): unknown {
  const getter = (
    col as GridColDef<R> & {
      groupingValueGetter?: (v: unknown, r: R, c: GridColDef<R>, a: ApiRef) => unknown;
    }
  ).groupingValueGetter;
  const value = getter
    ? getter((row as Record<string, unknown>)[col.field], row, col, apiRef)
    : getCellValue(row, col, apiRef);
  return value;
}

/** Groups rows by the fields of `model` (outer to inner). Group order follows first appearance. */
export function buildRowGroupingHierarchy<R extends GridValidRowModel>(
  rows: readonly R[],
  getRowId: (row: R) => GridRowId,
  model: readonly string[],
  lookup: Record<string, GridColDef<R>>,
  apiRef: ApiRef,
): GridNode<R>[] {
  const fields = model.filter((f) => lookup[f]);
  if (fields.length === 0) {
    return rows.map((row) => leaf(row, getRowId(row), 0));
  }
  const roots: GridNode<R>[] = [];
  const index = new Map<string, GridNode<R>>();
  for (const row of rows) {
    let siblings = roots;
    let pathKey = '';
    for (let depth = 0; depth < fields.length; depth++) {
      const field = fields[depth];
      const rawValue = getGroupingValue(row, lookup[field], apiRef);
      const key = keyOf(rawValue);
      pathKey += `${depth === 0 ? '' : '/'}${field}:${typeof key === 'string' ? key : JSON.stringify(key)}`;
      let group = index.get(pathKey);
      if (!group) {
        group = {
          id: `${GROUP_ID_PREFIX}${pathKey}`,
          depth,
          row: null,
          children: [],
          groupingField: field,
          groupingKey: rawValue ?? null,
        };
        index.set(pathKey, group);
        siblings.push(group);
      }
      siblings = group.children!;
    }
    siblings.push(leaf(row, getRowId(row), fields.length));
  }
  return roots;
}

function leaf<R extends GridValidRowModel>(row: R, id: GridRowId, depth: number): GridNode<R> {
  return { id, depth, row, children: null, groupingField: null, groupingKey: undefined };
}

export function buildFlatHierarchy<R extends GridValidRowModel>(
  rows: readonly R[],
  getRowId: (row: R) => GridRowId,
): GridNode<R>[] {
  return rows.map((row) => leaf(row, getRowId(row), 0));
}
