import * as React from 'react';
import type { GridColDef, GridFilterModel, GridRowId, GridSortModel } from '@mui/x-data-grid';
import type {
  GridAggregationFunction,
  GridGroupNodeInfo,
  GridPinnedColumnFields,
} from '../public-types.js';
import type { Store } from './store.js';
import type { RowMeta } from './pipeline.js';

/** Interaction state owned by the grid (mutated by user gestures; read via selectors). */
export interface UiState {
  expansion: ReadonlyMap<GridRowId, boolean>;
  detailExpanded: ReadonlySet<GridRowId>;
  defaultExpansionDepth: number;
  isGroupExpandedByDefault?: (info: GridGroupNodeInfo) => boolean;
}

/** Derived state published by the DataGrid after each render for slot components. */
export interface DerivedState {
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
  filterCounts: Record<string, number>;
  meta: ReadonlyMap<GridRowId, RowMeta>;
  page: number;
  pageSize: number;
  pageSizeOptions: ReadonlyArray<number | { value: number; label: string }>;
  rowCount: number;
  pinnedTop: readonly object[];
  pinnedBottom: readonly object[];
  pinnedColumns: GridPinnedColumnFields;
  aggregationModel: Record<string, string>;
  aggregationLabels: Record<string, string>;
  rowGroupingModel: readonly string[];
  sortingDisabledForReorder: boolean;
  headerFilters: boolean;
  columnLookup: Record<string, GridColDef>;
}

export interface GridActions {
  toggleExpansion: (id: GridRowId) => void;
  toggleDetailPanel: (id: GridRowId) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortModel: (model: GridSortModel) => void;
  setFilterModel: (model: GridFilterModel) => void;
  upsertHeaderFilter: (field: string, operator: string, value: unknown) => void;
  pinColumn: (field: string, side: 'left' | 'right' | null) => void;
  moveColumn: (field: string, delta: number) => void;
  toggleRowGrouping: (field: string) => void;
  setAggregation: (field: string, fn: string | null) => void;
  moveRow: (id: GridRowId, delta: number) => void;
  getDetailPanelContent: (id: GridRowId, row: object) => React.ReactNode;
}

export interface GridAdvancedContextValue {
  ui: Store<UiState>;
  derived: Store<DerivedState>;
  actions: GridActions;
  features: {
    columnPinning: boolean;
    columnReorder: boolean;
    rowGrouping: boolean;
    aggregation: boolean;
    multiSort: boolean;
    multiFilter: boolean;
    aggregationFunctions: Record<string, GridAggregationFunction>;
  };
}

export const GridAdvancedContext = React.createContext<GridAdvancedContextValue | null>(null);

export function useGridAdvanced(): GridAdvancedContextValue {
  const ctx = React.useContext(GridAdvancedContext);
  if (!ctx) throw new Error('Tecton DataGrid: advanced slot rendered outside the DataGrid.');
  return ctx;
}
