import type { TreeViewItemId } from '@mui/x-tree-view/models';
import { KeyedEmitter } from './KeyedEmitter.js';

export interface ExpansionDiff {
  added: TreeViewItemId[];
  removed: TreeViewItemId[];
}

/**
 * Mirrors the expanded items of the Community store using only public signals: the
 * controlled `expandedItems` prop, `defaultExpandedItems` and the `onExpandedItemsChange`
 * callback (fired for user interactions and for `apiRef.setItemExpansion()`).
 */
export class ExpansionTracker {
  readonly emitter = new KeyedEmitter();

  version = 0;

  private expanded: ReadonlySet<TreeViewItemId> = new Set();

  private initialized = false;

  private readonly diffListeners = new Set<(diff: ExpansionDiff) => void>();

  subscribe = this.emitter.subscribe;

  /** Initial value (only applied once). */
  initialize(ids: readonly TreeViewItemId[] | undefined): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.expanded = new Set(ids ?? []);
    this.version += 1;
  }

  isExpanded(itemId: TreeViewItemId): boolean {
    return this.expanded.has(itemId);
  }

  getExpanded(): ReadonlySet<TreeViewItemId> {
    return this.expanded;
  }

  /** Registers an engine-level listener receiving the expansion diff. */
  onDiff(listener: (diff: ExpansionDiff) => void): () => void {
    this.diffListeners.add(listener);
    return () => {
      this.diffListeners.delete(listener);
    };
  }

  set(ids: readonly TreeViewItemId[]): ExpansionDiff {
    const next = new Set(ids);
    const added: TreeViewItemId[] = [];
    const removed: TreeViewItemId[] = [];
    for (const id of next) {
      if (!this.expanded.has(id)) {
        added.push(id);
      }
    }
    for (const id of this.expanded) {
      if (!next.has(id)) {
        removed.push(id);
      }
    }
    const diff = { added, removed };
    if (added.length === 0 && removed.length === 0) {
      return diff;
    }
    this.expanded = next;
    this.version += 1;
    for (const listener of [...this.diffListeners]) {
      listener(diff);
    }
    this.emitter.emit([...added, ...removed]);
    return diff;
  }
}
