import type { RefObject } from 'react';
import {
  getGridDefaultColumnTypes,
  type GridApi,
  type GridColDef,
  type GridColType,
  type GridComparatorFn,
  type GridSortDirection,
  type GridValidRowModel,
} from '@mui/x-data-grid';

let defaultTypes: ReturnType<typeof getGridDefaultColumnTypes> | undefined;

/** Applies the Community column-type defaults (operators, comparators) without mutating input. */
export function resolveColumn<R extends GridValidRowModel>(col: GridColDef<R>): GridColDef<R> {
  defaultTypes ??= getGridDefaultColumnTypes();
  const type = (col.type ?? 'string') as GridColType;
  const types = defaultTypes as unknown as Record<string, GridColDef<R>>;
  const base = types[type] ?? types.string;
  return { ...base, ...col } as GridColDef<R>;
}

export type ApiRef = RefObject<GridApi | null>;

/** Reads a cell value the same way the grid does (valueGetter first). */
export function getCellValue<R extends GridValidRowModel>(
  row: R,
  col: GridColDef<R>,
  apiRef: ApiRef,
): unknown {
  const raw = (row as Record<string, unknown>)[col.field];
  return col.valueGetter
    ? (col.valueGetter as (v: unknown, r: R, c: GridColDef<R>, a: ApiRef) => unknown)(
        raw,
        row,
        col,
        apiRef,
      )
    : raw;
}

export function getFormattedValue<R extends GridValidRowModel>(
  row: R,
  col: GridColDef<R>,
  apiRef: ApiRef,
  value = getCellValue(row, col, apiRef),
): unknown {
  return col.valueFormatter
    ? (col.valueFormatter as (v: unknown, r: R, c: GridColDef<R>, a: ApiRef) => unknown)(
        value,
        row,
        col,
        apiRef,
      )
    : value;
}

export function getComparator(col: GridColDef, direction: GridSortDirection): GridComparatorFn {
  const resolved = col.getSortComparator?.(direction) ?? col.sortComparator;
  if (!resolved) throw new Error(`MUI X: no sort comparator for column ${col.field}`);
  return resolved;
}
