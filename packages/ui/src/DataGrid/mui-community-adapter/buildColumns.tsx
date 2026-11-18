import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GRID_CHECKBOX_SELECTION_FIELD,
  type GridColDef,
  type GridColumnHeaderParams,
  type GridRenderCellParams,
  type GridRowId,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import { getRowAggregates, getSynthetic } from '../core/rows.js';
import type { RowMeta } from '../core/pipeline.js';
import {
  applyPinnedOrder,
  pinnedColumnClasses,
} from '../features/pinning-reordering/columnPinning.js';
import {
  ROW_GROUPING_SINGLE_FIELD,
  rowGroupingMultipleField,
} from '../features/grouping-aggregation/rowGrouping.js';
import type {
  GridAggregationFunction,
  GridAggregationModel,
  DataGridAdvancedProps,
} from '../public-types.js';
import {
  AggregatedHeader,
  DetailPanelContent,
  DetailPanelToggleCell,
  GroupingCell,
  HeaderWithFilter,
  RowReorderHandle,
} from './cells.js';

export const TREE_DATA_GROUPING_FIELD = '__tree_data_group__';
export const DETAIL_PANEL_TOGGLE_FIELD = '__detail_panel_toggle__';
export const ROW_REORDER_FIELD = '__reorder__';

export interface BuildColumnsArgs<R extends GridValidRowModel> {
  columns: readonly GridColDef<R>[];
  /** User field order (column reordering state). */
  order: readonly string[];
  pinned: { left: string[]; right: string[] };
  groupingMode: 'none' | 'tree' | 'group';
  rowGroupingModel: readonly string[];
  rowGroupingColumnMode: 'single' | 'multiple';
  groupingColDef?: DataGridAdvancedProps<R>['groupingColDef'];
  detailPanel: boolean;
  rowReordering: boolean;
  checkboxSelection: boolean;
  headerFilters: boolean;
  aggregationModel: GridAggregationModel;
  aggregationFunctions: Record<string, GridAggregationFunction>;
  /** Group/detail/skeleton rows may be present: wrap getters/renderers defensively. */
  hasSynthetic: boolean;
  metaRef: React.RefObject<ReadonlyMap<GridRowId, RowMeta>>;
  /** Columns with type defaults applied (type renderers such as boolean/actions cells). */
  lookup: Record<string, GridColDef<R>>;
  getServerAggregate?: (row: R, field: string) => unknown;
}

const SYSTEM_COL: Partial<GridColDef> = {
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  disableReorder: true,
  resizable: false,
  hideable: false,
  disableExport: true,
  headerName: '',
  align: 'center',
  headerAlign: 'center',
};

function joinClass(
  original: GridColDef['cellClassName'],
  extra: string,
): GridColDef['cellClassName'] {
  if (!original) return extra;
  if (typeof original === 'string') return `${original} ${extra}`;
  return (params) => `${original(params)} ${extra}`;
}

function joinHeaderClass(
  original: GridColDef['headerClassName'],
  extra: string,
): GridColDef['headerClassName'] {
  if (!original) return extra;
  if (typeof original === 'string') return `${original} ${extra}`;
  return (params) => `${original(params)} ${extra}`;
}

const titleOf = <R extends GridValidRowModel>(
  col: GridColDef<R>,
  params: GridColumnHeaderParams<R>,
): React.ReactNode => (col.renderHeader ? col.renderHeader(params) : (col.headerName ?? col.field));

function formatKey(key: unknown): string {
  if (key === null || key === undefined || key === '') return '(empty)';
  if (key instanceof Date) return key.toLocaleDateString();
  return String(key);
}

/** Builds the column definitions handed to the Community grid. */
export function buildCommunityColumns<R extends GridValidRowModel>(
  args: BuildColumnsArgs<R>,
): GridColDef<R>[] {
  const byField = new Map(args.columns.map((c) => [c.field, c]));
  const out = new Map<string, GridColDef<R>>();

  // System columns.
  if (args.detailPanel) {
    out.set(DETAIL_PANEL_TOGGLE_FIELD, {
      ...SYSTEM_COL,
      field: DETAIL_PANEL_TOGGLE_FIELD,
      width: 48,
      renderCell: (params) => {
        const syn = getSynthetic(params.row);
        if (syn) return null;
        return <DetailPanelToggleCell id={params.id} />;
      },
    } as GridColDef<R>);
  }
  if (args.checkboxSelection && !byField.has(GRID_CHECKBOX_SELECTION_FIELD)) {
    out.set(GRID_CHECKBOX_SELECTION_FIELD, GRID_CHECKBOX_SELECTION_COL_DEF as GridColDef<R>);
  }
  if (args.rowReordering) {
    out.set(ROW_REORDER_FIELD, {
      ...SYSTEM_COL,
      field: ROW_REORDER_FIELD,
      width: 48,
      renderCell: (params) =>
        getSynthetic(params.row) ? null : <RowReorderHandle id={params.id} />,
    } as GridColDef<R>);
  }

  // Grouping column(s).
  const userGroupingColDef = (groupingField: string | null) =>
    typeof args.groupingColDef === 'function'
      ? args.groupingColDef({ groupingField })
      : (args.groupingColDef ?? {});
  if (args.groupingMode === 'tree') {
    out.set(TREE_DATA_GROUPING_FIELD, {
      field: TREE_DATA_GROUPING_FIELD,
      headerName: 'Group',
      width: 220,
      filterable: false,
      disableReorder: true,
      hideable: false,
      valueGetter: (_v, row, _c, apiRef) => {
        const syn = getSynthetic(row);
        if (syn) return formatKey(syn.groupingKey);
        const id = apiRef.current?.getRowId(row);
        return id === undefined ? undefined : args.metaRef.current.get(id)?.label;
      },
      renderCell: (params: GridRenderCellParams<R>) => (
        <GroupingCell id={params.id} label={params.value as React.ReactNode} />
      ),
      ...userGroupingColDef(null),
    } as GridColDef<R>);
  } else if (args.groupingMode === 'group' && args.rowGroupingModel.length) {
    const groupingFields =
      args.rowGroupingColumnMode === 'multiple'
        ? args.rowGroupingModel.map((f) => [rowGroupingMultipleField(f), f] as const)
        : [[ROW_GROUPING_SINGLE_FIELD, null] as const];
    for (const [field, onlyFor] of groupingFields) {
      const user = userGroupingColDef(onlyFor);
      const leafField = (user as { leafField?: string }).leafField;
      const source = onlyFor ? byField.get(onlyFor) : undefined;
      out.set(field, {
        field,
        headerName: onlyFor ? (source?.headerName ?? onlyFor) : 'Group',
        width: 200,
        filterable: false,
        disableReorder: true,
        hideable: false,
        valueGetter: (_v, row) => {
          const syn = getSynthetic(row);
          if (syn?.kind === 'group')
            return onlyFor && syn.groupingField !== onlyFor
              ? undefined
              : formatKey(syn.groupingKey);
          return leafField ? (row as Record<string, unknown>)[leafField] : undefined;
        },
        renderCell: (params: GridRenderCellParams<R>) => {
          const syn = getSynthetic(params.row);
          if (syn && syn.kind !== 'group') return null;
          if (!syn && onlyFor && !args.metaRef.current.get(params.id)?.isGroup) return null;
          return (
            <GroupingCell
              id={params.id}
              label={params.value as React.ReactNode}
              showOnlyForField={onlyFor ?? undefined}
            />
          );
        },
        ...user,
      } as GridColDef<R>);
    }
  }

  // User columns, wrapped only as far as active features require.
  for (const field of args.order) {
    const col = byField.get(field);
    if (!col || out.has(field)) continue;
    const wrapped: GridColDef<R> = { ...col };
    const aggName = args.aggregationModel[field];
    const aggFn = aggName ? args.aggregationFunctions[aggName] : undefined;

    if (args.hasSynthetic) {
      const getter = col.valueGetter;
      wrapped.valueGetter = ((value: unknown, row: R, column: GridColDef<R>, apiRef: never) => {
        const syn = getSynthetic(row);
        if (syn) return syn.kind === 'group' ? syn.aggregates?.[field] : undefined;
        const rowAggregates = aggName ? getRowAggregates(row) : undefined;
        if (rowAggregates && field in rowAggregates) return rowAggregates[field];
        if (args.getServerAggregate && aggName) {
          const agg = args.getServerAggregate(row, field);
          if (agg !== undefined) return agg;
        }
        return getter
          ? (getter as (...a: unknown[]) => unknown)(value, row, column, apiRef)
          : value;
      }) as unknown as GridColDef<R>['valueGetter'];
      const formatter = col.valueFormatter;
      if (aggFn) {
        wrapped.valueFormatter = ((
          value: unknown,
          row: R,
          column: GridColDef<R>,
          apiRef: never,
        ) => {
          if (getSynthetic(row)) {
            if (value === undefined || value === null) return '';
            if (aggFn.valueFormatter) return aggFn.valueFormatter(value);
            if (aggName === 'size') return String(value);
          }
          return formatter
            ? (formatter as (...a: unknown[]) => unknown)(value, row, column, apiRef)
            : value;
        }) as unknown as GridColDef<R>['valueFormatter'];
      }
      const render = col.renderCell ?? args.lookup[field]?.renderCell;
      if (render) {
        wrapped.renderCell = (params) => {
          const syn = getSynthetic(params.row);
          if (syn?.kind === 'skeleton') return <Skeleton variant="text" width="70%" />;
          if (syn)
            return params.value == null || params.formattedValue == null
              ? null
              : String(params.formattedValue);
          return render(params);
        };
      } else {
        wrapped.renderCell = (params) => {
          const syn = getSynthetic(params.row);
          if (syn?.kind === 'skeleton') return <Skeleton variant="text" width="70%" />;
          if (syn && params.value == null) return null;
          const v = params.formattedValue == null ? params.value : params.formattedValue;
          return v == null ? null : String(v);
        };
      }
    }
    if (aggFn || args.headerFilters) {
      wrapped.renderHeader = (params) => {
        const title = aggFn ? (
          <AggregatedHeader title={titleOf(col, params)} fn={aggFn.label ?? aggName} />
        ) : (
          titleOf(col, params)
        );
        return args.headerFilters ? (
          <HeaderWithFilter colDef={params.colDef} title={title} />
        ) : (
          title
        );
      };
    }
    out.set(field, wrapped);
  }

  // Final order: system/grouping first, then user order, then pinned sections.
  const ordered = applyPinnedOrder([...out.keys()], args.pinned);
  const classes = pinnedColumnClasses(args.pinned);
  const result = ordered.map((field) => {
    const col = out.get(field)!;
    const cls = classes.get(field);
    return cls
      ? {
          ...col,
          cellClassName: joinClass(col.cellClassName, cls.cell),
          headerClassName: joinHeaderClass(col.headerClassName, cls.header),
        }
      : col;
  });

  // Detail rows: the first column spans the full width and renders the panel.
  if (args.detailPanel && result.length) {
    const first = result[0];
    const originalSpan = first.colSpan;
    const originalRender = first.renderCell;
    result[0] = {
      ...first,
      colSpan: ((
        value: unknown,
        row: R,
        column: GridColDef<R>,
        apiRef: { current: { getVisibleColumns: () => unknown[] } },
      ) => {
        if (getSynthetic(row)?.kind === 'detail') return apiRef.current.getVisibleColumns().length;
        if (typeof originalSpan === 'function')
          return (originalSpan as (...a: unknown[]) => number)(value, row, column, apiRef);
        return originalSpan ?? 1;
      }) as GridColDef<R>['colSpan'],
      renderCell: (params) => {
        const syn = getSynthetic(params.row);
        if (syn?.kind === 'detail')
          return <DetailPanelContent masterId={syn.masterId!} row={syn.masterRow!} />;
        return originalRender
          ? originalRender(params)
          : (params.formattedValue ?? params.value ?? null);
      },
    };
  }
  return result;
}
