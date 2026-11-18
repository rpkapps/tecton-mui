'use client';
import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { RichTreeViewRoot } from '@mui/x-tree-view/RichTreeView';
import { useGlobalSnapshot } from '../core/hooks.js';
import { useRichTreeViewEnhancedContext } from '../../RichTreeViewContext.js';

const sizerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  visibility: 'hidden',
  pointerEvents: 'none',
};

/**
 * `root` slot used when virtualization is enabled. The Community component renders every
 * visible item of the flat list as a child of the root; this slot only mounts the children
 * intersecting the viewport (plus the focused/dragged rows), positions them absolutely and adds
 * a sizer so the scroll height matches the full list.
 */
export const VirtualRoot = React.forwardRef(function VirtualRoot(
  props: React.HTMLAttributes<HTMLUListElement> & { sx?: unknown; children?: React.ReactNode },
  forwardedRef: React.Ref<HTMLUListElement>,
) {
  const { children, style, onScroll, sx, ...other } = props;
  const context = useRichTreeViewEnhancedContext();
  const store = context.virtualization;
  const Root = (context.RootComponent ?? RichTreeViewRoot) as React.ElementType;
  const snapshot = useGlobalSnapshot(store.emitter, store.getRootSnapshot);
  const elementRef = React.useRef<HTMLUListElement | null>(null);
  const handleRef = useForkRef(forwardedRef, elementRef);

  // The loading state renders loader rows instead of items: keep them untouched.
  const isLoadingState = Boolean(other['aria-busy']);

  const elementsById = React.useMemo(() => {
    const map = new Map<string, React.ReactElement>();
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.key != null) {
        map.set(String(child.key), child);
      }
    });
    return map;
  }, [children]);

  const rendered: React.ReactNode[] = [];
  if (!isLoadingState) {
    for (const id of snapshot.renderedIds) {
      const element = elementsById.get(id);
      if (element) {
        rendered.push(element);
      }
    }
  }

  useEnhancedEffect(() => {
    const element = elementRef.current;
    store.scrollElement = element;
    if (!element) {
      return undefined;
    }
    store.setViewportHeight(element.clientHeight);
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      store.setViewportHeight(element.clientHeight);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (store.scrollElement === element) {
        store.scrollElement = null;
      }
    };
  }, [store]);

  // Measure the row height when `itemHeight` is not provided (themes may enforce a min height).
  useEnhancedEffect(() => {
    if (store.explicitItemHeight != null) {
      return;
    }
    const row = elementRef.current?.querySelector<HTMLElement>(':scope > [role="treeitem"]');
    const content = row?.firstElementChild as HTMLElement | null | undefined;
    const height = content?.offsetHeight ?? 0;
    if (height > 0) {
      store.setMeasuredItemHeight(height);
    }
  });

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    onScroll?.(event);
    store.setScrollTop(event.currentTarget.scrollTop);
  };

  const sxProps =
    Root === RichTreeViewRoot
      ? { sx: [{ height: '100%' }, ...(Array.isArray(sx) ? sx : sx == null ? [] : [sx])] }
      : sx === undefined
        ? {}
        : { sx };

  return (
    <Root
      {...other}
      {...sxProps}
      ref={handleRef}
      onScroll={handleScroll}
      style={{ ...style, position: 'relative', overflowY: 'auto' }}
      data-tecton-tree-virtualized=""
    >
      {isLoadingState ? children : rendered}
      {isLoadingState ? null : (
        <li
          role="none"
          aria-hidden="true"
          data-tecton-tree-virtual-sizer=""
          style={{ ...sizerStyle, height: snapshot.totalHeight }}
        />
      )}
    </Root>
  );
});
