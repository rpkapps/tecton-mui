/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any --
   The generics mirror the Community signatures (`R extends {}`, `any` defaults). */
import type * as React from 'react';
import type {
  RichTreeViewApiRef as MuiRichTreeViewApiRef,
  RichTreeViewProps as MuiRichTreeViewProps,
} from '@mui/x-tree-view/RichTreeView';
import type { TreeViewItemId } from '@mui/x-tree-view/models';
import type {
  RichTreeViewReorderingLocaleText,
  TreeViewItemPositionChangeParams,
} from './features/reordering/types.js';
import type { TreeViewDataSource, TreeViewDataSourceCache } from './features/lazy-loading/types.js';

/** Methods added to the Community `apiRef` by the Tecton `RichTreeView`. */
export interface RichTreeViewApiExtensions {
  /**
   * Re-fetches the children of an item through `dataSource.getTreeItems()` (bypassing the
   * cache), or reloads the whole tree when `itemId` is `null`. No-op without `dataSource`.
   */
  updateItemChildren: (itemId: TreeViewItemId | null) => Promise<void>;
}

/** Public API of the Tecton `RichTreeView` (Community API plus `RichTreeViewApiExtensions`). */
export type RichTreeViewPublicAPI<
  R extends {} = any,
  Multiple extends boolean | undefined = any,
> = NonNullable<MuiRichTreeViewApiRef<R, Multiple>['current']> & Partial<RichTreeViewApiExtensions>;

export type RichTreeViewEnhancedApiRef<
  R extends {} = any,
  Multiple extends boolean | undefined = any,
> = React.RefObject<RichTreeViewPublicAPI<R, Multiple> | undefined>;

/**
 * Props of the features implemented on top of the Community component (Pro-equivalent).
 * Every feature is inactive unless its prop is set.
 */
export interface RichTreeViewAdvancedProps<R extends {}> {
  // --- Items reordering ----------------------------------------------------------------
  /**
   * If `true`, items can be reordered with drag and drop, or with Alt+Shift+Arrow keys.
   * @default false
   */
  itemsReordering?: boolean;
  /**
   * Determines if an item can be reordered (all items are reorderable by default).
   * Evaluated when the item renders and again when a drag or keyboard move starts.
   */
  isItemReorderable?: (itemId: TreeViewItemId) => boolean;
  /**
   * Determines if an item can be moved to a new position. Called during drag hover (once per
   * hovered item and drop action) and before keyboard moves.
   */
  canMoveItemToNewPosition?: (params: TreeViewItemPositionChangeParams) => boolean;
  /**
   * Callback fired after an item has been moved. The new position is already applied
   * (uncontrolled); store it and pass the updated `items` to persist it.
   */
  onItemPositionChange?: (params: TreeViewItemPositionChangeParams) => void;
  /** Texts used for the reordering instructions and announcements (screen readers). */
  itemsReorderingLocaleText?: Partial<RichTreeViewReorderingLocaleText>;

  // --- Lazy loading ----------------------------------------------------------------------
  /**
   * Lazy loads the items. `items` is used as the initial state; when it is empty the root
   * items are fetched on mount with `getTreeItems()`.
   */
  dataSource?: TreeViewDataSource<R>;
  /**
   * Cache of the `getTreeItems()` responses. Defaults to a `TreeViewDataSourceCacheDefault`
   * (5 minutes time to live); `null` disables caching.
   */
  dataSourceCache?: TreeViewDataSourceCache<R> | null;
  /** Callback fired when `getTreeItems()` rejects (`parentId` is `null` for the root). */
  onDataSourceError?: (error: unknown, parentId: TreeViewItemId | null) => void;

  // --- Virtualization ----------------------------------------------------------------------
  /**
   * If `true`, only the rows intersecting the viewport are rendered. Requires a fixed
   * `itemHeight` (32px by default, or measured from the first row when `itemHeight` is not
   * set) and a scroll container with a height (the tree fills its parent).
   * Renders the items as a flat DOM list (`domStructure="flat"`).
   * @default false
   */
  virtualization?: boolean;
  /**
   * If `true`, virtualization is disabled even when `virtualization` is set (API parity with
   * the commercial component, where virtualization is on by default).
   * @default false
   */
  disableVirtualization?: boolean;
}

export interface RichTreeViewProps<R extends {}, Multiple extends boolean | undefined>
  extends Omit<MuiRichTreeViewProps<R, Multiple>, 'apiRef'>, RichTreeViewAdvancedProps<R> {
  /**
   * The ref object that allows Tree View manipulation. Can be instantiated with
   * `useRichTreeViewApiRef()`. When an advanced feature is enabled it also exposes
   * `updateItemChildren()`.
   */
  apiRef?: React.RefObject<Partial<RichTreeViewPublicAPI<R, Multiple>> | undefined> | undefined;
}
