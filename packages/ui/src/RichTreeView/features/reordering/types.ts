import type { TreeViewItemId, TreeViewItemsReorderingAction } from '@mui/x-tree-view/models';

export type { TreeViewItemsReorderingAction };

/** Position of an item: its parent (`null` = root level) and its index among its siblings. */
export interface TreeViewItemReorderPosition {
  parentId: TreeViewItemId | null;
  index: number;
}

export interface TreeViewItemPositionChangeParams {
  /** The id of the moved item. */
  itemId: TreeViewItemId;
  /** The position before the move. */
  oldPosition: TreeViewItemReorderPosition;
  /** The position after the move (`index` is the final index in the new parent). */
  newPosition: TreeViewItemReorderPosition;
}

/** How the move was requested. */
export type TreeViewItemReorderSource = 'drag' | 'keyboard';

export interface TreeViewItemMovedAnnouncementParams extends TreeViewItemPositionChangeParams {
  /** Label of the moved item. */
  label: string;
  /** Label of the new parent, `null` at the root level. */
  parentLabel: string | null;
  /** Number of siblings at the new position (including the moved item). */
  siblingsCount: number;
}

export interface RichTreeViewReorderingLocaleText {
  /** Screen reader instructions attached to every reorderable item (`aria-describedby`). */
  keyboardInstructions: string;
  /** Live region message announced after a move. */
  itemMoved: (params: TreeViewItemMovedAnnouncementParams) => string;
  /** Live region message announced when a keyboard move is not allowed. */
  itemMoveNotAllowed: (label: string) => string;
}

export const DEFAULT_REORDERING_LOCALE_TEXT: RichTreeViewReorderingLocaleText = {
  keyboardInstructions:
    'To move this item, press Alt+Shift with the arrow keys: Up and Down to move among siblings, Right to nest it under the previous item, Left to move it out of its parent.',
  itemMoved: ({ label, parentLabel, newPosition, siblingsCount }) =>
    `${label} moved to position ${newPosition.index + 1} of ${siblingsCount}${
      parentLabel == null ? ' at the top level' : ` in ${parentLabel}`
    }.`,
  itemMoveNotAllowed: (label) => `${label} cannot be moved there.`,
};
