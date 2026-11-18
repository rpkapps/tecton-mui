import type * as React from 'react';
import type { TreeViewItemId, TreeViewItemsReorderingAction } from '@mui/x-tree-view/models';
import { KeyedEmitter } from '../core/KeyedEmitter.js';
import type { ParentId, TreeStructureStore } from '../core/TreeStructureStore.js';
import { getDropAction } from './dropAction.js';
import {
  DEFAULT_REORDERING_LOCALE_TEXT,
  type RichTreeViewReorderingLocaleText,
  type TreeViewItemPositionChangeParams,
  type TreeViewItemReorderPosition,
  type TreeViewItemReorderSource,
} from './types.js';

/** Minimal subset of the Community public API used by the engine. */
export interface ReorderingApi {
  isItemExpanded?: (itemId: TreeViewItemId) => boolean;
  setItemExpansion?: (params: { itemId: TreeViewItemId; shouldBeExpanded?: boolean }) => void;
  focusItem?: (event: React.SyntheticEvent | null, itemId: TreeViewItemId) => void;
}

export interface ReorderingConfig {
  enabled: boolean;
  isItemReorderable?: ((itemId: TreeViewItemId) => boolean) | undefined;
  canMoveItemToNewPosition?: ((params: TreeViewItemPositionChangeParams) => boolean) | undefined;
  onItemPositionChange?: ((params: TreeViewItemPositionChangeParams) => void) | undefined;
  /** Whether a parent may receive new children (e.g. `false` for unloaded lazy items). */
  canItemReceiveChildren?: ((itemId: TreeViewItemId) => boolean) | undefined;
  indentation: number;
  isRtl: boolean;
  localeText: RichTreeViewReorderingLocaleText;
}

interface DropTarget {
  itemId: TreeViewItemId;
  action: TreeViewItemsReorderingAction;
  position: TreeViewItemReorderPosition;
}

/**
 * Drag-and-drop and keyboard reordering engine.
 *
 * Drag state lives in this external store; each item's overlay subscribes to its own key, so
 * a pointer move only re-renders the overlay of the previous and the new drop target.
 */
export class ReorderingEngine<R> {
  readonly emitter = new KeyedEmitter();

  /** Live region messages. */
  readonly announcer = new KeyedEmitter();

  announcement = { id: 0, message: '' };

  config: ReorderingConfig = {
    enabled: false,
    indentation: 12,
    isRtl: false,
    localeText: DEFAULT_REORDERING_LOCALE_TEXT,
  };

  draggedItemId: TreeViewItemId | null = null;

  private target: DropTarget | null = null;

  /** Memoizes the resolution of the last hovered (item, action) pair. */
  private lastResolution: { key: string; position: TreeViewItemReorderPosition | null } | null =
    null;

  private focusTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly structure: TreeStructureStore<R>,
    private readonly getApi: () => ReorderingApi | undefined,
    private readonly onDragStateChange?: (draggedItemId: TreeViewItemId | null) => void,
  ) {}

  dispose(): void {
    clearTimeout(this.focusTimeout);
  }

  isReorderable(itemId: TreeViewItemId): boolean {
    if (!this.config.enabled) {
      return false;
    }
    return this.config.isItemReorderable ? this.config.isItemReorderable(itemId) : true;
  }

  getAction(itemId: TreeViewItemId): TreeViewItemsReorderingAction | null {
    return this.target?.itemId === itemId ? this.target.action : null;
  }

  isDragged(itemId: TreeViewItemId): boolean {
    return this.draggedItemId === itemId;
  }

  getPosition(itemId: TreeViewItemId): TreeViewItemReorderPosition | null {
    const entry = this.structure.getEntry(itemId);
    return entry ? { parentId: entry.parentId, index: entry.index } : null;
  }

  /**
   * Computes the position the dragged item would get, or `null` when the move is not allowed
   * (no-op, into itself/its descendants, rejected by `canMoveItemToNewPosition`...).
   */
  resolvePosition(
    itemId: TreeViewItemId,
    targetId: TreeViewItemId,
    action: TreeViewItemsReorderingAction,
  ): TreeViewItemReorderPosition | null {
    const target = this.structure.getEntry(targetId);
    if (!target) {
      return null;
    }
    let parentId: ParentId;
    let insertionIndex: number;
    switch (action) {
      case 'make-child':
        parentId = targetId;
        insertionIndex = this.structure.getChildrenIds(targetId).length;
        break;
      case 'reorder-above':
        parentId = target.parentId;
        insertionIndex = target.index;
        break;
      case 'move-to-parent': {
        const parent =
          target.parentId == null ? undefined : this.structure.getEntry(target.parentId);
        if (!parent) {
          return null;
        }
        parentId = parent.parentId;
        insertionIndex = parent.index + 1;
        break;
      }
      default: {
        // 'reorder-below': below an expanded parent means "first child".
        const isExpandedParent =
          this.structure.getChildrenIds(targetId).length > 0 &&
          (this.getApi()?.isItemExpanded?.(targetId) ?? false);
        if (isExpandedParent) {
          parentId = targetId;
          insertionIndex = 0;
        } else {
          parentId = target.parentId;
          insertionIndex = target.index + 1;
        }
      }
    }
    return this.finalizePosition(itemId, parentId, insertionIndex);
  }

  /** Validates a move expressed as an insertion index (index before removing the item). */
  finalizePosition(
    itemId: TreeViewItemId,
    parentId: ParentId,
    insertionIndex: number,
  ): TreeViewItemReorderPosition | null {
    const current = this.getPosition(itemId);
    if (!current) {
      return null;
    }
    if (parentId != null && this.structure.isSelfOrAncestor(itemId, parentId)) {
      return null;
    }
    if (
      parentId != null &&
      parentId !== current.parentId &&
      this.config.canItemReceiveChildren &&
      !this.config.canItemReceiveChildren(parentId)
    ) {
      return null;
    }
    let index = insertionIndex;
    if (parentId === current.parentId && current.index < insertionIndex) {
      index -= 1;
    }
    if (parentId === current.parentId && index === current.index) {
      return null;
    }
    const newPosition = { parentId, index };
    if (
      this.config.canMoveItemToNewPosition &&
      !this.config.canMoveItemToNewPosition({ itemId, oldPosition: current, newPosition })
    ) {
      return null;
    }
    return newPosition;
  }

  /** Applies a validated move, notifies the consumer and announces it. */
  move(
    itemId: TreeViewItemId,
    newPosition: TreeViewItemReorderPosition,
    source: TreeViewItemReorderSource,
  ): void {
    const oldPosition = this.getPosition(itemId);
    if (!oldPosition) {
      return;
    }
    this.structure.moveItem(itemId, newPosition.parentId, newPosition.index);
    const params = { itemId, oldPosition, newPosition };
    this.config.onItemPositionChange?.(params);
    this.announceMove(params);
    if (source === 'keyboard') {
      this.restoreFocus(itemId, newPosition.parentId);
    }
  }

  private announceMove(params: TreeViewItemPositionChangeParams): void {
    const model = this.structure.getModel(params.itemId);
    const parentModel =
      params.newPosition.parentId == null
        ? undefined
        : this.structure.getModel(params.newPosition.parentId);
    this.announce(
      this.config.localeText.itemMoved({
        ...params,
        label: model ? this.structure.getItemLabel(model) : params.itemId,
        parentLabel: parentModel ? this.structure.getItemLabel(parentModel) : null,
        siblingsCount: this.structure.getChildrenIds(params.newPosition.parentId).length,
      }),
    );
  }

  announce(message: string): void {
    this.announcement = { id: this.announcement.id + 1, message };
    this.announcer.emit();
  }

  /** Keeps keyboard focus on the moved item (it may remount under its new parent). */
  private restoreFocus(itemId: TreeViewItemId, parentId: ParentId): void {
    const api = this.getApi();
    if (parentId != null && api?.isItemExpanded && !api.isItemExpanded(parentId)) {
      api.setItemExpansion?.({ itemId: parentId, shouldBeExpanded: true });
    }
    clearTimeout(this.focusTimeout);
    this.focusTimeout = setTimeout(() => {
      this.getApi()?.focusItem?.(null, itemId);
    }, 0);
  }

  // ---------------------------------------------------------------------------------------
  // Drag and drop (native HTML5 events on the item content element)
  // ---------------------------------------------------------------------------------------

  handleDragStart(event: React.DragEvent<HTMLElement>, itemId: TreeViewItemId): void {
    if (!this.isReorderable(itemId)) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    try {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox only starts a drag when some data is set.
      event.dataTransfer.setData('text/plain', itemId);
    } catch {
      // `dataTransfer` may be unavailable (synthetic events in tests).
    }
    this.draggedItemId = itemId;
    this.lastResolution = null;
    this.onDragStateChange?.(itemId);
    this.emitter.emit([itemId]);
  }

  handleDragOver(event: React.DragEvent<HTMLElement>, targetId: TreeViewItemId): void {
    const draggedId = this.draggedItemId;
    if (draggedId == null) {
      return;
    }
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const entry = this.structure.getEntry(targetId);
    const siblings = entry ? this.structure.getChildrenIds(entry.parentId) : [];
    const action = getDropAction({
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      depth: entry?.depth ?? 0,
      indentation: this.config.indentation,
      isRtl: this.config.isRtl,
      isLastChild: siblings[siblings.length - 1] === targetId,
      canReceiveChildren:
        targetId !== draggedId &&
        (this.config.canItemReceiveChildren ? this.config.canItemReceiveChildren(targetId) : true),
    });
    const key = `${targetId}\u0000${action}`;
    let position: TreeViewItemReorderPosition | null;
    if (this.lastResolution?.key === key) {
      position = this.lastResolution.position;
    } else {
      position = this.resolvePosition(draggedId, targetId, action);
      this.lastResolution = { key, position };
    }
    if (position == null) {
      this.setTarget(null);
      return;
    }
    event.preventDefault();
    try {
      event.dataTransfer.dropEffect = 'move';
    } catch {
      // see handleDragStart
    }
    this.setTarget({ itemId: targetId, action, position });
  }

  handleDragLeave(event: React.DragEvent<HTMLElement>, targetId: TreeViewItemId): void {
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) {
      return;
    }
    if (this.target?.itemId === targetId) {
      this.setTarget(null);
    }
  }

  handleDrop(event: React.DragEvent<HTMLElement>): void {
    const draggedId = this.draggedItemId;
    const target = this.target;
    if (draggedId == null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.endDrag();
    if (target) {
      this.move(draggedId, target.position, 'drag');
    }
  }

  handleDragEnd(): void {
    this.endDrag();
  }

  private endDrag(): void {
    const draggedId = this.draggedItemId;
    this.draggedItemId = null;
    this.lastResolution = null;
    const keys = draggedId == null ? [] : [draggedId];
    if (this.target) {
      keys.push(this.target.itemId);
      this.target = null;
    }
    this.onDragStateChange?.(null);
    this.emitter.emit(keys);
  }

  private setTarget(next: DropTarget | null): void {
    const previous = this.target;
    if (previous?.itemId === next?.itemId && previous?.action === next?.action) {
      this.target = next;
      return;
    }
    this.target = next;
    const keys: string[] = [];
    if (previous) {
      keys.push(previous.itemId);
    }
    if (next) {
      keys.push(next.itemId);
    }
    this.emitter.emit(keys);
  }

  // ---------------------------------------------------------------------------------------
  // Keyboard alternative: Alt+Shift+Arrow keys
  // ---------------------------------------------------------------------------------------

  /** Returns `true` when the event was handled as a keyboard move. */
  handleKeyDown(event: React.KeyboardEvent<HTMLElement>, itemId: TreeViewItemId): boolean {
    if (
      !this.config.enabled ||
      !event.altKey ||
      !event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target !== event.currentTarget
    ) {
      return false;
    }
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!keys.includes(event.key)) {
      return false;
    }
    event.preventDefault();
    const model = this.structure.getModel(itemId);
    const label = model ? this.structure.getItemLabel(model) : itemId;
    const position = this.isReorderable(itemId) ? this.getKeyboardTarget(event.key, itemId) : null;
    if (position) {
      this.move(itemId, position, 'keyboard');
    } else {
      this.announce(this.config.localeText.itemMoveNotAllowed(label));
    }
    return true;
  }

  private getKeyboardTarget(
    key: string,
    itemId: TreeViewItemId,
  ): TreeViewItemReorderPosition | null {
    const entry = this.structure.getEntry(itemId);
    if (!entry) {
      return null;
    }
    const siblings = this.structure.getChildrenIds(entry.parentId);
    const parent = entry.parentId == null ? undefined : this.structure.getEntry(entry.parentId);
    const indentKey = this.config.isRtl ? 'ArrowLeft' : 'ArrowRight';
    if (key === 'ArrowUp') {
      if (entry.index > 0) {
        return this.finalizePosition(itemId, entry.parentId, entry.index - 1);
      }
      return parent ? this.finalizePosition(itemId, parent.parentId, parent.index) : null;
    }
    if (key === 'ArrowDown') {
      if (entry.index < siblings.length - 1) {
        return this.finalizePosition(itemId, entry.parentId, entry.index + 2);
      }
      return parent ? this.finalizePosition(itemId, parent.parentId, parent.index + 1) : null;
    }
    if (key === indentKey) {
      const previousSiblingId = siblings[entry.index - 1];
      if (previousSiblingId == null) {
        return null;
      }
      return this.finalizePosition(
        itemId,
        previousSiblingId,
        this.structure.getChildrenIds(previousSiblingId).length,
      );
    }
    // Outdent
    return parent ? this.finalizePosition(itemId, parent.parentId, parent.index + 1) : null;
  }
}
