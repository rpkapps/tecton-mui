import type { TreeViewItemId } from '@mui/x-tree-view/models';
import { KeyedEmitter } from '../core/KeyedEmitter.js';
import type { ExpansionTracker } from '../core/ExpansionTracker.js';
import type { TreeStructureStore } from '../core/TreeStructureStore.js';

export const DEFAULT_VIRTUALIZATION_ITEM_HEIGHT = 32;

/** Rows rendered above and below the viewport. */
export const VIRTUALIZATION_OVERSCAN = 5;

/** Viewport used when the scroll container has no measurable height (SSR, jsdom). */
export const FALLBACK_VIEWPORT_ROWS = 20;

export interface VirtualRootSnapshot {
  renderedIds: readonly TreeViewItemId[];
  totalHeight: number;
}

/**
 * Virtualization engine for the flat DOM structure. It derives the flat list of visible
 * (expanded) items from the structure model and the expansion state, and computes which rows
 * intersect the viewport. Only the root (row list) and the rows whose position changes are
 * notified.
 */
export class VirtualizationStore<R> {
  readonly emitter = new KeyedEmitter();

  enabled = false;

  /** Height provided through `itemHeight`, `null` when measured. */
  explicitItemHeight: number | null = null;

  measuredItemHeight: number | null = null;

  scrollElement: HTMLElement | null = null;

  private scrollTop = 0;

  private viewportHeight = 0;

  private flat: TreeViewItemId[] = [];

  private flatIndex = new Map<TreeViewItemId, number>();

  private flatKey = '';

  private focusedItemId: TreeViewItemId | null = null;

  private draggedItemId: TreeViewItemId | null = null;

  private pendingFocusItemId: TreeViewItemId | null = null;

  private snapshot: VirtualRootSnapshot = { renderedIds: [], totalHeight: 0 };

  private snapshotKey = '';

  constructor(
    private readonly structure: TreeStructureStore<R>,
    private readonly expansion: ExpansionTracker,
  ) {
    structure.subscribe(() => this.refresh());
    expansion.subscribe(() => this.refresh());
  }

  get itemHeight(): number {
    return this.explicitItemHeight ?? this.measuredItemHeight ?? DEFAULT_VIRTUALIZATION_ITEM_HEIGHT;
  }

  /** Ordered ids of the visible (expanded) items. */
  getFlatList(): readonly TreeViewItemId[] {
    const key = `${this.structure.version}:${this.expansion.version}`;
    if (key !== this.flatKey) {
      this.flatKey = key;
      const flat: TreeViewItemId[] = [];
      const index = new Map<TreeViewItemId, number>();
      const stack: TreeViewItemId[] = [...this.structure.getChildrenIds(null)].reverse();
      while (stack.length > 0) {
        const id = stack.pop()!;
        index.set(id, flat.length);
        flat.push(id);
        if (this.expansion.isExpanded(id)) {
          const children = this.structure.getChildrenIds(id);
          for (let i = children.length - 1; i >= 0; i -= 1) {
            stack.push(children[i]!);
          }
        }
      }
      this.flat = flat;
      this.flatIndex = index;
    }
    return this.flat;
  }

  getFlatIndex(itemId: TreeViewItemId): number {
    this.getFlatList();
    return this.flatIndex.get(itemId) ?? -1;
  }

  /** `[start, end)` row range intersecting the viewport, including the overscan. */
  getRange(): { start: number; end: number } {
    const count = this.getFlatList().length;
    const height = this.itemHeight;
    const viewport =
      this.viewportHeight > 0 ? this.viewportHeight : FALLBACK_VIEWPORT_ROWS * height;
    const first = Math.floor(this.scrollTop / height);
    const last = Math.ceil((this.scrollTop + viewport) / height);
    return {
      start: Math.max(0, first - VIRTUALIZATION_OVERSCAN),
      end: Math.min(count, last + VIRTUALIZATION_OVERSCAN),
    };
  }

  /** Rows to render: the viewport range plus the focused and dragged items. */
  getRootSnapshot = (): VirtualRootSnapshot => {
    const flat = this.getFlatList();
    const { start, end } = this.getRange();
    const key = `${this.flatKey}|${start}|${end}|${this.itemHeight}|${this.focusedItemId}|${this.draggedItemId}|${this.pendingFocusItemId}`;
    if (key === this.snapshotKey) {
      return this.snapshot;
    }
    this.snapshotKey = key;
    const ids = flat.slice(start, end);
    const extra = [this.focusedItemId, this.draggedItemId, this.pendingFocusItemId]
      .map((id) => (id == null ? -1 : this.getFlatIndex(id)))
      .filter((index) => index !== -1 && (index < start || index >= end));
    let renderedIds: TreeViewItemId[] = ids;
    if (extra.length > 0) {
      const indexes = new Set<number>(extra);
      for (let i = start; i < end; i += 1) {
        indexes.add(i);
      }
      renderedIds = [...indexes].sort((a, b) => a - b).map((index) => flat[index]!);
    }
    this.snapshot = { renderedIds, totalHeight: flat.length * this.itemHeight };
    return this.snapshot;
  };

  /**
   * Row snapshot of an item: `"top:level:posinset:setsize"` (top offset in px), or `""` when it
   * is not part of the flat list.
   */
  getRowSnapshot(itemId: TreeViewItemId): string {
    if (!this.enabled) {
      return '';
    }
    const index = this.getFlatIndex(itemId);
    const entry = this.structure.getEntry(itemId);
    if (index === -1 || !entry) {
      return '';
    }
    const setSize = this.structure.getChildrenIds(entry.parentId).length;
    return `${index * this.itemHeight}:${entry.depth + 1}:${entry.index + 1}:${setSize}`;
  }

  setScrollTop(scrollTop: number): void {
    if (scrollTop === this.scrollTop) {
      return;
    }
    this.scrollTop = scrollTop;
    this.notifyIfChanged();
  }

  setViewportHeight(height: number): void {
    if (height === this.viewportHeight) {
      return;
    }
    this.viewportHeight = height;
    this.notifyIfChanged();
  }

  setMeasuredItemHeight(height: number): void {
    if (this.explicitItemHeight != null || height <= 0 || height === this.measuredItemHeight) {
      return;
    }
    this.measuredItemHeight = height;
    this.refresh();
  }

  setDraggedItem(itemId: TreeViewItemId | null): void {
    this.draggedItemId = itemId;
    this.notifyIfChanged();
  }

  /**
   * Called from `onItemFocus`: keeps the focused row mounted and scrolls it into view. Returns
   * `true` when the row was not rendered, in which case the row focuses its DOM element once it
   * mounts (see `consumePendingFocus`).
   */
  handleItemFocus(itemId: TreeViewItemId, isRendered: boolean): void {
    if (!this.enabled) {
      return;
    }
    this.focusedItemId = itemId;
    if (!isRendered) {
      this.pendingFocusItemId = itemId;
    }
    this.scrollIntoView(itemId);
    this.notifyIfChanged();
  }

  consumePendingFocus(itemId: TreeViewItemId): boolean {
    if (this.pendingFocusItemId !== itemId) {
      return false;
    }
    this.pendingFocusItemId = null;
    return true;
  }

  scrollIntoView(itemId: TreeViewItemId): void {
    const index = this.getFlatIndex(itemId);
    if (index === -1) {
      return;
    }
    const height = this.itemHeight;
    const viewport =
      this.viewportHeight > 0 ? this.viewportHeight : FALLBACK_VIEWPORT_ROWS * height;
    const top = index * height;
    let next = this.scrollTop;
    if (top < this.scrollTop) {
      next = top;
    } else if (top + height > this.scrollTop + viewport) {
      next = top + height - viewport;
    }
    if (next !== this.scrollTop) {
      if (this.scrollElement) {
        this.scrollElement.scrollTop = next;
      }
      this.scrollTop = next;
    }
  }

  /** Notifies the root and the rows rendered before or after the change. */
  private notifyIfChanged(): void {
    if (!this.enabled) {
      return;
    }
    const previous = this.snapshot;
    const next = this.getRootSnapshot();
    if (previous === next) {
      return;
    }
    this.emitter.emit([...previous.renderedIds, ...next.renderedIds]);
  }

  /** Structure, expansion or row height changed: row positions may all have shifted. */
  refresh(): void {
    this.notifyIfChanged();
  }
}
