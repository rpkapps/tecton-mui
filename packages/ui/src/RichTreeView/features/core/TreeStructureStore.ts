import type { TreeViewItemId } from '@mui/x-tree-view/models';
import { KeyedEmitter } from './KeyedEmitter.js';

/** Map key used for the root level (never a valid item id coming from consumers). */
export const ROOT_KEY = '\u0000tecton-tree-root';

export type ParentId = TreeViewItemId | null;

export interface TreeStructureConfig<R> {
  items: readonly R[];
  getItemId?: ((item: R) => TreeViewItemId) | undefined;
  getItemChildren?: ((item: R) => R[] | undefined) | undefined;
  getItemLabel?: ((item: R) => string) | undefined;
}

export interface TreeIndexEntry {
  id: TreeViewItemId;
  parentId: ParentId;
  depth: number;
  /** Index among its siblings. */
  index: number;
}

const EMPTY: readonly never[] = Object.freeze([]);

export const toKey = (parentId: ParentId): string => (parentId == null ? ROOT_KEY : parentId);

/**
 * Independent structural model of the tree, shared by the advanced feature engines.
 *
 * It mirrors what the Community store renders: the consumer's `items` plus *children
 * overrides* (children fetched lazily or rearranged by reordering). The overrides are fed
 * back to the Community component through a stable `getItemChildren`, so the consumer's
 * item models are never mutated.
 *
 * `communityItems` only changes identity when the Community store must rebuild its items
 * state (initial items, reordering, refetches). Incremental lazy loads go through the public
 * `apiRef.addItems()` instead, so only the affected branch re-renders.
 */
export class TreeStructureStore<R> {
  readonly emitter = new KeyedEmitter();

  /** Increments whenever the structure changes. */
  version = 0;

  communityItems: readonly R[] = EMPTY;

  private config: TreeStructureConfig<R> = { items: EMPTY };

  private configured = false;

  private overrides = new Map<string, readonly R[]>();

  private entries = new Map<TreeViewItemId, TreeIndexEntry>();

  private models = new Map<TreeViewItemId, R>();

  private childrenIds = new Map<string, TreeViewItemId[]>();

  private indexDirty = true;

  private pendingEmit = false;

  subscribe = this.emitter.subscribe;

  getCommunityItems = (): readonly R[] => this.communityItems;

  getItemId = (item: R): TreeViewItemId =>
    this.config.getItemId
      ? this.config.getItemId(item)
      : (item as unknown as { id: TreeViewItemId }).id;

  getItemLabel = (item: R): string =>
    this.config.getItemLabel
      ? this.config.getItemLabel(item)
      : String((item as { label?: unknown }).label ?? '');

  /** Children of a model as declared by the consumer (ignores overrides). */
  getDeclaredChildren(item: R): readonly R[] {
    const children = this.config.getItemChildren
      ? this.config.getItemChildren(item)
      : (item as { children?: R[] }).children;
    return children ?? EMPTY;
  }

  /** Stable `getItemChildren` passed to the Community component. */
  getChildrenForCommunity = (item: R): R[] | undefined => {
    const override = this.overrides.get(this.getItemId(item));
    if (override) {
      return override as R[];
    }
    const declared = this.getDeclaredChildren(item);
    return declared.length > 0 ? (declared as R[]) : undefined;
  };

  /**
   * Synchronizes the consumer configuration. Called during render; it never emits
   * synchronously (call `flush()` from an effect).
   * @param itemsAreInitialState When `true` (data source mode) later `items` changes are
   * ignored and existing overrides are preserved.
   */
  configure(config: TreeStructureConfig<R>, itemsAreInitialState: boolean): void {
    const previous = this.config;
    if (
      this.configured &&
      previous.items === config.items &&
      previous.getItemId === config.getItemId &&
      previous.getItemChildren === config.getItemChildren &&
      previous.getItemLabel === config.getItemLabel
    ) {
      return;
    }
    const gettersChanged =
      previous.getItemId !== config.getItemId ||
      previous.getItemChildren !== config.getItemChildren;
    if (!this.configured || !itemsAreInitialState) {
      this.config = config;
      this.overrides = new Map();
      this.communityItems = config.items;
    } else {
      // Data source mode: keep the loaded/rearranged structure, refresh accessors only.
      this.config = { ...config, items: previous.items };
      if (gettersChanged) {
        this.communityItems = [...this.getChildren(null)];
      }
    }
    this.configured = true;
    this.invalidate();
    this.pendingEmit = true;
  }

  /** Emits a change deferred by `configure()`. */
  flush(): void {
    if (this.pendingEmit) {
      this.pendingEmit = false;
      this.emitter.emitAll();
    }
  }

  hasOverride(parentId: ParentId): boolean {
    return this.overrides.has(toKey(parentId));
  }

  /** Current children models of a parent (`null` = root). */
  getChildren(parentId: ParentId): readonly R[] {
    const override = this.overrides.get(toKey(parentId));
    if (override) {
      return override;
    }
    if (parentId == null) {
      return this.config.items;
    }
    const model = this.getModel(parentId);
    return model ? this.getDeclaredChildren(model) : EMPTY;
  }

  getChildrenIds(parentId: ParentId): readonly TreeViewItemId[] {
    this.ensureIndex();
    return this.childrenIds.get(toKey(parentId)) ?? EMPTY;
  }

  getEntry(itemId: TreeViewItemId): TreeIndexEntry | undefined {
    this.ensureIndex();
    return this.entries.get(itemId);
  }

  getModel(itemId: TreeViewItemId): R | undefined {
    this.ensureIndex();
    return this.models.get(itemId);
  }

  getItemCount(): number {
    this.ensureIndex();
    return this.entries.size;
  }

  /** `true` when `ancestorId` is `itemId` or one of its ancestors. */
  isSelfOrAncestor(ancestorId: TreeViewItemId, itemId: ParentId): boolean {
    let current: ParentId = itemId;
    while (current != null) {
      if (current === ancestorId) {
        return true;
      }
      current = this.getEntry(current)?.parentId ?? null;
    }
    return false;
  }

  /**
   * Replaces the children of a parent.
   * @param rebuild `true` when the Community store must rebuild its items state; `false` when
   * the caller already applied the change incrementally (e.g. with `apiRef.addItems()`).
   */
  setChildren(parentId: ParentId, children: readonly R[], rebuild: boolean): void {
    const hadChildren = this.getChildrenIds(parentId).length > 0;
    this.overrides.set(toKey(parentId), children);
    if (!rebuild && !hadChildren && !this.indexDirty) {
      this.indexSubtree(parentId, children);
    } else {
      this.invalidate();
    }
    this.commit(rebuild);
  }

  /** Inserts children at an index (mirrors the Community `addItems()` API method). */
  insertChildren(parentId: ParentId, items: readonly R[], index?: number): void {
    const current = [...this.getChildren(parentId)];
    current.splice(index ?? current.length, 0, ...items);
    this.overrides.set(toKey(parentId), current);
    this.invalidate();
    this.commit(false);
  }

  /** Moves an item to a new position; `newIndex` is the final index in the new parent. */
  moveItem(itemId: TreeViewItemId, newParentId: ParentId, newIndex: number): void {
    const entry = this.getEntry(itemId);
    const model = this.getModel(itemId);
    if (!entry || !model) {
      return;
    }
    const oldSiblings = this.getChildren(entry.parentId).filter((item) => item !== model);
    this.overrides.set(toKey(entry.parentId), oldSiblings);
    const newSiblings = [...this.getChildren(newParentId)];
    newSiblings.splice(Math.min(Math.max(newIndex, 0), newSiblings.length), 0, model);
    this.overrides.set(toKey(newParentId), newSiblings);
    this.invalidate();
    this.commit(true);
  }

  /** Drops every override (keeps the configured items). */
  clearOverrides(): void {
    this.overrides = new Map();
    this.invalidate();
    this.commit(true);
  }

  private commit(rebuild: boolean): void {
    this.version += 1;
    if (rebuild) {
      this.communityItems = [...this.getChildren(null)];
    }
    this.emitter.emitAll();
  }

  private invalidate(): void {
    this.indexDirty = true;
    this.version += 1;
  }

  private ensureIndex(): void {
    if (!this.indexDirty) {
      return;
    }
    this.indexDirty = false;
    this.entries = new Map();
    this.models = new Map();
    this.childrenIds = new Map();
    const rootChildren = this.overrides.get(ROOT_KEY) ?? this.config.items;
    this.indexSubtree(null, rootChildren);
  }

  private indexSubtree(parentId: ParentId, children: readonly R[]): void {
    const depth = parentId == null ? 0 : (this.entries.get(parentId)?.depth ?? -1) + 1;
    const stack: Array<{ parentId: ParentId; children: readonly R[]; depth: number }> = [
      { parentId, children, depth },
    ];
    while (stack.length > 0) {
      const level = stack.pop()!;
      const ids: TreeViewItemId[] = [];
      level.children.forEach((child, index) => {
        const id = this.getItemId(child);
        ids.push(id);
        this.entries.set(id, { id, parentId: level.parentId, depth: level.depth, index });
        this.models.set(id, child);
        const grandChildren = this.overrides.get(id) ?? this.getDeclaredChildren(child);
        if (grandChildren.length > 0) {
          stack.push({ parentId: id, children: grandChildren, depth: level.depth + 1 });
        }
      });
      this.childrenIds.set(toKey(level.parentId), ids);
    }
  }
}
