import type { TreeViewItemsReorderingAction } from '@mui/x-tree-view/models';

export interface DropActionInput {
  /** Pointer position relative to the hovered row (px). */
  offsetX: number;
  offsetY: number;
  /** Size of the hovered row (px). */
  width: number;
  height: number;
  /** Depth of the hovered item (0 = root level). */
  depth: number;
  /** Horizontal indentation per level (px). */
  indentation: number;
  isRtl: boolean;
  /** Whether the hovered item is the last of its siblings. */
  isLastChild: boolean;
  /** Whether the hovered item may receive children. */
  canReceiveChildren: boolean;
}

/**
 * Picks the reordering action from the pointer position on the hovered row:
 * the upper third reorders above, the lower third below, the middle nests the dragged item.
 * In the lower third of the last child, pointing left of the item's indentation moves the
 * dragged item out to the parent level.
 */
export function getDropAction(input: DropActionInput): TreeViewItemsReorderingAction {
  const ratio = input.height > 0 ? input.offsetY / input.height : 0.5;
  if (ratio < 1 / 3) {
    return 'reorder-above';
  }
  if (ratio > 2 / 3) {
    if (input.isLastChild && input.depth > 0) {
      const inlineStart = input.isRtl ? input.width - input.offsetX : input.offsetX;
      if (inlineStart < input.depth * input.indentation) {
        return 'move-to-parent';
      }
    }
    return 'reorder-below';
  }
  if (input.canReceiveChildren) {
    return 'make-child';
  }
  return ratio < 0.5 ? 'reorder-above' : 'reorder-below';
}

/** Converts an `itemChildrenIndentation` value to pixels (rem/em use a 16px base). */
export function indentationToPx(value: string | number | undefined): number {
  if (value == null) {
    return 12;
  }
  if (typeof value === 'number') {
    return value;
  }
  const match = /^\s*(-?\d*\.?\d+)\s*(px|rem|em)?\s*$/.exec(value);
  if (!match) {
    return 12;
  }
  const amount = Number(match[1]);
  return match[2] === 'rem' || match[2] === 'em' ? amount * 16 : amount;
}
