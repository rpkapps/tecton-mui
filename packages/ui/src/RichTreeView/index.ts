// Hand-written module (replaces the generated passthrough of @mui/x-tree-view/RichTreeView).
// Superset of the Community module: every Community export is re-exported, and the local
// `RichTreeView` / `RichTreeViewProps` declarations shadow the Community ones.
export * from '@mui/x-tree-view/RichTreeView';
export { RichTreeView, default } from './RichTreeView.js';
export type {
  RichTreeViewProps,
  RichTreeViewAdvancedProps,
  RichTreeViewApiExtensions,
  RichTreeViewPublicAPI,
  RichTreeViewEnhancedApiRef,
} from './RichTreeView.types.js';
export type {
  TreeViewItemReorderPosition,
  TreeViewItemPositionChangeParams,
  TreeViewItemReorderSource,
  TreeViewItemMovedAnnouncementParams,
  RichTreeViewReorderingLocaleText,
} from './features/reordering/types.js';
export type {
  TreeViewDataSource,
  TreeViewDataSourceCache,
  TreeViewLazyItemState,
} from './features/lazy-loading/types.js';
export { TreeViewDataSourceCacheDefault } from './features/lazy-loading/TreeViewDataSourceCacheDefault.js';
export type { TreeViewDataSourceCacheDefaultOptions } from './features/lazy-loading/TreeViewDataSourceCacheDefault.js';
