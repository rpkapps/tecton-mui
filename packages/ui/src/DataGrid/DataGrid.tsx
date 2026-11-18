'use client';
import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import {
  DataGrid as CommunityDataGrid,
  GRID_CHECKBOX_SELECTION_FIELD,
  gridFocusCellSelector,
  useGridApiRef,
  type GridColDef,
  type GridColumnVisibilityModel,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowId,
  type GridSortModel,
  type GridValidRowModel,
  type GridColumnHeaderParams,
  type GridEventListener,
} from '@mui/x-data-grid';
import { Store, useStoreSelector } from './core/store.js';
import {
  GridAdvancedContext,
  type DerivedState,
  type GridActions,
  type GridAdvancedContextValue,
  type UiState,
} from './core/context.js';
import { useControlled, useLatest } from './core/useControlled.js';
import { getCellValue, getFormattedValue, resolveColumn } from './core/columns.js';
import {
  flattenTree,
  groupInfo,
  paginate,
  SyntheticRowCache,
  type RowMeta,
} from './core/pipeline.js';
import { isExpandedFromMeta } from './core/expansion.js';
import { getSynthetic, GROUP_ID_PREFIX, SYNTHETIC } from './core/rows.js';
import { collectRows, type GridNode } from './core/tree.js';
import {
  compileFilterModel,
  countFiltersByField,
  EMPTY_FILTER_MODEL,
  filterTree,
  mergeCommunityFilterModel,
} from './features/sorting-filtering/filtering.js';
import { nextSortModel, sortTree } from './features/sorting-filtering/sorting.js';
import { buildTreeDataHierarchy } from './features/tree-data/treeData.js';
import {
  buildFlatHierarchy,
  buildRowGroupingHierarchy,
  ROW_GROUPING_SINGLE_FIELD,
  rowGroupingMultipleField,
} from './features/grouping-aggregation/rowGrouping.js';
import {
  aggregateTree,
  EMPTY_AGGREGATION,
  GRID_AGGREGATION_FUNCTIONS,
} from './features/grouping-aggregation/aggregation.js';
import {
  EMPTY_PINNED,
  normalizePinned,
  pinnedColumnsSx,
  usePinnedColumnOffsets,
} from './features/pinning-reordering/columnPinning.js';
import { moveField, useColumnReorder } from './features/pinning-reordering/useColumnReorder.js';
import { moveId, useRowReorder } from './features/pinning-reordering/useRowReorder.js';
import { useCellSelection } from './features/selection-clipboard/useCellSelection.js';
import {
  HistoryStack,
  isRedoShortcut,
  isUndoShortcut,
  type HistoryOperation,
} from './features/undo-redo/history.js';
import { useDataSource } from './features/server-data/useDataSource.js';
import {
  buildCommunityColumns,
  TREE_DATA_GROUPING_FIELD,
} from './mui-community-adapter/buildColumns.js';
import {
  ColumnMenuSlot,
  FilterIconSlot,
  HierarchyRowSlot,
  MultiFilterPanel,
  PaginationSlot,
  PinnedRowsSlot,
  SortIconSlot,
} from './mui-community-adapter/slots.js';
import type {
  DataGridProps,
  GridAdvancedApi,
  GridCellSelectionModel,
  GridPinnedColumnFields,
  GridRowUpdate,
} from './public-types.js';

const EMPTY_ROWS: readonly never[] = [];
const EMPTY_SORT: GridSortModel = [];
const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_SORTING_ORDER = ['asc', 'desc', null] as const;
const COMMUNITY_PAGINATION: GridPaginationModel = { page: 0, pageSize: 100 };
const NoPagination = () => null;

interface RowPatches<R> {
  base: readonly R[] | undefined;
  updates: ReadonlyMap<GridRowId, R>;
  deleted: ReadonlySet<GridRowId>;
  inserted: readonly R[];
}

const defaultGetRowId = (row: GridValidRowModel): GridRowId => row.id as GridRowId;

/**
 * Unified DataGrid: the MIT Community grid plus independently implemented advanced features
 * (see ./features). With no advanced props it behaves like the Community DataGrid.
 */
function DataGridInner<R extends GridValidRowModel>(
  inProps: DataGridProps<R>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    rows: rowsProp,
    columns: columnsProp,
    getRowId: getRowIdProp,
    apiRef: apiRefProp,
    initialState,
    // sorting & filtering
    sortModel: sortModelProp,
    onSortModelChange,
    filterModel: filterModelProp,
    onFilterModelChange,
    disableMultipleColumnsSorting = false,
    multipleColumnsSortingMode = 'withModifierKey',
    disableMultipleColumnsFiltering = false,
    headerFilters = false,
    sortingOrder = DEFAULT_SORTING_ORDER as unknown as DataGridProps<R>['sortingOrder'],
    // pagination
    pagination = true,
    paginationModel: paginationModelProp,
    onPaginationModelChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    autoPageSize,
    // pinning & reordering
    pinnedColumns: pinnedColumnsProp,
    onPinnedColumnsChange,
    disableColumnPinning = false,
    disableColumnReorder = false,
    onColumnOrderChange,
    pinnedRows,
    rowReordering = false,
    onRowOrderChange,
    // hierarchy
    treeData = false,
    getTreeDataPath,
    rowGroupingModel: rowGroupingModelProp,
    onRowGroupingModelChange,
    rowGroupingColumnMode = 'single',
    disableRowGrouping = false,
    groupingColDef,
    defaultGroupingExpansionDepth = 0,
    isGroupExpandedByDefault,
    // aggregation
    aggregationModel: aggregationModelProp,
    onAggregationModelChange,
    aggregationFunctions = GRID_AGGREGATION_FUNCTIONS,
    getAggregationPosition,
    disableAggregation = false,
    // master/detail
    getDetailPanelContent,
    getDetailPanelHeight,
    detailPanelExpandedRowIds: detailPanelExpandedRowIdsProp,
    onDetailPanelExpandedRowIdsChange,
    // selection & clipboard
    cellSelection = false,
    cellSelectionModel: cellSelectionModelProp,
    onCellSelectionModelChange,
    disableClipboardPaste = false,
    splitClipboardPastedText,
    onClipboardPasteStart,
    onClipboardPasteEnd,
    checkboxSelection = false,
    disableMultipleRowSelection,
    // server data
    dataSource,
    dataSourceCache,
    lazyLoading = false,
    lazyLoadingRequestThrottleMs = 500,
    onDataSourceError,
    throttleRowsMs = 0,
    // history & api
    historyStackSize = 0,
    advancedApiRef,
    // Community props we wrap
    columnVisibilityModel: columnVisibilityModelProp,
    onColumnVisibilityModelChange,
    processRowUpdate,
    getRowHeight,
    isRowSelectable,
    isCellEditable,
    getRowClassName,
    onColumnHeaderClick,
    slots: slotsProp,
    slotProps: slotPropsProp,
    sx,
    className,
    loading,
    columnHeaderHeight,
    columnBufferPx,
    disableColumnSorting,
    ...other
  } = inProps;

  // ---------------------------------------------------------------- setup
  const ownApiRef = useGridApiRef();
  const apiRef = apiRefProp ?? ownApiRef;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(rootRef, ref);
  const styleRef = React.useRef<HTMLStyleElement>(null);
  const scope = `tdg-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const getRowId = React.useCallback(
    (row: R): GridRowId => getSynthetic(row)?.id ?? (getRowIdProp ?? defaultGetRowId)(row),
    [getRowIdProp],
  );
  const server = !!dataSource;

  // ---------------------------------------------------------------- models
  const [sortModel, setSortModel] = useControlled<GridSortModel>(
    sortModelProp,
    () => initialState?.sorting?.sortModel ?? EMPTY_SORT,
    (m) => onSortModelChange?.(m, {} as never),
  );
  const [filterModel, setFilterModel] = useControlled<GridFilterModel>(
    filterModelProp,
    () => initialState?.filter?.filterModel ?? EMPTY_FILTER_MODEL,
    (m) => onFilterModelChange?.(m, {} as never),
  );
  const [paginationModel, setPaginationModel] = useControlled<GridPaginationModel>(
    paginationModelProp,
    () => ({ page: 0, pageSize: 100, ...initialState?.pagination?.paginationModel }),
    (m) => onPaginationModelChange?.(m, {} as never),
  );
  const [pinnedColumns, setPinnedColumns] = useControlled<GridPinnedColumnFields>(
    pinnedColumnsProp,
    () => initialState?.pinnedColumns ?? EMPTY_PINNED,
    onPinnedColumnsChange,
  );
  const [rowGroupingModel, setRowGroupingModel] = useControlled<string[]>(
    rowGroupingModelProp,
    () => initialState?.rowGrouping?.model ?? [],
    onRowGroupingModelChange,
  );
  const [aggregationModel, setAggregationModel] = useControlled<Record<string, string>>(
    aggregationModelProp,
    () => initialState?.aggregation?.model ?? {},
    onAggregationModelChange,
  );
  const [cellSelectionModel, setCellSelectionModel] = useControlled<GridCellSelectionModel>(
    cellSelectionModelProp,
    {},
    onCellSelectionModelChange,
  );
  const [detailExpanded, setDetailExpanded] = useControlled<Set<GridRowId>>(
    detailPanelExpandedRowIdsProp,
    () => new Set(initialState?.detailPanel?.expandedRowIds ?? []),
    onDetailPanelExpandedRowIdsChange,
  );
  const hiddenMultiSelect = !checkboxSelection && disableMultipleRowSelection === false;
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useControlled<GridColumnVisibilityModel>(
      columnVisibilityModelProp,
      () => initialState?.columns?.columnVisibilityModel ?? {},
      (m) => onColumnVisibilityModelChange?.(m, {} as never),
    );

  const userFields = React.useMemo(() => columnsProp.map((c) => c.field), [columnsProp]);
  const [columnOrderState, setColumnOrderState] = React.useState<readonly string[]>(
    () => initialState?.columns?.orderedFields ?? userFields,
  );
  const columnOrder = React.useMemo(() => {
    const known = new Set(userFields);
    const kept = columnOrderState.filter((f) => known.has(f));
    const keptSet = new Set(kept);
    return [...kept, ...userFields.filter((f) => !keptSet.has(f))];
  }, [columnOrderState, userFields]);

  const [rowOrder, setRowOrder] = React.useState<readonly GridRowId[] | null>(null);

  // Local row patches (edits, paste, batched updates). Reset whenever the rows prop changes.
  const [patches, setPatches] = React.useState<RowPatches<R>>({
    base: rowsProp as R[] | undefined,
    updates: new Map(),
    deleted: new Set(),
    inserted: [],
  });
  if (patches.base !== rowsProp) {
    setPatches({
      base: rowsProp as R[] | undefined,
      updates: new Map(),
      deleted: new Set(),
      inserted: [],
    });
    if (rowOrder) setRowOrder(null);
  }

  // ---------------------------------------------------------------- stores
  const [ui] = React.useState(
    () =>
      new Store<UiState>({
        expansion: new Map(),
        detailExpanded,
        defaultExpansionDepth: defaultGroupingExpansionDepth,
        isGroupExpandedByDefault,
      }),
  );
  useEnhancedEffect(() => {
    ui.setState({
      detailExpanded,
      defaultExpansionDepth: defaultGroupingExpansionDepth,
      isGroupExpandedByDefault,
    });
  }, [ui, detailExpanded, defaultGroupingExpansionDepth, isGroupExpandedByDefault]);
  const expansion = useStoreSelector(ui, selectExpansion);
  const [derived] = React.useState(() => new Store<DerivedState>(INITIAL_DERIVED));

  // ---------------------------------------------------------------- features on/off
  const groupingMode: 'none' | 'tree' | 'group' = treeData
    ? 'tree'
    : !disableRowGrouping && rowGroupingModel.length > 0
      ? 'group'
      : 'none';
  const detailPanel = !!getDetailPanelContent;
  const aggregationActive = !disableAggregation && Object.keys(aggregationModel).length > 0;
  const lookup = React.useMemo(() => {
    const map: Record<string, GridColDef<R>> = {};
    for (const col of columnsProp) map[col.field] = resolveColumn(col);
    return map;
  }, [columnsProp]);

  // ---------------------------------------------------------------- server data
  const ds = useDataSource<R>({
    dataSource,
    cache: dataSourceCache,
    apiRef,
    sortModel,
    filterModel,
    paginationModel,
    pagination: pagination && !lazyLoading,
    groupFields: groupingMode === 'group' ? rowGroupingModel : (EMPTY_ROWS as unknown as string[]),
    aggregationModel: aggregationActive ? aggregationModel : undefined,
    lazyLoading,
    throttleMs: lazyLoadingRequestThrottleMs,
    onError: onDataSourceError,
  });
  const skeletonCache = React.useRef(new Map<number, R>());

  // ---------------------------------------------------------------- pipeline
  const baseRows = React.useMemo((): readonly R[] => {
    let rows: readonly R[];
    if (server && ds.lazy) {
      const count = ds.lazyRowCount < 0 ? ds.lazy.size + 1 : ds.lazyRowCount;
      const dense: R[] = new Array(count);
      for (let i = 0; i < count; i++) {
        let row = ds.lazy.get(i);
        if (!row) {
          row = skeletonCache.current.get(i);
          if (!row) {
            row = {
              [SYNTHETIC]: {
                kind: 'skeleton',
                id: `${GROUP_ID_PREFIX}skeleton-${i}`,
                depth: 0,
                index: i,
              },
            } as unknown as R;
            skeletonCache.current.set(i, row);
          }
        }
        dense[i] = row;
      }
      rows = dense;
    } else if (server) {
      rows = ds.top.rows;
    } else {
      rows = (rowsProp ?? EMPTY_ROWS) as readonly R[];
    }
    if (patches.updates.size || patches.deleted.size || patches.inserted.length) {
      const out: R[] = [];
      for (const row of rows) {
        const id = getRowId(row);
        if (patches.deleted.has(id)) continue;
        out.push(patches.updates.get(id) ?? row);
      }
      for (const row of patches.inserted)
        if (!patches.deleted.has(getRowId(row)))
          out.push(patches.updates.get(getRowId(row)) ?? row);
      rows = out;
    }
    if (rowOrder) {
      const byId = new Map(rows.map((r) => [getRowId(r), r]));
      const ordered: R[] = [];
      for (const id of rowOrder) {
        const row = byId.get(id);
        if (row) {
          ordered.push(row);
          byId.delete(id);
        }
      }
      rows = [...ordered, ...byId.values()];
    }
    return rows;
  }, [server, ds.lazy, ds.lazyRowCount, ds.top.rows, rowsProp, patches, rowOrder, getRowId]);

  const serverChildren = ds.children;
  const hierarchy = React.useMemo((): GridNode<R>[] => {
    if (server && dataSource && (groupingMode !== 'none' || dataSource.getChildrenCount)) {
      return buildServerHierarchy(
        baseRows,
        serverChildren,
        getRowId,
        dataSource,
        groupingMode === 'group' ? rowGroupingModel.length : Infinity,
      );
    }
    if (groupingMode === 'tree' && getTreeDataPath)
      return buildTreeDataHierarchy(baseRows, getRowId, getTreeDataPath);
    if (groupingMode === 'group')
      return buildRowGroupingHierarchy(baseRows, getRowId, rowGroupingModel, lookup, apiRef);
    return buildFlatHierarchy(baseRows, getRowId);
  }, [
    server,
    dataSource,
    groupingMode,
    baseRows,
    serverChildren,
    getRowId,
    getTreeDataPath,
    rowGroupingModel,
    lookup,
    apiRef,
  ]);

  const predicate = React.useMemo(
    () => (server ? null : compileFilterModel(filterModel, lookup, apiRef, columnVisibilityModel)),
    [server, filterModel, lookup, apiRef, columnVisibilityModel],
  );
  const filtered = React.useMemo(() => filterTree(hierarchy, predicate), [hierarchy, predicate]);
  const aggregation = React.useMemo(
    () =>
      server || !aggregationActive
        ? EMPTY_AGGREGATION
        : aggregateTree(filtered, aggregationModel, lookup, aggregationFunctions, apiRef),
    [server, aggregationActive, filtered, aggregationModel, lookup, aggregationFunctions, apiRef],
  );
  const groupingFields = React.useMemo(
    () =>
      new Set([
        TREE_DATA_GROUPING_FIELD,
        ROW_GROUPING_SINGLE_FIELD,
        ...rowGroupingModel.map(rowGroupingMultipleField),
      ]),
    [rowGroupingModel],
  );
  const sorted = React.useMemo(
    () =>
      server
        ? filtered
        : sortTree(filtered, sortModel, { lookup, apiRef, aggregation, groupingFields }),
    [server, filtered, sortModel, lookup, apiRef, aggregation, groupingFields],
  );
  const [syntheticCache] = React.useState(() => new SyntheticRowCache());
  const inlineAggregation = React.useCallback(
    (node: GridNode<R>) =>
      getAggregationPosition ? getAggregationPosition(groupInfo(node)) === 'inline' : true,
    [getAggregationPosition],
  );
  const flat = React.useMemo(
    () =>
      flattenTree(
        sorted,
        {
          overrides: expansion,
          defaultDepth: defaultGroupingExpansionDepth,
          isGroupExpandedByDefault,
        },
        aggregation,
        detailPanel ? detailExpanded : null,
        syntheticCache,
        inlineAggregation,
      ),
    [
      sorted,
      expansion,
      defaultGroupingExpansionDepth,
      isGroupExpandedByDefault,
      aggregation,
      detailPanel,
      detailExpanded,
      syntheticCache,
      inlineAggregation,
    ],
  );
  const metaRef = useLatest<ReadonlyMap<GridRowId, RowMeta>>(flat.meta);

  // Pagination over the processed rows (client) or server-provided page.
  const clientPaging = pagination && !server && !lazyLoading;
  const [autoPageSizeValue, setAutoPageSizeValue] = React.useState<number | null>(null);
  const pageSize = autoPageSize && autoPageSizeValue ? autoPageSizeValue : paginationModel.pageSize;
  const totalRows = server && !lazyLoading ? ds.top.rowCount : flat.rows.length - flat.detailCount;
  const lastPage = Math.max(0, Math.ceil(totalRows / Math.max(pageSize, 1)) - 1);
  const page = Math.min(paginationModel.page, lastPage);
  const pageRows = React.useMemo(
    () => paginate(flat.rows, page, pageSize, clientPaging, isDetailRow),
    [flat.rows, page, pageSize, clientPaging],
  );

  // ---------------------------------------------------------------- history & row updates
  const historyRef = React.useRef<HistoryStack<R> | null>(null);
  historyRef.current ??= new HistoryStack<R>(historyStackSize);
  historyRef.current.size = historyStackSize;
  const applyRows = useEventCallback((changes: Array<{ id: GridRowId; row: R }>) => {
    setPatches((prev) => {
      const updates = new Map(prev.updates);
      for (const c of changes) updates.set(c.id, c.row);
      return { ...prev, updates };
    });
  });
  const latestRow = (id: GridRowId): R | undefined =>
    baseRowsRef.current.find((r) => getRowId(r) === id);
  const baseRowsRef = useLatest(baseRows);

  const persistRow = useEventCallback(async (id: GridRowId, newRow: R, oldRow: R): Promise<R> => {
    let result = newRow;
    if (processRowUpdate)
      result = (await processRowUpdate(newRow, oldRow, { rowId: id } as never)) as R;
    if (dataSource?.updateRow)
      result = await dataSource.updateRow({ rowId: id, updatedRow: result, previousRow: oldRow });
    return result;
  });

  const handleProcessRowUpdate = useEventCallback(
    async (newRow: R, oldRow: R, params: { rowId: GridRowId }) => {
      const id = params?.rowId ?? getRowId(newRow);
      const result = await persistRow(id, newRow, oldRow);
      applyRows([{ id, row: result }]);
      historyRef.current!.record({
        type: 'rows',
        changes: [{ id, before: oldRow, after: result }],
      });
      return result;
    },
  );

  const applyHistory = useEventCallback(
    async (op: HistoryOperation<R>, direction: 'undo' | 'redo') => {
      if (op.type === 'rows') {
        const changes = await Promise.all(
          op.changes.map(async (c) => {
            const target = direction === 'undo' ? c.before : c.after;
            const current = latestRow(c.id) ?? (direction === 'undo' ? c.after : c.before);
            return { id: c.id, row: await persistRow(c.id, target, current) };
          }),
        );
        applyRows(changes);
      } else {
        setRowOrder(direction === 'undo' ? op.before : op.after);
      }
    },
  );
  const undo = useEventCallback(async () => {
    const op = historyRef.current!.popUndo();
    if (!op) return false;
    await applyHistory(op, 'undo');
    return true;
  });
  const redo = useEventCallback(async () => {
    const op = historyRef.current!.popRedo();
    if (!op) return false;
    await applyHistory(op, 'redo');
    return true;
  });

  // Batched updates (advanced API): queued and flushed at most every `throttleRowsMs`.
  const pendingUpdates = React.useRef<GridRowUpdate<R>[]>([]);
  const flushTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flushUpdates = useEventCallback(() => {
    flushTimer.current = undefined;
    const queue = pendingUpdates.current;
    pendingUpdates.current = [];
    if (!queue.length) return;
    setPatches((prev) => {
      const updates = new Map(prev.updates);
      const deleted = new Set(prev.deleted);
      const inserted = [...prev.inserted];
      const known = new Set(baseRowsRef.current.map(getRowId));
      for (const u of queue) {
        const id = getRowId(u as R);
        if (u._action === 'delete') {
          deleted.add(id);
          continue;
        }
        deleted.delete(id);
        const current =
          updates.get(id) ??
          baseRowsRef.current.find((r) => getRowId(r) === id) ??
          inserted.find((r) => getRowId(r) === id);
        const { _action: _ignored, ...data } = u;
        const next = { ...(current ?? {}), ...data } as unknown as R;
        if (!current && !known.has(id)) inserted.push(next);
        updates.set(id, next);
      }
      return { ...prev, updates, deleted, inserted };
    });
  });
  const updateRows = useEventCallback((updates: GridRowUpdate<R>[]) => {
    pendingUpdates.current.push(...updates);
    if (throttleRowsMs <= 0) flushUpdates();
    else flushTimer.current ??= setTimeout(flushUpdates, throttleRowsMs);
  });
  React.useEffect(() => () => clearTimeout(flushTimer.current), []);

  // ---------------------------------------------------------------- actions
  const pinnedNormalized = React.useMemo(
    () => normalizePinned(pinnedColumns, [...columnOrder, ...SYSTEM_FIELDS]),
    [pinnedColumns, columnOrder],
  );
  const rowReorderDisabled = sortModel.length > 0 || groupingMode !== 'none' || server;
  const actions = React.useMemo<GridActions>(
    () => ({
      toggleExpansion: (id) => {
        ui.setState((s) => {
          const current = isExpandedFromMeta(id, metaRef.current.get(id), s);
          return { expansion: new Map(s.expansion).set(id, !current) };
        });
      },
      toggleDetailPanel: (id) =>
        setDetailExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      setPage: (p) => setPaginationModel((m) => ({ ...m, page: p })),
      setPageSize: (size) => setPaginationModel(() => ({ page: 0, pageSize: size })),
      setSortModel: (m) => setSortModel(m),
      setFilterModel: (m) => setFilterModel(m),
      upsertHeaderFilter: (field, operator, value) =>
        setFilterModel((m) => {
          const id = `header-filter-${field}`;
          const items = m.items.filter((i) => i.id !== id);
          if (value !== undefined) items.push({ id, field, operator, value });
          return { ...m, items };
        }),
      pinColumn: (field, side) =>
        setPinnedColumns((p) => {
          const left = (p.left ?? []).filter((f) => f !== field);
          const right = (p.right ?? []).filter((f) => f !== field);
          if (side === 'left') left.push(field);
          if (side === 'right') right.unshift(field);
          return { left, right };
        }),
      moveColumn: (field, delta) => {
        const order = columnOrderRef.current;
        const index = order.indexOf(field);
        const target = order[index + delta];
        if (index < 0 || target === undefined) return;
        reorderColumns(field, target, delta > 0);
      },
      toggleRowGrouping: (field) =>
        setRowGroupingModel((m) =>
          m.includes(field) ? m.filter((f) => f !== field) : [...m, field],
        ),
      setAggregation: (field, fn) =>
        setAggregationModel((m) => {
          const next = { ...m };
          if (fn) next[field] = fn;
          else delete next[field];
          return next;
        }),
      moveRow: (id, delta) => moveRowBy(id, delta),
      getDetailPanelContent: (id, row) =>
        getDetailPanelContentRef.current?.({ id, row: row as R }) ?? null,
    }),
    // Setters are stable; refs carry the latest values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ui],
  );
  const getDetailPanelContentRef = useLatest(getDetailPanelContent);
  const columnOrderRef = useLatest(columnOrder);

  const reorderColumns = useEventCallback((field: string, targetField: string, after: boolean) => {
    const before = columnOrderRef.current;
    const next = moveField(before, field, targetField, after);
    setColumnOrderState(next);
    onColumnOrderChange?.({
      field,
      oldIndex: before.indexOf(field),
      targetIndex: next.indexOf(field),
    });
  });

  const moveRowTo = useEventCallback((id: GridRowId, targetId: GridRowId, after: boolean) => {
    if (rowReorderDisabled) return;
    const before = baseRowsRef.current.map(getRowId);
    const next = moveId(before, id, targetId, after);
    const row = baseRowsRef.current[before.indexOf(id)];
    setRowOrder(next);
    historyRef.current!.record({ type: 'rowOrder', before, after: next });
    onRowOrderChange?.({ row, oldIndex: before.indexOf(id), targetIndex: next.indexOf(id) });
  });
  const moveRowBy = useEventCallback((id: GridRowId, delta: number) => {
    const ids = baseRowsRef.current.map(getRowId);
    const index = ids.indexOf(id);
    const target = ids[index + delta];
    if (index < 0 || target === undefined) return;
    moveRowTo(id, target, delta > 0);
  });

  // ---------------------------------------------------------------- columns
  const hasSynthetic =
    groupingMode !== 'none' ||
    detailPanel ||
    lazyLoading ||
    (server && !!dataSource?.getChildrenCount);
  const serverAggregate = React.useMemo(
    () =>
      dataSource?.getAggregatedValue
        ? (row: R, field: string) => dataSource.getAggregatedValue!(row, field)
        : undefined,
    [dataSource],
  );
  const communityColumns = React.useMemo(
    () =>
      buildCommunityColumns<R>({
        columns: columnsProp.map((c) => lookup[c.field] && c),
        order: columnOrder,
        pinned: disableColumnPinning ? { left: [], right: [] } : pinnedNormalized,
        groupingMode,
        rowGroupingModel,
        rowGroupingColumnMode,
        groupingColDef,
        detailPanel,
        rowReordering,
        checkboxSelection: checkboxSelection || hiddenMultiSelect,
        headerFilters,
        aggregationModel: aggregationActive ? aggregationModel : {},
        aggregationFunctions,
        hasSynthetic,
        metaRef,
        lookup,
        getServerAggregate: serverAggregate,
      }),
    [
      columnsProp,
      lookup,
      columnOrder,
      disableColumnPinning,
      pinnedNormalized,
      groupingMode,
      rowGroupingModel,
      rowGroupingColumnMode,
      groupingColDef,
      detailPanel,
      rowReordering,
      checkboxSelection,
      hiddenMultiSelect,
      headerFilters,
      aggregationActive,
      aggregationModel,
      aggregationFunctions,
      hasSynthetic,
      metaRef,
      serverAggregate,
    ],
  );

  // ---------------------------------------------------------------- derived store publish
  const pinnedTop = pinnedRows?.top ?? (EMPTY_ROWS as unknown as R[]);
  const footerAggregate = React.useMemo(() => {
    const showFooter = getAggregationPosition ? getAggregationPosition(null) === 'footer' : true;
    const source = server ? ds.aggregateRow : aggregationActive ? aggregation.total : null;
    if (!showFooter || !source || !Object.keys(source).length) return null;
    const row: Record<string, unknown> = { __tectonAggregate: true };
    for (const [field, value] of Object.entries(source)) {
      const fnName = aggregationModel[field];
      const fn = fnName ? aggregationFunctions[fnName] : undefined;
      const col = lookup[field];
      if (value === null || value === undefined) row[field] = '';
      else if (fn?.valueFormatter) row[field] = fn.valueFormatter(value);
      else if (fnName === 'size' || !col) row[field] = String(value);
      else row[field] = getFormattedValue({} as R, col, apiRef, value) as string;
    }
    return row;
  }, [
    getAggregationPosition,
    server,
    ds.aggregateRow,
    aggregationActive,
    aggregation,
    aggregationModel,
    aggregationFunctions,
    lookup,
    apiRef,
  ]);
  const pinnedBottom = React.useMemo(
    () => [...(pinnedRows?.bottom ?? []), ...(footerAggregate ? [footerAggregate] : [])],
    [pinnedRows?.bottom, footerAggregate],
  );
  const aggregationLabels = React.useMemo(() => {
    const labels: Record<string, string> = {};
    for (const [field, fn] of Object.entries(aggregationActive ? aggregationModel : {}))
      labels[field] = aggregationFunctions[fn]?.label ?? fn;
    return labels;
  }, [aggregationActive, aggregationModel, aggregationFunctions]);
  const filterCounts = React.useMemo(() => countFiltersByField(filterModel), [filterModel]);

  useEnhancedEffect(() => {
    derived.setState({
      sortModel,
      filterModel,
      filterCounts,
      meta: flat.meta,
      page,
      pageSize,
      pageSizeOptions,
      rowCount: totalRows,
      pinnedTop,
      pinnedBottom,
      pinnedColumns: pinnedNormalized,
      aggregationModel,
      aggregationLabels,
      rowGroupingModel,
      sortingDisabledForReorder: rowReorderDisabled,
      columnLookup: lookup as Record<string, GridColDef>,
    });
  });

  const features = React.useMemo(
    () => ({
      columnPinning: !disableColumnPinning,
      columnReorder: !disableColumnReorder,
      rowGrouping: !disableRowGrouping && !treeData,
      aggregation: !disableAggregation,
      multiSort: !disableMultipleColumnsSorting,
      multiFilter: !disableMultipleColumnsFiltering,
      aggregationFunctions,
    }),
    [
      disableColumnPinning,
      disableColumnReorder,
      disableRowGrouping,
      treeData,
      disableAggregation,
      disableMultipleColumnsSorting,
      disableMultipleColumnsFiltering,
      aggregationFunctions,
    ],
  );
  const contextValue = React.useMemo<GridAdvancedContextValue>(
    () => ({ ui, derived, actions, features }),
    [ui, derived, actions, features],
  );

  // ---------------------------------------------------------------- DOM-level features
  usePinnedColumnOffsets(apiRef, rootRef, disableColumnPinning ? NO_PINNED : pinnedNormalized);
  const suppressHeaderClick = useColumnReorder({
    enabled: !disableColumnReorder,
    rootRef,
    canMove: (field) =>
      !field.startsWith('__') && !lookup[field]?.disableReorder && !!lookup[field],
    sectionOf: (field) =>
      pinnedNormalized.left.includes(field)
        ? 'left'
        : pinnedNormalized.right.includes(field)
          ? 'right'
          : 'center',
    onMove: reorderColumns,
  });
  const domIdMap = React.useMemo(() => {
    const map = new Map<string, GridRowId>();
    for (const info of flat.info) map.set(String(info.id), info.id);
    return map;
  }, [flat.info]);
  const domIdRef = useLatest(domIdMap);
  useRowReorder({
    enabled: rowReordering,
    rootRef,
    onDrop: (source, target, after) => {
      const s = domIdRef.current.get(source);
      const t = domIdRef.current.get(target);
      if (s !== undefined && t !== undefined) moveRowTo(s, t, after);
    },
  });

  const pageRowsRef = useLatest(pageRows);
  const visibleRowIds = () => pageRowsRef.current.filter((r) => !getSynthetic(r)).map(getRowId);
  const visibleFields = () =>
    (apiRef.current?.getVisibleColumns() ?? [])
      .map((c) => c.field)
      .filter((f) => !f.startsWith('__'));
  const cellText = (id: GridRowId, field: string) => {
    const row = pageRowsRef.current.find((r) => getRowId(r) === id);
    const col = lookup[field];
    if (!row || !col) return '';
    const value = getCellValue(row, col, apiRef);
    const formatted = inProps.ignoreValueFormatterDuringExport
      ? value
      : getFormattedValue(row, col, apiRef, value);
    return formatted == null
      ? ''
      : formatted instanceof Date
        ? formatted.toISOString()
        : String(formatted);
  };
  const handlePaste = useEventCallback(
    async (origin: { id: GridRowId; field: string }, matrix: string[][]) => {
      onClipboardPasteStart?.();
      const rowIds = visibleRowIds();
      const fields = visibleFields();
      const r0 = rowIds.indexOf(origin.id);
      const c0 = fields.indexOf(origin.field);
      if (r0 < 0 || c0 < 0) return;
      const updates: Array<{ id: GridRowId; newRow: R; oldRow: R }> = [];
      matrix.forEach((cells, r) => {
        const id = rowIds[r0 + r];
        if (id === undefined) return;
        const oldRow = pageRowsRef.current.find((row) => getRowId(row) === id)!;
        let newRow = oldRow;
        cells.forEach((text, c) => {
          const field = fields[c0 + c];
          const col = lookup[field];
          if (!col || !col.editable) return;
          const parsed = col.valueParser
            ? col.valueParser(text as never, newRow, col, apiRef as never)
            : parseByType(text, col.type);
          newRow = col.valueSetter
            ? col.valueSetter(parsed as never, newRow, col, apiRef as never)
            : ({ ...newRow, [field]: parsed } as R);
        });
        if (newRow !== oldRow) updates.push({ id, newRow, oldRow });
      });
      const results = await Promise.all(
        updates.map(async (u) => ({ ...u, newRow: await persistRow(u.id, u.newRow, u.oldRow) })),
      );
      applyRows(results.map((u) => ({ id: u.id, row: u.newRow })));
      if (results.length)
        historyRef.current!.record({
          type: 'rows',
          changes: results.map((u) => ({ id: u.id, before: u.oldRow, after: u.newRow })),
        });
      onClipboardPasteEnd?.({ updates: results });
    },
  );
  useCellSelection({
    enabled: cellSelection,
    rootRef,
    styleRef,
    scope,
    model: cellSelectionModel,
    setModel: setCellSelectionModel,
    resolveId: (domId) => domIdRef.current.get(domId),
    rowOrder: visibleRowIds,
    fieldOrder: visibleFields,
    getText: cellText,
    pasteEnabled: !disableClipboardPaste && (cellSelection || columnsProp.some((c) => c.editable)),
    splitClipboardPastedText,
    focusedCell: () =>
      apiRef.current
        ? (gridFocusCellSelector(apiRef as never) as { id: GridRowId; field: string } | null)
        : null,
    onPaste: (origin, matrix) => void handlePaste(origin, matrix),
  });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || historyStackSize <= 0) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const t = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (isUndoShortcut(event)) {
        event.preventDefault();
        void undo();
      } else if (isRedoShortcut(event)) {
        event.preventDefault();
        void redo();
      }
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [historyStackSize, undo, redo]);

  // Server-side groups: load children when a group is expanded.
  React.useEffect(() => {
    if (!server) return;
    const visit = (nodes: GridNode<R>[], keys: string[]) => {
      for (const node of nodes) {
        const nodeKeys =
          node.groupingKey !== undefined ? [...keys, String(node.groupingKey)] : keys;
        const count = node.childrenCount;
        if (count && (!node.children || node.children.length === 0)) {
          const meta = flat.meta.get(node.id);
          if (isExpandedFromMeta(node.id, meta, ui.getState())) ds.fetchChildren(nodeKeys);
        }
        if (node.children) visit(node.children, nodeKeys);
      }
    };
    visit(hierarchy, []);
  }, [server, hierarchy, expansion, flat.meta, ui, ds]);

  // autoPageSize: derive page size from the viewport.
  React.useEffect(() => {
    const api = apiRef.current;
    if (!autoPageSize || !api) return undefined;
    const update = () => {
      const dims = api.getRootDimensions?.();
      const rowHeight = dims?.rowHeight ?? 52;
      const height = dims?.viewportInnerSize?.height ?? 0;
      if (height > 0) setAutoPageSizeValue(Math.max(1, Math.floor(height / rowHeight)));
    };
    update();
    return api.subscribeEvent('viewportInnerSizeChange', update);
  }, [autoPageSize, apiRef]);

  // ---------------------------------------------------------------- imperative API
  const visibleInfoRef = useLatest(flat.info);
  React.useImperativeHandle(
    advancedApiRef as React.Ref<GridAdvancedApi<R>> | undefined,
    (): GridAdvancedApi<R> => ({
      getSortModel: () => derived.getState().sortModel,
      setSortModel: (m) => setSortModel(m),
      getFilterModel: () => derived.getState().filterModel,
      setFilterModel: (m) => setFilterModel(m),
      getPinnedColumns: () => derived.getState().pinnedColumns,
      setPinnedColumns: (m) => setPinnedColumns(m),
      pinColumn: (field, side) => actions.pinColumn(field, side),
      unpinColumn: (field) => actions.pinColumn(field, null),
      getColumnOrder: () => columnOrderRef.current,
      setColumnIndex: (field, targetIndex) => {
        const order = columnOrderRef.current;
        const target = order[Math.max(0, Math.min(order.length - 1, targetIndex))];
        if (target && target !== field)
          reorderColumns(field, target, order.indexOf(field) < targetIndex);
      },
      getRowGroupingModel: () => derived.getState().rowGroupingModel as string[],
      setRowGroupingModel: (m) => setRowGroupingModel(m),
      getAggregationModel: () => derived.getState().aggregationModel,
      setAggregationModel: (m) => setAggregationModel(m),
      setRowChildrenExpansion: (id, expanded) =>
        ui.setState((s) => ({ expansion: new Map(s.expansion).set(id, expanded) })),
      isRowExpanded: (id) => isExpandedFromMeta(id, metaRef.current.get(id), ui.getState()),
      toggleDetailPanel: (id) => actions.toggleDetailPanel(id),
      getDetailPanelExpandedRowIds: () => ui.getState().detailExpanded as Set<GridRowId>,
      getCellSelectionModel: () => cellSelectionRef.current,
      setCellSelectionModel: (m) => setCellSelectionModel(m),
      selectCellRange: (start, end) => setCellSelectionModel(rangeFor(start, end)),
      updateRows,
      undo,
      redo,
      canUndo: () => historyRef.current!.canUndo(),
      canRedo: () => historyRef.current!.canRedo(),
      clearHistory: () => historyRef.current!.clear(),
      refetchRows: (opts) => ds.refetch(opts),
      getVisibleRows: () => visibleInfoRef.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ds.refetch],
  );
  const cellSelectionRef = useLatest(cellSelectionModel);
  const rangeFor = (
    start: { id: GridRowId; field: string },
    end: { id: GridRowId; field: string },
  ) => {
    const rows = visibleRowIds();
    const fields = visibleFields();
    const r1 = rows.indexOf(start.id);
    const r2 = rows.indexOf(end.id);
    const c1 = fields.indexOf(start.field);
    const c2 = fields.indexOf(end.field);
    const model: GridCellSelectionModel = {};
    if (r1 < 0 || r2 < 0 || c1 < 0 || c2 < 0) return model;
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      model[rows[r]] = Object.fromEntries(
        fields.slice(Math.min(c1, c2), Math.max(c1, c2) + 1).map((f) => [f, true]),
      );
    }
    return model;
  };

  // ---------------------------------------------------------------- Community props
  const communitySortModel = React.useMemo(
    () => (sortModel.length ? [sortModel[0]] : EMPTY_SORT),
    [sortModel],
  );
  const communityFilterModel = React.useMemo<GridFilterModel>(
    () => ({
      items: [],
      logicOperator: filterModel.logicOperator,
      quickFilterValues: filterModel.quickFilterValues,
      quickFilterLogicOperator: filterModel.quickFilterLogicOperator,
      quickFilterExcludeHiddenColumns: filterModel.quickFilterExcludeHiddenColumns,
    }),
    [
      filterModel.logicOperator,
      filterModel.quickFilterValues,
      filterModel.quickFilterLogicOperator,
      filterModel.quickFilterExcludeHiddenColumns,
    ],
  );
  const handleCommunitySort = useEventCallback((model: GridSortModel) => setSortModel(model));
  const handleCommunityFilter = useEventCallback((model: GridFilterModel) =>
    setFilterModel((current) => mergeCommunityFilterModel(current, model)),
  );
  const sortingOrderList = (sortingOrder ?? DEFAULT_SORTING_ORDER) as Array<'asc' | 'desc' | null>;
  const handleHeaderClick = useEventCallback<GridEventListener<'columnHeaderClick'>>(
    (params, event, details) => {
      onColumnHeaderClick?.(params, event, details as never);
      if (event.defaultMuiPrevented) return;
      if (suppressHeaderClick.current) {
        event.defaultMuiPrevented = true;
        return;
      }
      if (!params.colDef.sortable || disableColumnSorting) return;
      event.defaultMuiPrevented = true;
      const multi =
        !disableMultipleColumnsSorting &&
        (multipleColumnsSortingMode === 'always' ||
          event.shiftKey ||
          event.metaKey ||
          event.ctrlKey);
      setSortModel((m) =>
        nextSortModel(m, params.field, params.colDef.sortingOrder ?? sortingOrderList, multi),
      );
    },
  );
  const handleHeaderKeyDown = useEventCallback<GridEventListener<'columnHeaderKeyDown'>>(
    (params, event) => {
      if (event.defaultMuiPrevented || event.key !== 'Enter' || event.ctrlKey || event.metaKey)
        return;
      if (!(params as GridColumnHeaderParams).colDef.sortable || disableColumnSorting) return;
      event.defaultMuiPrevented = true;
      const multi =
        !disableMultipleColumnsSorting &&
        (multipleColumnsSortingMode === 'always' || event.shiftKey);
      setSortModel((m) =>
        nextSortModel(m, params.field, params.colDef.sortingOrder ?? sortingOrderList, multi),
      );
    },
  );

  React.useEffect(() => {
    const api = apiRef.current;
    if (!api) return undefined;
    // Runs before Community's own header keydown handler so multi-sort can take over Enter.
    return api.subscribeEvent('columnHeaderKeyDown', handleHeaderKeyDown, { isFirst: true });
  }, [apiRef, handleHeaderKeyDown]);

  const handleGetRowHeight = React.useMemo(() => {
    if (!detailPanel && !getRowHeight) return undefined;
    return (params: Parameters<NonNullable<DataGridProps<R>['getRowHeight']>>[0]) => {
      const syn = getSynthetic(params.model);
      if (syn?.kind === 'detail') {
        return getDetailPanelHeight
          ? getDetailPanelHeight({ id: syn.masterId!, row: syn.masterRow as R })
          : 'auto';
      }
      return getRowHeight ? getRowHeight(params) : null;
    };
  }, [detailPanel, getRowHeight, getDetailPanelHeight]);
  const handleIsRowSelectable = React.useMemo(() => {
    if (!hasSynthetic && !isRowSelectable) return undefined;
    return (params: Parameters<NonNullable<DataGridProps<R>['isRowSelectable']>>[0]) =>
      !getSynthetic(params.row) && (isRowSelectable ? isRowSelectable(params) : true);
  }, [hasSynthetic, isRowSelectable]);
  const handleIsCellEditable = React.useMemo(() => {
    if (!hasSynthetic && !isCellEditable) return undefined;
    return (params: Parameters<NonNullable<DataGridProps<R>['isCellEditable']>>[0]) =>
      !getSynthetic(params.row) &&
      (isCellEditable ? isCellEditable(params) : !!params.colDef.editable);
  }, [hasSynthetic, isCellEditable]);
  const handleGetRowClassName = React.useMemo(() => {
    if (!hasSynthetic && !getRowClassName) return undefined;
    return (params: Parameters<NonNullable<DataGridProps<R>['getRowClassName']>>[0]) => {
      const syn = getSynthetic(params.row);
      const own = syn ? `TectonDataGrid-row--${syn.kind}` : '';
      const user = getRowClassName ? getRowClassName(params) : '';
      return own && user ? `${own} ${user}` : own || user;
    };
  }, [hasSynthetic, getRowClassName]);

  const effectiveVisibility = React.useMemo(
    () =>
      hiddenMultiSelect
        ? { ...columnVisibilityModel, [GRID_CHECKBOX_SELECTION_FIELD]: false }
        : columnVisibilityModel,
    [hiddenMultiSelect, columnVisibilityModel],
  );
  const handleVisibilityChange = useEventCallback((model: GridColumnVisibilityModel) => {
    if (!hiddenMultiSelect) return setColumnVisibilityModel(model);
    const { [GRID_CHECKBOX_SELECTION_FIELD]: _check, ...rest } = model;
    setColumnVisibilityModel(rest);
  });

  const slots = React.useMemo(
    () => ({
      columnHeaderSortIcon: SortIconSlot,
      columnHeaderFilterIconButton: FilterIconSlot,
      filterPanel: MultiFilterPanel,
      pagination:
        clientPaging || (server && pagination && !lazyLoading) ? PaginationSlot : NoPagination,
      pinnedRows: PinnedRowsSlot,
      columnMenu: ColumnMenuSlot,
      ...(groupingMode !== 'none' ? { row: HierarchyRowSlot } : null),
      ...slotsProp,
    }),
    [clientPaging, server, pagination, lazyLoading, groupingMode, slotsProp],
  );

  // Hierarchical rows expose aria-level/aria-expanded, which are only valid inside a treegrid.
  const slotProps = React.useMemo(
    () =>
      groupingMode === 'none'
        ? slotPropsProp
        : { ...slotPropsProp, main: { role: 'treegrid', ...slotPropsProp?.main } },
    [groupingMode, slotPropsProp],
  );

  const pinnedSx = React.useMemo(
    () =>
      disableColumnPinning
        ? undefined
        : pinnedColumnsSx(pinnedNormalized.left.length, pinnedNormalized.right.length),
    [disableColumnPinning, pinnedNormalized],
  );
  const rootSx = React.useMemo(
    () => [BASE_SX, pinnedSx ?? {}, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])],
    [pinnedSx, sx],
  );
  const communityInitialState = React.useMemo(() => {
    if (!initialState) return undefined;
    const {
      sorting: _s,
      filter: _f,
      pagination: _p,
      pinnedColumns: _pc,
      rowGrouping: _rg,
      aggregation: _a,
      detailPanel: _d,
      ...rest
    } = initialState;
    return rest;
  }, [initialState]);

  const hasPinnedColumns =
    !disableColumnPinning &&
    (pinnedNormalized.left.length > 0 || pinnedNormalized.right.length > 0);

  return (
    <GridAdvancedContext.Provider value={contextValue}>
      {cellSelection ? <style ref={styleRef} data-tecton-grid-selection={scope} /> : null}
      <CommunityDataGrid<R>
        {...(other as object)}
        ref={handleRef}
        apiRef={apiRef}
        className={className ? `${scope} ${className}` : scope}
        sx={rootSx}
        rows={pageRows as R[]}
        columns={communityColumns}
        getRowId={getRowId}
        initialState={communityInitialState}
        loading={loading || ds.loading}
        sortingMode="server"
        sortModel={communitySortModel}
        onSortModelChange={handleCommunitySort}
        sortingOrder={sortingOrder}
        disableColumnSorting={disableColumnSorting}
        filterMode="server"
        filterModel={communityFilterModel}
        onFilterModelChange={handleCommunityFilter}
        paginationMode="server"
        paginationModel={COMMUNITY_PAGINATION}
        rowCount={totalRows}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection || hiddenMultiSelect}
        disableMultipleRowSelection={disableMultipleRowSelection}
        columnVisibilityModel={effectiveVisibility}
        onColumnVisibilityModelChange={handleVisibilityChange}
        processRowUpdate={handleProcessRowUpdate as never}
        getRowHeight={handleGetRowHeight as never}
        isRowSelectable={handleIsRowSelectable as never}
        isCellEditable={handleIsCellEditable as never}
        getRowClassName={handleGetRowClassName as never}
        onColumnHeaderClick={handleHeaderClick}
        columnHeaderHeight={headerFilters ? (columnHeaderHeight ?? 56) + 32 : columnHeaderHeight}
        columnBufferPx={hasPinnedColumns ? PINNED_COLUMN_BUFFER_PX : columnBufferPx}
        slots={slots}
        slotProps={slotProps}
      />
    </GridAdvancedContext.Provider>
  );
}

// Sticky pinned cells must stay mounted: render every column when pinning is active.
const PINNED_COLUMN_BUFFER_PX = 100_000;
const SYSTEM_FIELDS = [
  '__check__',
  '__detail_panel_toggle__',
  '__reorder__',
  TREE_DATA_GROUPING_FIELD,
  ROW_GROUPING_SINGLE_FIELD,
];
const NO_PINNED = { left: [] as string[], right: [] as string[] };
const selectExpansion = (s: UiState) => s.expansion;
const isDetailRow = (row: object) => getSynthetic(row)?.kind === 'detail';

const INITIAL_DERIVED: DerivedState = {
  sortModel: [],
  filterModel: EMPTY_FILTER_MODEL,
  filterCounts: {},
  meta: new Map(),
  page: 0,
  pageSize: 100,
  pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
  rowCount: 0,
  pinnedTop: [],
  pinnedBottom: [],
  pinnedColumns: EMPTY_PINNED,
  aggregationModel: {},
  aggregationLabels: {},
  rowGroupingModel: [],
  sortingDisabledForReorder: false,
  columnLookup: {},
};

const BASE_SX = {
  // Community reveals header icons only for its own (single) sorted/filtered column; reveal them
  // for every column of the multi-sort / multi-filter models.
  '& .MuiDataGrid-columnHeader:has(.TectonDataGrid-headerMarker) .MuiDataGrid-iconButtonContainer':
    {
      visibility: 'visible',
      width: 'auto',
    },
  '& .MuiDataGrid-columnHeader:has(.TectonDataGrid-sortedMarker) .MuiDataGrid-sortButton': {
    opacity: 1,
  },
  // Tecton rows are opaque (zebra/hover/selected); pinned cells follow the row instead of a flat color.
  '&& .MuiDataGrid-row .MuiDataGrid-cell--pinnedLeft, && .MuiDataGrid-row .MuiDataGrid-cell--pinnedRight':
    {
      backgroundColor: 'inherit',
    },
  '& .TectonDataGrid-row--group': { fontWeight: 'var(--tecton-font-weight-medium-strong, 500)' },
  '& .TectonDataGrid-row--detail': { '&:hover': { backgroundColor: 'transparent' } },
  '& .TectonDataGrid-row--detail .MuiDataGrid-cell': {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 0,
  },
  '& .TectonDataGrid-aggregationRow': {
    fontWeight: 'var(--tecton-font-weight-medium-strong, 500)',
  },
  '&.TectonDataGrid--columnDragging, &.TectonDataGrid--rowDragging': {
    userSelect: 'none',
    cursor: 'grabbing',
  },
};

function parseByType(text: string, type: GridColDef['type']): unknown {
  const value = text.trim();
  switch (type) {
    case 'number':
      return value === '' ? null : Number(value.replace(/,/g, ''));
    case 'boolean':
      return /^(true|1|yes)$/i.test(value);
    case 'date':
    case 'dateTime':
      return value === '' ? null : new Date(value);
    default:
      return text;
  }
}

/** Server-side grouping / tree data: nests loaded children under their group rows. */
function buildServerHierarchy<R extends GridValidRowModel>(
  rows: readonly R[],
  children: ReadonlyMap<string, { rows: R[] }>,
  getRowId: (row: R) => GridRowId,
  dataSource: NonNullable<DataGridProps<R>['dataSource']>,
  maxGroupDepth: number,
): GridNode<R>[] {
  const build = (level: readonly R[], depth: number, keys: string[]): GridNode<R>[] =>
    level.map((row) => {
      const count = depth < maxGroupDepth ? (dataSource.getChildrenCount?.(row) ?? 0) : 0;
      const key = dataSource.getGroupKey?.(row);
      const node: GridNode<R> = {
        id: getRowId(row),
        depth,
        row,
        children: null,
        groupingField: null,
        groupingKey: key,
        label: key,
      };
      if (count !== 0) {
        node.childrenCount = count;
        const path = [...keys, String(key)];
        const loaded = children.get(JSON.stringify(path));
        node.children = loaded ? build(loaded.rows, depth + 1, path) : [];
      }
      return node;
    });
  return build(rows, 0, []);
}

export { collectRows };

type DataGridComponent = <R extends GridValidRowModel = any>(
  props: DataGridProps<R> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;

/** The unified Data Grid (MIT Community + independently implemented advanced features). */
export const DataGrid = React.memo(
  React.forwardRef(DataGridInner),
) as unknown as DataGridComponent & { displayName?: string };
(DataGrid as { displayName?: string }).displayName = 'DataGrid';

export default DataGrid;
