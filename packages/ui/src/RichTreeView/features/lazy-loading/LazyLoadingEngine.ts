import type { TreeViewItemId } from '@mui/x-tree-view/models';
import { KeyedEmitter } from '../core/KeyedEmitter.js';
import type { ExpansionTracker } from '../core/ExpansionTracker.js';
import {
  ROOT_KEY,
  toKey,
  type ParentId,
  type TreeStructureStore,
} from '../core/TreeStructureStore.js';
import type {
  TreeViewDataSource,
  TreeViewDataSourceCache,
  TreeViewLazyItemState,
} from './types.js';

/** Minimal subset of the Community public API used by the engine. */
export interface LazyLoadingApi<R> {
  addItems?: (params: {
    items: readonly R[];
    parentId?: TreeViewItemId | null;
    index?: number;
  }) => void;
  getItemOrderedChildrenIds?: (itemId: TreeViewItemId | null) => TreeViewItemId[];
  setItemExpansion?: (params: { itemId: TreeViewItemId; shouldBeExpanded?: boolean }) => void;
}

export interface LazyLoadingConfig<R> {
  dataSource: TreeViewDataSource<R> | undefined;
  cache: TreeViewDataSourceCache<R> | null;
  onError?: ((error: unknown, parentId: TreeViewItemId | null) => void) | undefined;
}

/**
 * Lazy loading engine: fetches children through `dataSource.getTreeItems()` when an item is
 * expanded (or is expanded initially), caches the responses, and inserts the children with the
 * public `apiRef.addItems()` method so only the affected branch re-renders.
 *
 * Statuses are kept per item in an external store; each item subscribes to its own key.
 */
export class LazyLoadingEngine<R> {
  readonly emitter = new KeyedEmitter();

  config: LazyLoadingConfig<R> = { dataSource: undefined, cache: null };

  private readonly status = new Map<string, 'loading' | 'error'>();

  private readonly loaded = new Set<string>();

  private readonly requests = new Map<string, number>();

  private requestCounter = 0;

  private disposed = false;

  private unsubscribeExpansion: (() => void) | undefined;

  constructor(
    private readonly structure: TreeStructureStore<R>,
    private readonly expansion: ExpansionTracker,
    private readonly getApi: () => LazyLoadingApi<R> | undefined,
  ) {}

  get enabled(): boolean {
    return this.config.dataSource != null;
  }

  /** Starts listening to expansion changes and loads what is needed on mount. */
  mount(): void {
    this.disposed = false;
    this.unsubscribeExpansion ??= this.expansion.onDiff(({ added }) => {
      for (const itemId of added) {
        this.loadIfNeeded(itemId);
      }
    });
    if (!this.enabled) {
      return;
    }
    if (this.structure.getChildren(null).length === 0 && !this.loaded.has(ROOT_KEY)) {
      void this.fetchChildren(null);
    } else {
      this.loadExpandedDescendants(null);
    }
  }

  unmount(): void {
    this.disposed = true;
    this.unsubscribeExpansion?.();
    this.unsubscribeExpansion = undefined;
  }

  getRootStatus(): 'loading' | 'error' | 'idle' {
    return this.status.get(ROOT_KEY) ?? 'idle';
  }

  /** `true` while the root items load, including before the mount fetch starts. */
  isRootPending(): boolean {
    const status = this.status.get(ROOT_KEY);
    if (status) {
      return status === 'loading';
    }
    return (
      this.enabled && !this.loaded.has(ROOT_KEY) && this.structure.getChildren(null).length === 0
    );
  }

  getItemState(itemId: TreeViewItemId): TreeViewLazyItemState {
    const dataSource = this.config.dataSource;
    if (!dataSource) {
      return 'none';
    }
    const status = this.status.get(itemId);
    if (status) {
      return status;
    }
    if (this.loaded.has(itemId) || this.structure.hasOverride(itemId)) {
      return 'loaded';
    }
    const model = this.structure.getModel(itemId);
    if (!model) {
      return 'none';
    }
    if (this.structure.getDeclaredChildren(model).length > 0) {
      return 'loaded';
    }
    return dataSource.getChildrenCount(model) === 0 ? 'leaf' : 'unloaded';
  }

  /** Number of loading rows to display for an item. */
  getLoadingRowsCount(itemId: TreeViewItemId): number {
    const model = this.structure.getModel(itemId);
    const count =
      model && this.config.dataSource ? this.config.dataSource.getChildrenCount(model) : -1;
    return count > 0 ? Math.min(count, 100) : 5;
  }

  /** Whether reordering may drop items into this parent. */
  canReceiveChildren = (itemId: TreeViewItemId): boolean => {
    const state = this.getItemState(itemId);
    return state === 'none' || state === 'loaded' || state === 'leaf';
  };

  loadIfNeeded(itemId: TreeViewItemId): void {
    const state = this.getItemState(itemId);
    if (state === 'unloaded' || state === 'error') {
      void this.fetchChildren(itemId);
    }
  }

  /**
   * Fetches the children of an item (`null` = root items).
   * @param force Skip the cache (used by `updateItemChildren()`).
   */
  async fetchChildren(parentId: ParentId, force = false): Promise<void> {
    const dataSource = this.config.dataSource;
    if (!dataSource) {
      return;
    }
    const key = toKey(parentId);
    const cache = this.config.cache;
    if (!force) {
      const cached = cache?.get(key);
      if (cached !== undefined) {
        this.applyChildren(parentId, cached);
        return;
      }
    }
    this.requestCounter += 1;
    const requestId = this.requestCounter;
    this.requests.set(key, requestId);
    this.status.set(key, 'loading');
    this.emitter.emit([key]);
    try {
      const children = await dataSource.getTreeItems(parentId ?? undefined);
      // Discard superseded responses and responses arriving after unmount.
      if (this.disposed || this.requests.get(key) !== requestId) {
        return;
      }
      this.requests.delete(key);
      cache?.set(key, children);
      this.status.delete(key);
      this.applyChildren(parentId, children);
    } catch (error) {
      if (this.disposed || this.requests.get(key) !== requestId) {
        return;
      }
      this.requests.delete(key);
      this.status.set(key, 'error');
      if (parentId != null && this.expansion.isExpanded(parentId)) {
        this.getApi()?.setItemExpansion?.({ itemId: parentId, shouldBeExpanded: false });
      }
      this.emitter.emit([key]);
      this.config.onError?.(error, parentId);
    }
  }

  /** Re-fetches the children of an item, or the whole tree when `itemId` is `null`. */
  async updateItemChildren(itemId: TreeViewItemId | null): Promise<void> {
    if (itemId == null) {
      this.config.cache?.clear();
      this.loaded.clear();
      this.status.clear();
      this.structure.clearOverrides();
      this.emitter.emitAll();
    }
    await this.fetchChildren(itemId, true);
  }

  private applyChildren(parentId: ParentId, children: readonly R[]): void {
    const key = toKey(parentId);
    const alreadyLoaded = this.loaded.has(key);
    this.loaded.add(key);
    if (parentId == null) {
      this.structure.setChildren(null, children, true);
    } else {
      const api = this.getApi();
      const communityChildren = api?.getItemOrderedChildrenIds?.(parentId) ?? [];
      let applied = false;
      if (
        !alreadyLoaded &&
        communityChildren.length === 0 &&
        children.length > 0 &&
        api?.addItems
      ) {
        try {
          api.addItems({ items: children, parentId });
          this.structure.setChildren(parentId, children, false);
          applied = true;
        } catch {
          // e.g. duplicated ids: fall back to a full rebuild below.
        }
      }
      if (!applied) {
        this.structure.setChildren(
          parentId,
          children,
          communityChildren.length > 0 || children.length > 0,
        );
      }
    }
    this.emitter.emit([key]);
    this.loadExpandedDescendants(parentId);
  }

  /** Children that are expanded (e.g. `defaultExpandedItems`) load as soon as they appear. */
  private loadExpandedDescendants(parentId: ParentId): void {
    for (const childId of this.structure.getChildrenIds(parentId)) {
      if (!this.expansion.isExpanded(childId)) {
        continue;
      }
      if (this.getItemState(childId) === 'loaded') {
        this.loadExpandedDescendants(childId);
      } else {
        this.loadIfNeeded(childId);
      }
    }
  }
}
