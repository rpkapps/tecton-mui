'use client';
import * as React from 'react';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { TreeItemDragAndDropOverlay } from '@mui/x-tree-view/TreeItemDragAndDropOverlay';
import type { TreeViewItemsReorderingAction } from '@mui/x-tree-view/models';
import { useGlobalSnapshot, useKeyedSnapshot } from '../core/hooks.js';
import type { ReorderingEngine } from './ReorderingEngine.js';

export interface ReorderOverlaySlotProps {
  /** Engine that owns the drag state. */
  reorderingEngine: ReorderingEngine<unknown>;
  /** Id of the item rendering the overlay. */
  ownerItemId: string;
  /** Consumer overlay component (`slots.dragAndDropOverlay` of the item). */
  overlayComponent?: React.ElementType | undefined;
  action?: TreeViewItemsReorderingAction | undefined;
  [key: string]: unknown;
}

/**
 * `dragAndDropOverlay` slot of the tree items. It is the only component that subscribes to
 * the hover target, so dragging over the tree re-renders two overlays per target change and
 * nothing else.
 */
export function ReorderOverlaySlot(props: ReorderOverlaySlotProps) {
  const { reorderingEngine, ownerItemId, overlayComponent, action: actionProp, ...other } = props;
  const action = useKeyedSnapshot(reorderingEngine.emitter, ownerItemId, () =>
    reorderingEngine.getAction(ownerItemId),
  );
  const Overlay = overlayComponent ?? TreeItemDragAndDropOverlay;
  return <Overlay {...other} action={action ?? actionProp} />;
}

export interface ReorderingLiveRegionProps {
  engine: ReorderingEngine<unknown>;
  instructionsId: string;
  instructions: string;
}

/** Visually hidden keyboard instructions and polite live region announcing moves. */
export function ReorderingLiveRegion(props: ReorderingLiveRegionProps) {
  const { engine, instructionsId, instructions } = props;
  const announcement = useGlobalSnapshot(engine.announcer, () => engine.announcement);
  return (
    <span style={visuallyHidden} data-tecton-tree-reordering-a11y="">
      <span id={instructionsId}>{instructions}</span>
      <span role="status" aria-live="polite" aria-atomic="true">
        {announcement.message}
      </span>
    </span>
  );
}
