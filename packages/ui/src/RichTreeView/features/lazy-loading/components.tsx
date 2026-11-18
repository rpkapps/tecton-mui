'use client';
import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import { TreeItemLoader } from '@mui/x-tree-view/TreeItemLoader';
import type { TreeViewLazyItemState } from './types.js';

/** Spinner shown in the icon container while the children of an item load. */
export function TreeItemLazyLoadingIcon(props: { className?: string }) {
  return (
    <CircularProgress
      className={props.className}
      size={12}
      thickness={6}
      aria-hidden
      data-tecton-tree-loading-icon=""
    />
  );
}

/** Icon shown in the icon container when loading the children of an item failed. */
export function TreeItemLazyErrorIcon(props: SvgIconProps) {
  return (
    <SvgIcon color="error" fontSize="inherit" aria-hidden data-tecton-tree-error-icon="" {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="11" y="6.5" width="2" height="7" rx="1" />
      <rect x="11" y="15.5" width="2" height="2" rx="1" />
    </SvgIcon>
  );
}

export interface LazyChildrenPlaceholderProps {
  state: TreeViewLazyItemState;
  /** Depth of the loading rows (parent depth + 1). */
  depth: number;
  rowsCount: number;
  /** Render loading rows (nested DOM structure only). */
  showRows: boolean;
  itemLoaderSlot?: React.ElementType | undefined;
  /** `slotProps.itemLoader` of the tree (object or `(ownerState) => props`). */
  itemLoaderSlotProps?: unknown;
}

/**
 * Rendered as the children of an item whose children are not loaded yet. Its presence makes
 * the Community item expandable (`aria-expanded`, expand icon); it renders the loading rows
 * while fetching and nothing otherwise.
 */
export function LazyChildrenPlaceholder(props: LazyChildrenPlaceholderProps) {
  const { state, depth, rowsCount, showRows, itemLoaderSlot, itemLoaderSlotProps } = props;
  if (state !== 'loading' || !showRows) {
    return null;
  }
  const Loader = itemLoaderSlot ?? TreeItemLoader;
  const rows: React.ReactNode[] = [];
  for (let index = 0; index < rowsCount; index += 1) {
    const ownerState = {
      index,
      itemsCount: rowsCount,
      itemDepth: depth,
      isCheckboxSelectionEnabled: false,
    };
    const slotProps = (
      typeof itemLoaderSlotProps === 'function'
        ? itemLoaderSlotProps(ownerState)
        : itemLoaderSlotProps
    ) as Record<string, unknown> | undefined;
    rows.push(
      <Loader
        key={index}
        ownerState={ownerState}
        {...slotProps}
        style={{
          ...(slotProps?.style as React.CSSProperties | undefined),
          '--TreeView-itemDepth': depth,
        }}
      />,
    );
  }
  return <React.Fragment>{rows}</React.Fragment>;
}
