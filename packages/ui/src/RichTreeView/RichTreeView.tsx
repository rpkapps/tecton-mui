'use client';
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useEventCallback from '@mui/utils/useEventCallback';
import useId from '@mui/utils/useId';
import { useRtl } from '@mui/system/RtlProvider';
import { RichTreeView as MuiRichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import type { TreeViewItemId } from '@mui/x-tree-view/models';
import { ExpansionTracker } from './features/core/ExpansionTracker.js';
import { useKeyedSnapshot, useShallowStable } from './features/core/hooks.js';
import { ROOT_KEY, TreeStructureStore } from './features/core/TreeStructureStore.js';
import {
  LazyLoadingEngine,
  type LazyLoadingApi,
} from './features/lazy-loading/LazyLoadingEngine.js';
import { TreeViewDataSourceCacheDefault } from './features/lazy-loading/TreeViewDataSourceCacheDefault.js';
import { ReorderingLiveRegion } from './features/reordering/components.js';
import { indentationToPx } from './features/reordering/dropAction.js';
import { ReorderingEngine, type ReorderingApi } from './features/reordering/ReorderingEngine.js';
import { DEFAULT_REORDERING_LOCALE_TEXT } from './features/reordering/types.js';
import { VirtualRoot } from './features/virtualization/VirtualRoot.js';
import {
  DEFAULT_VIRTUALIZATION_ITEM_HEIGHT,
  VirtualizationStore,
} from './features/virtualization/VirtualizationStore.js';
import {
  RichTreeViewEnhancedContext,
  type RichTreeViewEngines,
  type RichTreeViewEnhancedContextValue,
} from './RichTreeViewContext.js';
import { RichTreeViewEnhancedItem } from './RichTreeViewItem.js';
import type { RichTreeViewProps, RichTreeViewPublicAPI } from './RichTreeView.types.js';

const EMPTY_ITEMS: readonly never[] = Object.freeze([]);

type AnyApi = Partial<RichTreeViewPublicAPI>;
type EngineApi = ReorderingApi & LazyLoadingApi<unknown>;

interface Engines extends RichTreeViewEngines {
  innerApiRef: { current: AnyApi | undefined };
  defaultCache: TreeViewDataSourceCacheDefault;
  getPublicApi: (base: AnyApi) => AnyApi;
  getItemDOMElement: (itemId: TreeViewItemId) => HTMLElement | null;
  setItemExpansion: (itemId: TreeViewItemId, event: React.SyntheticEvent) => void;
}

function createEngines(): Engines {
  const innerApiRef: Engines['innerApiRef'] = { current: undefined };
  const getApi = () => innerApiRef.current as unknown as EngineApi | undefined;
  const structure = new TreeStructureStore<unknown>();
  const expansion = new ExpansionTracker();
  const virtualization = new VirtualizationStore(structure, expansion);
  const reordering = new ReorderingEngine(structure, getApi, (itemId) =>
    virtualization.setDraggedItem(itemId),
  );
  const lazyLoading = new LazyLoadingEngine(structure, expansion, getApi);
  let cachedBase: AnyApi | undefined;
  let cachedPublicApi: AnyApi | undefined;
  return {
    structure,
    expansion,
    reordering,
    lazyLoading,
    virtualization,
    render: {},
    innerApiRef,
    defaultCache: new TreeViewDataSourceCacheDefault(),
    getPublicApi: (base) => {
      if (base !== cachedBase || !cachedPublicApi) {
        cachedBase = base;
        cachedPublicApi = {
          ...base,
          ...(base.addItems
            ? {
                addItems: (params: Parameters<NonNullable<AnyApi['addItems']>>[0]) => {
                  base.addItems!(params);
                  structure.insertChildren(params.parentId ?? null, params.items, params.index);
                },
              }
            : {}),
          updateItemChildren: (itemId: TreeViewItemId | null) =>
            lazyLoading.updateItemChildren(itemId),
        };
      }
      return cachedPublicApi;
    },
    getItemDOMElement: (itemId) => innerApiRef.current?.getItemDOMElement?.(itemId) ?? null,
    setItemExpansion: (itemId, event) =>
      innerApiRef.current?.setItemExpansion?.({ itemId, event, shouldBeExpanded: true }),
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- mirrors the Community signature
type RichTreeViewComponent = (<R extends {}, Multiple extends boolean | undefined = undefined>(
  props: RichTreeViewProps<R, Multiple> & React.RefAttributes<HTMLUListElement>,
) => React.JSX.Element) & { propTypes?: unknown; displayName?: string | undefined };

/**
 * Tecton `RichTreeView`: the MUI X Community `RichTreeView` plus independently implemented
 * advanced features (items reordering, lazy loading, virtualization), each activated by its
 * own props. Without advanced props it renders the Community component with the same props.
 */
const RichTreeViewImpl = React.forwardRef(function RichTreeView(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generics restored by RichTreeViewComponent
  props: RichTreeViewProps<any, any>,
  ref: React.Ref<HTMLUListElement>,
) {
  const {
    itemsReordering,
    isItemReorderable,
    canMoveItemToNewPosition,
    onItemPositionChange,
    itemsReorderingLocaleText,
    dataSource,
    dataSourceCache,
    onDataSourceError,
    virtualization: virtualizationProp,
    disableVirtualization,
    ...muiProps
  } = props;
  const [engines] = React.useState(createEngines);
  const isRtl = useRtl();
  const instructionsId = `${useId()}-reordering-instructions`;

  const reorderingEnabled = Boolean(itemsReordering);
  const lazyLoadingEnabled = dataSource != null;
  const virtualizationEnabled =
    Boolean(virtualizationProp) && !disableVirtualization && muiProps.itemHeight !== null;
  const active = reorderingEnabled || lazyLoadingEnabled || virtualizationEnabled;
  const structural = reorderingEnabled || lazyLoadingEnabled;
  const isNested = !virtualizationEnabled && muiProps.domStructure !== 'flat';

  if (process.env.NODE_ENV !== 'production' && virtualizationProp && muiProps.itemHeight === null) {
    console.warn(
      'Tecton RichTreeView: `virtualization` requires a fixed `itemHeight`; it is disabled because `itemHeight` is `null`.',
    );
  }

  // --- Engines configuration (latest props, read by the engines at event time) -------------
  engines.structure.configure(
    {
      items: muiProps.items ?? EMPTY_ITEMS,
      getItemId: muiProps.getItemId,
      getItemChildren: muiProps.getItemChildren,
      getItemLabel: muiProps.getItemLabel,
    },
    lazyLoadingEnabled,
  );
  engines.expansion.initialize(muiProps.expandedItems ?? muiProps.defaultExpandedItems);
  const localeText = React.useMemo(
    () => ({ ...DEFAULT_REORDERING_LOCALE_TEXT, ...itemsReorderingLocaleText }),
    [itemsReorderingLocaleText],
  );
  engines.reordering.config = {
    enabled: reorderingEnabled,
    isItemReorderable,
    canMoveItemToNewPosition,
    onItemPositionChange,
    canItemReceiveChildren: lazyLoadingEnabled ? engines.lazyLoading.canReceiveChildren : undefined,
    indentation: indentationToPx(muiProps.itemChildrenIndentation),
    isRtl,
    localeText,
  };
  engines.lazyLoading.config = {
    dataSource,
    cache: dataSourceCache === undefined ? engines.defaultCache : dataSourceCache,
    onError: onDataSourceError,
  };
  engines.virtualization.enabled = virtualizationEnabled;
  engines.virtualization.explicitItemHeight =
    typeof muiProps.itemHeight === 'number' ? muiProps.itemHeight : null;
  engines.render.itemLoaderSlotProps = muiProps.slotProps?.itemLoader;

  const communityItems = React.useSyncExternalStore(
    engines.structure.subscribe,
    engines.structure.getCommunityItems,
    engines.structure.getCommunityItems,
  );
  const isRootLoading = useKeyedSnapshot(engines.lazyLoading.emitter, ROOT_KEY, () =>
    engines.lazyLoading.isRootPending(),
  );

  // --- Effects ------------------------------------------------------------------------------
  useEnhancedEffect(() => {
    engines.structure.flush();
  });
  const controlledExpandedItems = muiProps.expandedItems;
  useEnhancedEffect(() => {
    if (controlledExpandedItems !== undefined) {
      engines.expansion.set(controlledExpandedItems);
    }
  }, [engines, controlledExpandedItems]);
  React.useEffect(() => {
    engines.lazyLoading.mount();
    return () => engines.lazyLoading.unmount();
  }, [engines, lazyLoadingEnabled]);
  React.useEffect(() => () => engines.reordering.dispose(), [engines]);

  const { apiRef } = muiProps;
  useEnhancedEffect(() => {
    const base = engines.innerApiRef.current;
    if (active && apiRef && base) {
      apiRef.current = engines.getPublicApi(base);
    }
  });

  // --- Wrapped callbacks --------------------------------------------------------------------
  const { onExpandedItemsChange, onItemFocus } = muiProps;
  const handleExpandedItemsChange = useEventCallback(
    (event: React.SyntheticEvent | null, itemIds: TreeViewItemId[]) => {
      if (controlledExpandedItems === undefined) {
        engines.expansion.set(itemIds);
      }
      onExpandedItemsChange?.(event, itemIds);
    },
  );
  const handleItemFocus = useEventCallback(
    (event: React.SyntheticEvent | null, itemId: TreeViewItemId) => {
      engines.virtualization.handleItemFocus(itemId, engines.getItemDOMElement(itemId) != null);
      onItemFocus?.(event, itemId);
    },
  );

  // --- Slots (memoized: the Community component remounts items when `slots.item` changes) --
  const stableSlots = useShallowStable(muiProps.slots);
  const enhancedSlots = React.useMemo(
    () => ({
      ...stableSlots,
      item: RichTreeViewEnhancedItem,
      ...(virtualizationEnabled ? { root: VirtualRoot } : {}),
    }),
    [stableSlots, virtualizationEnabled],
  );

  const contextValue = React.useMemo<RichTreeViewEnhancedContextValue>(
    () => ({
      ...engines,
      ItemComponent: (stableSlots?.item as React.ElementType | undefined) ?? TreeItem,
      RootComponent: stableSlots?.root,
      itemLoaderSlot: stableSlots?.itemLoader,
      reorderingEnabled,
      lazyLoadingEnabled,
      virtualizationEnabled,
      isNested,
      isRtl,
      instructionsId: reorderingEnabled ? instructionsId : undefined,
    }),
    [
      engines,
      stableSlots,
      reorderingEnabled,
      lazyLoadingEnabled,
      virtualizationEnabled,
      isNested,
      isRtl,
      instructionsId,
    ],
  );

  const enhancedProps: Record<string, unknown> = active
    ? {
        slots: enhancedSlots,
        apiRef: engines.innerApiRef,
        onExpandedItemsChange: handleExpandedItemsChange,
      }
    : {};
  if (structural) {
    enhancedProps.items = communityItems;
    enhancedProps.getItemChildren = engines.structure.getChildrenForCommunity;
  }
  if (lazyLoadingEnabled) {
    enhancedProps.loading = Boolean(muiProps.loading) || isRootLoading;
  }
  if (virtualizationEnabled) {
    enhancedProps.onItemFocus = handleItemFocus;
    enhancedProps.domStructure = 'flat';
    enhancedProps.itemHeight = muiProps.itemHeight ?? DEFAULT_VIRTUALIZATION_ITEM_HEIGHT;
  }

  return (
    <RichTreeViewEnhancedContext.Provider value={contextValue}>
      <MuiRichTreeView ref={ref} {...muiProps} {...enhancedProps} />
      {reorderingEnabled ? (
        <ReorderingLiveRegion
          engine={engines.reordering}
          instructionsId={instructionsId}
          instructions={localeText.keyboardInstructions}
        />
      ) : null}
    </RichTreeViewEnhancedContext.Provider>
  );
});

if (process.env.NODE_ENV !== 'production') {
  RichTreeViewImpl.displayName = 'RichTreeView';
}

export const RichTreeView = RichTreeViewImpl as unknown as RichTreeViewComponent;

export default RichTreeView;
