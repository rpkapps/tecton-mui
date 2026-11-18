'use client';
import * as React from 'react';
import type { TreeViewItemId } from '@mui/x-tree-view/models';
import type { ExpansionTracker } from './features/core/ExpansionTracker.js';
import type { TreeStructureStore } from './features/core/TreeStructureStore.js';
import type { LazyLoadingEngine } from './features/lazy-loading/LazyLoadingEngine.js';
import type { ReorderingEngine } from './features/reordering/ReorderingEngine.js';
import type { VirtualizationStore } from './features/virtualization/VirtualizationStore.js';

export interface RichTreeViewEngines {
  structure: TreeStructureStore<unknown>;
  expansion: ExpansionTracker;
  reordering: ReorderingEngine<unknown>;
  lazyLoading: LazyLoadingEngine<unknown>;
  virtualization: VirtualizationStore<unknown>;
  /** Render-time values read by the items without subscribing (see `RichTreeView`). */
  render: {
    itemLoaderSlotProps?: unknown;
  };
}

export interface RichTreeViewEnhancedContextValue extends RichTreeViewEngines {
  /** Item component of the consumer (`slots.item`), `TreeItem` by default. */
  ItemComponent: React.ElementType;
  /** Root component of the consumer (`slots.root`). */
  RootComponent: React.ElementType | undefined;
  itemLoaderSlot: React.ElementType | undefined;
  reorderingEnabled: boolean;
  lazyLoadingEnabled: boolean;
  virtualizationEnabled: boolean;
  /** Nested DOM structure (loading rows are rendered inside the parent item). */
  isNested: boolean;
  isRtl: boolean;
  instructionsId: string | undefined;
  getItemDOMElement: (itemId: TreeViewItemId) => HTMLElement | null;
  setItemExpansion: (itemId: TreeViewItemId, event: React.SyntheticEvent) => void;
}

export const RichTreeViewEnhancedContext =
  React.createContext<RichTreeViewEnhancedContextValue | null>(null);

export function useRichTreeViewEnhancedContext(): RichTreeViewEnhancedContextValue {
  const context = React.useContext(RichTreeViewEnhancedContext);
  if (context == null) {
    throw new Error(
      'Tecton RichTreeView: enhanced slots must be rendered inside the Tecton `RichTreeView`.',
    );
  }
  return context;
}
