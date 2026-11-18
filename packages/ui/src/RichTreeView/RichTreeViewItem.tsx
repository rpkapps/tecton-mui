'use client';
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import { mergeSlotProps, useKeyedSnapshot } from './features/core/hooks.js';
import { ReorderOverlaySlot } from './features/reordering/components.js';
import {
  LazyChildrenPlaceholder,
  TreeItemLazyErrorIcon,
  TreeItemLazyLoadingIcon,
} from './features/lazy-loading/components.js';
import { useRichTreeViewEnhancedContext } from './RichTreeViewContext.js';

const hasChildren = (children: React.ReactNode): boolean =>
  Array.isArray(children) ? children.some(hasChildren) : Boolean(children);

/**
 * Item slot used by the Tecton `RichTreeView` when an advanced feature is enabled. It renders
 * the consumer item (`slots.item`, `TreeItem` by default) and only adds props through the
 * public `TreeItem` API (slots, slot props, event handlers, style), so Tecton styles and
 * Community behaviors are preserved.
 */
export const RichTreeViewEnhancedItem = React.forwardRef(function RichTreeViewEnhancedItem(
  props: TreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const context = useRichTreeViewEnhancedContext();
  const { itemId, children, slots, slotProps, onKeyDown, style, ...other } = props;
  const { reordering, lazyLoading, virtualization, ItemComponent: Item } = context;

  const lazyState = useKeyedSnapshot(lazyLoading.emitter, itemId, () =>
    lazyLoading.getItemState(itemId),
  );
  const isDragged = useKeyedSnapshot(reordering.emitter, itemId, () =>
    reordering.isDragged(itemId),
  );
  const row = useKeyedSnapshot(virtualization.emitter, itemId, () =>
    virtualization.getRowSnapshot(itemId),
  );

  const reorderable = context.reorderingEnabled && reordering.isReorderable(itemId);
  const isLazyPending =
    lazyState === 'unloaded' || lazyState === 'loading' || lazyState === 'error';

  const contentHandlers = React.useMemo(
    () => ({
      onDragStart: (event: React.DragEvent<HTMLElement>) =>
        reordering.handleDragStart(event, itemId),
      onDragOver: (event: React.DragEvent<HTMLElement>) => reordering.handleDragOver(event, itemId),
      onDragLeave: (event: React.DragEvent<HTMLElement>) =>
        reordering.handleDragLeave(event, itemId),
      onDrop: (event: React.DragEvent<HTMLElement>) => reordering.handleDrop(event),
      onDragEnd: () => reordering.handleDragEnd(),
    }),
    [reordering, itemId],
  );

  const itemSlots = React.useMemo(() => {
    if (!context.reorderingEnabled && !isLazyPending) {
      return slots;
    }
    const result: Record<string, unknown> = { ...slots };
    if (context.reorderingEnabled) {
      result.dragAndDropOverlay = ReorderOverlaySlot;
    }
    if (lazyState === 'loading') {
      result.icon = slots?.loadingIcon ?? TreeItemLazyLoadingIcon;
    } else if (lazyState === 'error') {
      result.icon = slots?.errorIcon ?? TreeItemLazyErrorIcon;
    }
    return result;
  }, [slots, context.reorderingEnabled, isLazyPending, lazyState]);

  const itemSlotProps = React.useMemo(() => {
    if (!context.reorderingEnabled && !isLazyPending) {
      return slotProps;
    }
    const result: Record<string, unknown> = { ...slotProps };
    const contentExtra: Record<string, unknown> = {};
    if (context.reorderingEnabled) {
      Object.assign(contentExtra, contentHandlers, { draggable: reorderable });
      if (isDragged) {
        contentExtra['data-dragging'] = '';
      }
      result.dragAndDropOverlay = {
        ...(slotProps?.dragAndDropOverlay as object | undefined),
        reorderingEngine: reordering,
        ownerItemId: itemId,
        overlayComponent: slots?.dragAndDropOverlay,
      };
    }
    if (lazyState === 'loading') {
      contentExtra['data-loading'] = '';
    } else if (lazyState === 'error') {
      contentExtra['data-error'] = '';
    }
    result.content = mergeSlotProps(
      slotProps?.content as Parameters<typeof mergeSlotProps>[0],
      contentExtra,
    );
    return result;
  }, [
    slotProps,
    slots,
    context.reorderingEnabled,
    contentHandlers,
    reorderable,
    isDragged,
    reordering,
    itemId,
    isLazyPending,
    lazyState,
  ]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement> & { defaultMuiPrevented?: boolean },
  ) => {
    onKeyDown?.(event);
    if (event.defaultMuiPrevented) {
      return;
    }
    if (context.reorderingEnabled && reordering.handleKeyDown(event, itemId)) {
      event.defaultMuiPrevented = true;
      return;
    }
    // Items whose children are not loaded are not expandable for the Community keyboard
    // navigation: open them explicitly so the data source is queried.
    const openKey = context.isRtl ? 'ArrowLeft' : 'ArrowRight';
    if (
      isLazyPending &&
      lazyState !== 'loading' &&
      event.target === event.currentTarget &&
      (event.key === openKey || event.key === 'Enter') &&
      !event.altKey &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !context.expansion.isExpanded(itemId)
    ) {
      event.preventDefault();
      event.defaultMuiPrevented = true;
      context.setItemExpansion(itemId, event);
    }
  };

  // Virtualized rows are positioned absolutely and expose their position in the hierarchy
  // (the flat DOM no longer conveys it).
  let rowProps: Record<string, unknown> = {};
  let rowStyle = style;
  if (context.virtualizationEnabled && row !== '') {
    const [top, level, posInSet, setSize] = row.split(':').map(Number) as [
      number,
      number,
      number,
      number,
    ];
    rowStyle = {
      ...style,
      position: 'absolute',
      top,
      left: 0,
      right: 0,
    };
    rowProps = { 'aria-level': level, 'aria-posinset': posInSet, 'aria-setsize': setSize };
  }

  useEnhancedEffect(() => {
    if (context.virtualizationEnabled && virtualization.consumePendingFocus(itemId)) {
      context.getItemDOMElement(itemId)?.focus();
    }
  }, [context, virtualization, itemId]);

  let renderedChildren = children;
  if (isLazyPending && !hasChildren(children)) {
    renderedChildren = (
      <LazyChildrenPlaceholder
        state={lazyState}
        depth={(context.structure.getEntry(itemId)?.depth ?? 0) + 1}
        rowsCount={lazyLoading.getLoadingRowsCount(itemId)}
        showRows={context.isNested}
        itemLoaderSlot={context.itemLoaderSlot}
        itemLoaderSlotProps={context.render.itemLoaderSlotProps}
      />
    );
  }

  const describedBy =
    reorderable && context.instructionsId
      ? [other['aria-describedby'], context.instructionsId].filter(Boolean).join(' ')
      : other['aria-describedby'];

  return (
    <Item
      ref={ref}
      {...other}
      {...rowProps}
      {...(describedBy ? { 'aria-describedby': describedBy } : {})}
      {...(lazyState === 'loading' ? { 'aria-busy': true } : {})}
      itemId={itemId}
      slots={itemSlots}
      slotProps={itemSlotProps}
      style={rowStyle}
      onKeyDown={handleKeyDown}
    >
      {renderedChildren}
    </Item>
  );
});
