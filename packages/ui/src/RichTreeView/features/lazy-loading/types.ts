import type { TreeViewItemId } from '@mui/x-tree-view/models';

/** Data source used to lazy load the items of the tree. */
export interface TreeViewDataSource<R> {
  /**
   * Number of children of an item: `0` for a leaf, a positive number when known, `-1` when the
   * item has children but their count is unknown.
   */
  getChildrenCount: (item: R) => number;
  /**
   * Fetches the children of an item, or the root items when `parentId` is `undefined`.
   */
  getTreeItems: (parentId?: TreeViewItemId) => Promise<R[]>;
}

/** Cache of the responses of `dataSource.getTreeItems()`, keyed by parent id. */
export interface TreeViewDataSourceCache<R = unknown> {
  get: (key: string) => R[] | undefined;
  set: (key: string, value: R[]) => void;
  clear: () => void;
}

/** Status of an item regarding lazy loading. */
export type TreeViewLazyItemState =
  /** Lazy loading disabled, or unknown item. */
  | 'none'
  /** `getChildrenCount()` returned `0`. */
  | 'leaf'
  /** Has children that have not been fetched yet. */
  | 'unloaded'
  | 'loading'
  /** The last fetch failed; expanding the item retries. */
  | 'error'
  | 'loaded';
