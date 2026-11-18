import * as React from 'react';
import type {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { cacheKey, GridDataSourceCacheDefault } from './cache.js';
import type { ApiRef } from '../../core/columns.js';
import type {
  GridAggregationModel,
  GridDataSource,
  GridDataSourceCache,
  GridGetRowsParams,
  GridGetRowsResponse,
} from '../../public-types.js';

export interface ServerLevel<R> {
  rows: R[];
  rowCount: number;
  loading: boolean;
  error?: unknown;
}

export interface DataSourceState<R> {
  active: boolean;
  top: ServerLevel<R>;
  /** Loaded children per group path (JSON of groupKeys). */
  children: ReadonlyMap<string, ServerLevel<R>>;
  /** Lazy loading: loaded rows by absolute index. */
  lazy: ReadonlyMap<number, R> | null;
  lazyRowCount: number;
  aggregateRow: Partial<R> | null;
  loading: boolean;
  fetchChildren: (groupKeys: string[]) => void;
  refetch: (options?: { clearCache?: boolean }) => void;
  /** Drops cached responses (after a server-side row update, cached pages are stale). */
  clearCache: () => void;
}

export interface UseDataSourceOptions<R extends GridValidRowModel> {
  dataSource?: GridDataSource<R>;
  cache?: GridDataSourceCache | null;
  apiRef: ApiRef;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
  paginationModel: GridPaginationModel;
  pagination: boolean;
  groupFields: string[];
  aggregationModel?: GridAggregationModel;
  lazyLoading: boolean;
  throttleMs: number;
  onError?: (error: unknown) => void;
}

const EMPTY_CHILDREN: ReadonlyMap<string, ServerLevel<never>> = new Map();
const EMPTY_LEVEL: ServerLevel<never> = { rows: [], rowCount: 0, loading: false };

/**
 * Server-side data orchestration independent of Community's dataSource (which is limited to one
 * sort/filter item): builds request params from the full multi models, caches responses, loads
 * group children on demand and drives viewport-based lazy loading.
 */
export function useDataSource<R extends GridValidRowModel>(
  options: UseDataSourceOptions<R>,
): DataSourceState<R> {
  const {
    dataSource,
    apiRef,
    sortModel,
    filterModel,
    paginationModel,
    pagination,
    groupFields,
    aggregationModel,
    lazyLoading,
  } = options;
  const active = !!dataSource;
  const defaultCache = React.useMemo(() => new GridDataSourceCacheDefault(), []);
  const cache = options.cache === undefined ? defaultCache : options.cache;
  const optsRef = React.useRef(options);
  optsRef.current = options;

  const [top, setTop] = React.useState<ServerLevel<R>>(EMPTY_LEVEL);
  // Children are tagged with the request generation; a model change makes older entries invisible
  // without a synchronous reset in an effect.
  const [childrenState, setChildrenState] = React.useState<{
    gen: number;
    map: ReadonlyMap<string, ServerLevel<R>>;
  }>({
    gen: 0,
    map: new Map(),
  });
  const [lazy, setLazy] = React.useState<ReadonlyMap<number, R>>(new Map());
  const [lazyRowCount, setLazyRowCount] = React.useState(0);
  const [aggregateRow, setAggregateRow] = React.useState<Partial<R> | null>(null);
  const [version, setVersion] = React.useState(0);
  const versionRef = React.useRef(version);
  versionRef.current = version;
  const generation = React.useRef(0);
  const inFlight = React.useRef(new Set<string>());
  /** Set by `refetch()`: the next generation's requests go to the server, not the cache. */
  const skipCacheGen = React.useRef(-1);

  const baseParams = React.useMemo(
    () => ({ sortModel, filterModel, groupFields, aggregationModel }),
    [sortModel, filterModel, groupFields, aggregationModel],
  );

  const request = React.useCallback(
    async (
      params: GridGetRowsParams,
      skipCache = false,
    ): Promise<GridGetRowsResponse<R> | null> => {
      const ds = optsRef.current.dataSource;
      if (!ds) return null;
      const key = cacheKey(params);
      const cached = skipCache ? undefined : cache?.get(key);
      if (cached) return cached as GridGetRowsResponse<R>;
      const response = await ds.getRows(params);
      cache?.set(key, response as GridGetRowsResponse);
      return response;
    },
    [cache],
  );

  const fail = React.useCallback((error: unknown) => {
    optsRef.current.onError?.(error);
    if (!optsRef.current.onError && process.env.NODE_ENV !== 'production') console.error(error);
  }, []);

  // Top level (paginated or first lazy chunk). Model changes start a new generation.
  React.useEffect(() => {
    if (!active) return;
    const gen = ++generation.current;
    inFlight.current.clear();
    const skipCache = skipCacheGen.current === version;
    const chunk = paginationModel.pageSize;
    const params: GridGetRowsParams = lazyLoading
      ? { ...baseParams, start: 0, end: chunk - 1, groupKeys: [] }
      : pagination
        ? {
            ...baseParams,
            paginationModel,
            start: paginationModel.page * paginationModel.pageSize,
            end: (paginationModel.page + 1) * paginationModel.pageSize - 1,
            groupKeys: [],
          }
        : { ...baseParams, start: 0, end: Number.MAX_SAFE_INTEGER, groupKeys: [] };
    // Starting a request is the effect's purpose; the loading flag must render immediately.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTop((prev) => ({ ...prev, loading: true }));
    request(params, skipCache).then(
      (res) => {
        if (!res || gen !== generation.current) return;
        const rowCount = res.rowCount ?? -1;
        setTop({
          rows: res.rows,
          rowCount: rowCount < 0 ? res.rows.length : rowCount,
          loading: false,
        });
        setAggregateRow(res.aggregateRow ?? null);
        if (lazyLoading) {
          const map = new Map<number, R>();
          res.rows.forEach((row, i) => map.set(i, row));
          setLazy(map);
          setLazyRowCount(rowCount);
          apiRef.current?.scrollToIndexes?.({ rowIndex: 0 });
        }
      },
      (error) => {
        if (gen !== generation.current) return;
        setTop({ rows: [], rowCount: 0, loading: false, error });
        fail(error);
      },
    );
  }, [
    active,
    baseParams,
    paginationModel,
    pagination,
    lazyLoading,
    request,
    fail,
    apiRef,
    version,
  ]);

  const setChildren = React.useCallback((gen: number, key: string, level: ServerLevel<R>) => {
    setChildrenState((prev) => ({
      gen,
      map: new Map(prev.gen === gen ? prev.map : undefined).set(key, level),
    }));
  }, []);

  const fetchChildren = React.useCallback(
    (groupKeys: string[]) => {
      const key = JSON.stringify(groupKeys);
      if (inFlight.current.has(key)) return;
      inFlight.current.add(key);
      const gen = generation.current;
      setChildren(gen, key, { rows: [], rowCount: 0, loading: true });
      request(
        { ...baseParams, start: 0, end: Number.MAX_SAFE_INTEGER, groupKeys },
        skipCacheGen.current === versionRef.current,
      ).then(
        (res) => {
          if (!res || gen !== generation.current) return;
          setChildren(gen, key, {
            rows: res.rows,
            rowCount: res.rowCount ?? res.rows.length,
            loading: false,
          });
        },
        (error) => {
          if (gen !== generation.current) return;
          // The key stays in flight: the expanded-groups effect must not retry a failing group on
          // every render. `refetch()` or a model change starts a new generation and retries.
          setChildren(gen, key, { rows: [], rowCount: 0, loading: false, error });
          fail(error);
        },
      );
    },
    [baseParams, request, fail, setChildren],
  );

  // Viewport-driven lazy loading.
  const lazyRef = React.useRef(lazy);
  lazyRef.current = lazy;
  const lazyCountRef = React.useRef(lazyRowCount);
  lazyCountRef.current = lazyRowCount;
  React.useEffect(() => {
    const api = apiRef.current;
    if (!active || !lazyLoading || !api) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: { first: number; last: number } | null = null;
    const chunk = Math.max(1, optsRef.current.paginationModel.pageSize);
    const load = () => {
      timer = undefined;
      if (!pending) return;
      const { first, last } = pending;
      pending = null;
      const count = lazyCountRef.current;
      const loaded = lazyRef.current;
      const end = count >= 0 ? Math.min(last, count - 1) : last + chunk;
      for (let start = Math.floor(first / chunk) * chunk; start <= end; start += chunk) {
        let missing = false;
        for (let i = start; i < start + chunk && (count < 0 || i < count); i++) {
          if (!loaded.has(i)) {
            missing = true;
            break;
          }
        }
        const key = `lazy:${start}`;
        if (!missing || inFlight.current.has(key)) continue;
        inFlight.current.add(key);
        const gen = generation.current;
        request(
          { ...baseParams, start, end: start + chunk - 1, groupKeys: [] },
          skipCacheGen.current === versionRef.current,
        ).then(
          (res) => {
            inFlight.current.delete(key);
            if (!res || gen !== generation.current) return;
            setLazy((prev) => {
              const next = new Map(prev);
              res.rows.forEach((row, i) => next.set(start + i, row));
              return next;
            });
            if (count < 0 && res.rows.length < chunk) setLazyRowCount(start + res.rows.length);
            else if (res.rowCount != null && res.rowCount >= 0) setLazyRowCount(res.rowCount);
          },
          (error) => {
            inFlight.current.delete(key);
            fail(error);
          },
        );
      }
    };
    const unsubscribe = api.subscribeEvent(
      'renderedRowsIntervalChange',
      (ctx: { firstRowIndex: number; lastRowIndex: number }) => {
        pending = { first: ctx.firstRowIndex, last: ctx.lastRowIndex };
        timer ??= setTimeout(load, optsRef.current.throttleMs);
      },
    );
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [active, lazyLoading, apiRef, baseParams, request, fail]);

  const refetch = React.useCallback(
    (opts?: { clearCache?: boolean }) => {
      if (opts?.clearCache) cache?.clear();
      setVersion((v) => {
        skipCacheGen.current = v + 1;
        return v + 1;
      });
    },
    [cache],
  );

  const clearCache = React.useCallback(() => cache?.clear(), [cache]);

  const children = childrenState.gen === generation.current ? childrenState.map : EMPTY_CHILDREN;
  const loading = top.loading || [...children.values()].some((c) => c.loading);
  return {
    active,
    top,
    children,
    lazy: lazyLoading ? lazy : null,
    lazyRowCount,
    aggregateRow,
    loading,
    fetchChildren,
    refetch,
    clearCache,
  };
}
