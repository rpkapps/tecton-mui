// Public types for the unified DataGrid. Names intentionally follow MUI X conventions so consumers
// can migrate, but every type here is independently declared over the MIT Community types.
import type * as React from 'react';
import type {
  DataGridProps as CommunityDataGridProps,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowId,
  GridRowModel,
  GridSortModel,
  GridValidRowModel,
  GridCallbackDetails,
  GridRowIdGetter,
  GridInitialState,
} from '@mui/x-data-grid';

/** Fields pinned to the left/right edges. */
export interface GridPinnedColumnFields {
  left?: string[];
  right?: string[];
}

export interface GridPinnedRowsProp<R extends GridValidRowModel = GridValidRowModel> {
  top?: R[];
  bottom?: R[];
}

/** Maps a column field to an aggregation function name, e.g. `{ salary: 'sum' }`. */
export type GridAggregationModel = Record<string, string>;

export interface GridAggregationParams<V = unknown> {
  values: V[];
  field: string;
  groupId: GridRowId | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default mirrors MUI generics
export interface GridAggregationFunction<V = any, AV = V> {
  apply: (params: GridAggregationParams<V>) => AV;
  /** Label shown in the column header and column menu. */
  label?: string;
  /** Column types this function applies to. Defaults to all. */
  columnTypes?: string[];
  /** Formats the aggregated value. Defaults to the column valueFormatter (except for `size`). */
  valueFormatter?: (value: AV) => string;
}

export type GridAggregationPosition = 'inline' | 'footer';

export interface GridGroupNodeInfo {
  id: GridRowId;
  depth: number;
  /** Grouping field (row grouping) or `null` for tree data. */
  groupingField: string | null;
  groupingKey: unknown;
  childrenCount: number;
}

export type GridRowGroupingModel = string[];

/** `{ [rowId]: { [field]: true } }` */
export type GridCellSelectionModel = Record<GridRowId, Record<string, boolean>>;

export interface GridRowOrderChangeParams<R extends GridValidRowModel = GridValidRowModel> {
  row: R;
  oldIndex: number;
  targetIndex: number;
}

export interface GridColumnOrderChangeParams {
  field: string;
  oldIndex: number;
  targetIndex: number;
}

export interface GridClipboardPasteParams<R extends GridValidRowModel = GridValidRowModel> {
  /** Updated rows (new values), keyed by id. */
  updates: Array<{ id: GridRowId; newRow: R; oldRow: R }>;
}

/** Server-side data source (Community-compatible shape plus grouping/aggregation/lazy loading). */
export interface GridGetRowsParams {
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
  paginationModel?: GridPaginationModel;
  /** First and last (inclusive) row index requested (lazy loading / pagination). */
  start: number;
  end: number;
  /** Keys of the ancestors of the requested level (server-side grouping / tree data). */
  groupKeys: string[];
  /** Active row grouping fields (server-side grouping). */
  groupFields: string[];
  aggregationModel?: GridAggregationModel;
}

export interface GridGetRowsResponse<R extends GridValidRowModel = GridValidRowModel> {
  rows: R[];
  /** Total rows at this level; `-1`/undefined when unknown (infinite loading). */
  rowCount?: number;
  /** Server-computed aggregation of the whole (filtered) dataset, shown in the footer. */
  aggregateRow?: Partial<R>;
}

export interface GridUpdateRowParams<R extends GridValidRowModel = GridValidRowModel> {
  rowId: GridRowId;
  updatedRow: R;
  previousRow: R;
}

export interface GridDataSource<R extends GridValidRowModel = GridValidRowModel> {
  getRows: (params: GridGetRowsParams) => Promise<GridGetRowsResponse<R>>;
  updateRow?: (params: GridUpdateRowParams<R>) => Promise<R> | R;
  /** Server-side grouping / tree data: key identifying a group row. */
  getGroupKey?: (row: R) => string;
  /** Server-side grouping / tree data: number of children (0 = leaf). */
  getChildrenCount?: (row: R) => number;
  /** Server-side aggregation value for a (group) row. */
  getAggregatedValue?: (row: R, field: string) => unknown;
}

export interface GridDataSourceCache {
  get: (key: string) => GridGetRowsResponse | undefined;
  set: (key: string, value: GridGetRowsResponse) => void;
  clear: () => void;
}

/** Row update for batched updates; `_action: 'delete'` removes the row. */
export type GridRowUpdate<R extends GridValidRowModel = GridValidRowModel> = Partial<R> & {
  _action?: 'delete';
};

/** Imperative API for the advanced features (use with `useGridAdvancedApiRef`). */
export interface GridAdvancedApi<R extends GridValidRowModel = GridValidRowModel> {
  getSortModel: () => GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  getFilterModel: () => GridFilterModel;
  setFilterModel: (model: GridFilterModel) => void;
  getPinnedColumns: () => GridPinnedColumnFields;
  setPinnedColumns: (model: GridPinnedColumnFields) => void;
  pinColumn: (field: string, side: 'left' | 'right') => void;
  unpinColumn: (field: string) => void;
  getColumnOrder: () => string[];
  setColumnIndex: (field: string, targetIndex: number) => void;
  getRowGroupingModel: () => GridRowGroupingModel;
  setRowGroupingModel: (model: GridRowGroupingModel) => void;
  getAggregationModel: () => GridAggregationModel;
  setAggregationModel: (model: GridAggregationModel) => void;
  setRowChildrenExpansion: (id: GridRowId, expanded: boolean) => void;
  isRowExpanded: (id: GridRowId) => boolean;
  toggleDetailPanel: (id: GridRowId) => void;
  getDetailPanelExpandedRowIds: () => Set<GridRowId>;
  getCellSelectionModel: () => GridCellSelectionModel;
  setCellSelectionModel: (model: GridCellSelectionModel) => void;
  selectCellRange: (
    start: { id: GridRowId; field: string },
    end: { id: GridRowId; field: string },
  ) => void;
  /** Batched row updates (throttled by `throttleRowsMs`). */
  updateRows: (updates: GridRowUpdate<R>[]) => void;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  /** Re-fetch server data (data source), optionally clearing the cache. */
  refetchRows: (options?: { clearCache?: boolean }) => void;
  /** Rows after filtering/sorting/grouping, in display order (leaves and group rows). */
  getVisibleRows: () => Array<{ id: GridRowId; depth: number; isGroup: boolean }>;
}

export type GridInitialStateAdvanced = GridInitialState & {
  pinnedColumns?: GridPinnedColumnFields;
  rowGrouping?: { model?: GridRowGroupingModel };
  aggregation?: { model?: GridAggregationModel };
  detailPanel?: { expandedRowIds?: GridRowId[] };
};

type CallbackDetails = GridCallbackDetails;

/** Advanced (Pro/Premium-equivalent) props. All are opt-in. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default mirrors MUI generics
export interface DataGridAdvancedProps<R extends GridValidRowModel = any> {
  // Sorting & filtering
  /** @default false (multi-column sorting enabled, shift/ctrl-click) */
  disableMultipleColumnsSorting?: boolean;
  /** `withModifierKey` (default) or `always`. */
  multipleColumnsSortingMode?: 'withModifierKey' | 'always';
  /** @default false (multi-item filter model and filter panel) */
  disableMultipleColumnsFiltering?: boolean;
  /** Renders inline filter inputs in the column headers. */
  headerFilters?: boolean;
  // Pagination
  /** `false` disables pagination (all rows virtualized). @default true */
  pagination?: boolean;
  // Column pinning & reordering
  pinnedColumns?: GridPinnedColumnFields;
  onPinnedColumnsChange?: (model: GridPinnedColumnFields) => void;
  disableColumnPinning?: boolean;
  /** @default false (header drag reordering enabled) */
  disableColumnReorder?: boolean;
  onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void;
  // Row pinning & reordering
  pinnedRows?: GridPinnedRowsProp<R>;
  rowReordering?: boolean;
  onRowOrderChange?: (params: GridRowOrderChangeParams<R>) => void;
  // Tree data
  treeData?: boolean;
  getTreeDataPath?: (row: R) => readonly string[];
  // Row grouping
  rowGroupingModel?: GridRowGroupingModel;
  onRowGroupingModelChange?: (model: GridRowGroupingModel) => void;
  rowGroupingColumnMode?: 'single' | 'multiple';
  disableRowGrouping?: boolean;
  /** Column definition overrides for the generated grouping column(s). */
  groupingColDef?:
    Partial<GridColDef<R>> | ((params: { groupingField: string | null }) => Partial<GridColDef<R>>);
  /** Expansion depth for groups/tree nodes (-1 = all). @default 0 */
  defaultGroupingExpansionDepth?: number;
  isGroupExpandedByDefault?: (node: GridGroupNodeInfo) => boolean;
  // Aggregation
  aggregationModel?: GridAggregationModel;
  onAggregationModelChange?: (model: GridAggregationModel) => void;
  aggregationFunctions?: Record<string, GridAggregationFunction>;
  /** Where group aggregates render. Grand totals always render as a pinned footer row. */
  getAggregationPosition?: (groupNode: GridGroupNodeInfo | null) => GridAggregationPosition | null;
  disableAggregation?: boolean;
  // Master/detail
  getDetailPanelContent?: (params: { id: GridRowId; row: R }) => React.ReactNode;
  /** Height in px or `'auto'`. @default 'auto' */
  getDetailPanelHeight?: (params: { id: GridRowId; row: R }) => number | 'auto';
  detailPanelExpandedRowIds?: Set<GridRowId>;
  onDetailPanelExpandedRowIdsChange?: (ids: Set<GridRowId>) => void;
  // Cell selection & clipboard
  cellSelection?: boolean;
  cellSelectionModel?: GridCellSelectionModel;
  onCellSelectionModelChange?: (model: GridCellSelectionModel) => void;
  disableClipboardPaste?: boolean;
  splitClipboardPastedText?: (text: string) => string[][];
  onClipboardPasteStart?: () => void;
  onClipboardPasteEnd?: (params: GridClipboardPasteParams<R>) => void;
  // Server-side data
  dataSource?: GridDataSource<R>;
  /** `null` disables caching. Defaults to an in-memory cache (5 min TTL). */
  dataSourceCache?: GridDataSourceCache | null;
  /** Viewport-driven loading of server rows (requires `dataSource`, ignores pagination). */
  lazyLoading?: boolean;
  lazyLoadingRequestThrottleMs?: number;
  onDataSourceError?: (error: unknown) => void;
  /** Batched updates through `advancedApiRef.current.updateRows` are flushed at most this often. */
  throttleRowsMs?: number;
  // Row selection
  /**
   * With pagination, the header checkbox selects only the rows of the current page instead of
   * every filtered row. Selection always persists across pages. @default false
   */
  checkboxSelectionVisibleOnly?: boolean;
  // Undo/redo
  /** Number of undoable operations kept (cell edits, paste, row reorder). `0` disables. @default 0 */
  historyStackSize?: number;
  // Imperative API
  advancedApiRef?: React.RefObject<GridAdvancedApi<R> | null>;
  initialState?: GridInitialStateAdvanced;
  onSortModelChange?: (model: GridSortModel, details: CallbackDetails) => void;
  onFilterModelChange?: (model: GridFilterModel, details: CallbackDetails) => void;
  getRowId?: GridRowIdGetter<R>;
  rows?: readonly GridRowModel<R>[];
}

type OverriddenKeys =
  keyof DataGridAdvancedProps | 'dataSource' | 'dataSourceCache' | 'onDataSourceError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default mirrors MUI generics
export type DataGridProps<R extends GridValidRowModel = any> = Omit<
  CommunityDataGridProps<R>,
  OverriddenKeys
> &
  DataGridAdvancedProps<R>;
