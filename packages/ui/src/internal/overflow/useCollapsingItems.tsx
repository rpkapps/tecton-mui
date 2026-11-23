'use client';
// A row of actions that collapses into an overflow (⋮) button: each item in a cell of the row, the
// button, and the tray it opens, which shows the collapsed items as they are (icon buttons, selects,
// toggles, a search). Shared by `HeadingActions` and `AppBarActions`; each decides how many items
// collapse (`collapse.ts` says which ones) and measures them through `measure`.
import * as React from 'react';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Popover, { type PopoverProps } from '@mui/material/Popover';
import { styled, useTheme } from '@mui/material/styles';
import { cssVar } from '../../styles/tecton/index.js';
import { hiddenItems, type CollapseMeasure } from './collapse.js';
import { flattenChildren } from './flattenChildren.js';

/** What an item learns about its place: in the row or in the overflow tray. */
export interface OverflowItemContextValue {
  /** The item is in the overflow tray. */
  inTray: boolean;
  /** Keeps the item in the row (it never collapses) while `true`: an open search field. */
  setPinned: (pinned: boolean) => void;
}

export const OverflowItemContext = React.createContext<OverflowItemContextValue | null>(null);

/**
 * A component whose elements collapse after the other items (a search) says so with a static
 * `overflowPriority = 'late'`, as MUI components name themselves with `muiName`. Known from the
 * type, never from state, so a collapsed item that unmounts cannot change its own order.
 */
export interface OverflowPriorityMarker {
  overflowPriority?: 'late';
}

/** Props for the overflow button and its tray. */
export interface OverflowSlotProps {
  /** Props of the overflow (⋮) button, an `IconButton`: its `aria-label` (default "More actions"). */
  overflowButton?: Partial<IconButtonProps>;
  /** Props of the overflow tray, a `Popover` holding the items that do not fit. */
  overflowTray?: Partial<PopoverProps>;
}

// One cell per item, as tall as the row, so that a `flexItem` divider spans it.
const Cell = styled('div', { name: 'TectonOverflow', slot: 'Item' })({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  flexShrink: 0,
});

// The tray keeps the items as they are, in a row (wrapping on a narrow screen).
const Tray = styled('div', { name: 'TectonOverflow', slot: 'Tray' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: cssVar('space-200'),
  padding: `${cssVar('space-150')} ${cssVar('space-200')}`,
});

/** Kept for the measure pass but out of the flow and out of sight. */
const measureOnly = { position: 'absolute', visibility: 'hidden', left: 0, top: 0 } as const;

const ITEM = 'data-overflow-item';

const isSeparator = (node: React.ReactNode) => React.isValidElement(node) && node.type === Divider;

const isLate = (node: React.ReactNode) =>
  React.isValidElement(node) &&
  (node.type as OverflowPriorityMarker | null)?.overflowPriority === 'late';

const keyOf = (node: React.ReactNode, index: number) =>
  String(React.isValidElement(node) && node.key != null ? node.key : `#${index}`);

/** The tray's content: the collapsed items, without separators at either end or two in a row. */
function trayItems(nodes: React.ReactNode[]) {
  const kept: React.ReactNode[] = [];
  nodes.forEach((node) => {
    const last = kept[kept.length - 1];
    if (isSeparator(node) && (kept.length === 0 || isSeparator(last))) return;
    kept.push(node);
  });
  while (kept.length > 0 && isSeparator(kept[kept.length - 1])) kept.pop();
  return kept;
}

/**
 * A click on a command in the tray closes it, as in a menu. Controls that keep a state or open
 * something of their own (toggle buttons, selects, menu and disclosure buttons, a search field)
 * leave it open.
 */
function closesTray(target: EventTarget) {
  if (!(target instanceof Element)) return false;
  const control = target.closest('button, a[href]');
  return (
    control != null &&
    !control.closest('[role="search"]') &&
    !['aria-pressed', 'aria-haspopup', 'aria-expanded'].some((name) =>
      control.hasAttribute(name),
    ) &&
    control.getAttribute('role') !== 'combobox'
  );
}

/** An item's cell, telling the item where it is and letting it pin itself to the row. */
function ItemCell({
  itemKey,
  inTray,
  onPin,
  children,
  ...other
}: {
  itemKey: string;
  inTray: boolean;
  onPin: (key: string, pinned: boolean) => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useMemo<OverflowItemContextValue>(
    () => ({ inTray, setPinned: (pinned) => onPin(itemKey, pinned) }),
    [inTray, itemKey, onPin],
  );
  return (
    <OverflowItemContext.Provider value={context}>
      <Cell {...other}>{children}</Cell>
    </OverflowItemContext.Provider>
  );
}

const px = (value: string) => Number.parseFloat(value) || 0;
const widthOf = (element: Element | null | undefined) =>
  element ? element.getBoundingClientRect().width : 0;

export interface CollapsingItemsOptions {
  /** The items. Fragments are opened, so grouped items still collapse one by one. */
  children: React.ReactNode;
  /** How many of the items that can collapse are in the tray. Ignored while measuring. */
  collapsed: number;
  /** Renders every item in the row (and the overflow button out of sight), to be measured. */
  measuring: boolean;
  /** The row's element (a flex row with `position: relative`) that holds the content. */
  rootRef: React.RefObject<HTMLElement | null>;
  slotProps?: OverflowSlotProps;
  /** Stable class names for the overflow button and the tray. */
  classes: { overflowButton: string; overflowTray: string };
}

/**
 * The content of a row of collapsing items, and `measure`, which reads its natural widths (while
 * `measuring`). `pinnedKeys` changes when an item pins or unpins itself (an open search): what can
 * collapse changes, so the caller measures again.
 */
export function useCollapsingItems(options: CollapsingItemsOptions) {
  const { children, collapsed, measuring, rootRef, slotProps, classes } = options;
  const items = React.useMemo(() => flattenChildren(children), [children]);
  const keys = items.map(keyOf);
  const separators = items.map(isSeparator);
  const late = items.map(isLate);
  const overflowRef = React.useRef<HTMLButtonElement>(null);

  // Items that keep their place in the row: an open search field. A pinned item never collapses, so
  // it never unmounts from the row on its own and the state stays settled.
  const [pinnedKeys, setPinnedKeys] = React.useState<ReadonlySet<string>>(() => new Set());
  const onPin = React.useCallback((key: string, pinned: boolean) => {
    setPinnedKeys((current) => {
      if (current.has(key) === pinned) return current;
      const next = new Set(current);
      if (pinned) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  const pinned = keys.map((key) => pinnedKeys.has(key));

  const hidden = hiddenItems({ separators, pinned, late }, measuring ? 0 : collapsed);
  const anyCollapsed = hidden.some((isHidden, index) => isHidden && !separators[index]);

  const measure = (): CollapseMeasure => {
    const root = rootRef.current;
    const cells = root ? Array.from(root.children).filter((child) => child.hasAttribute(ITEM)) : [];
    return {
      items: cells.map(widthOf),
      separators,
      pinned,
      late,
      gap: root ? px(getComputedStyle(root).columnGap) : 0,
      overflow: widthOf(overflowRef.current),
    };
  };

  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchor) && anyCollapsed;
  const trayId = React.useId();
  const buttonId = React.useId();
  const side = useTheme().direction === 'rtl' ? 'right' : 'left';

  const {
    onClick: onOverflowClick,
    className: overflowClassName,
    ...overflowProps
  } = slotProps?.overflowButton ?? {};

  const content = (
    <>
      {(measuring || anyCollapsed) && (
        <IconButton
          ref={overflowRef}
          id={buttonId}
          aria-label="More actions"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? trayId : undefined}
          tabIndex={measuring ? -1 : undefined}
          aria-hidden={measuring || undefined}
          style={measuring ? measureOnly : undefined}
          {...overflowProps}
          className={clsx(classes.overflowButton, overflowClassName)}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            onOverflowClick?.(event);
            setAnchor(event.currentTarget);
          }}
        >
          <span className="tecton-more-vert-outline" aria-hidden />
        </IconButton>
      )}
      {items.map((node, index) =>
        hidden[index] ? null : (
          <ItemCell
            key={keys[index]}
            itemKey={keys[index]!}
            inTray={false}
            onPin={onPin}
            {...{ [ITEM]: '' }}
          >
            {node}
          </ItemCell>
        ),
      )}
      <Popover
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: side }}
        transformOrigin={{ vertical: 'top', horizontal: side }}
        {...slotProps?.overflowTray}
      >
        <Tray
          id={trayId}
          role="dialog"
          aria-labelledby={buttonId}
          className={classes.overflowTray}
          onClick={(event) => {
            if (closesTray(event.target)) setAnchor(null);
          }}
        >
          {trayItems(items.filter((_, index) => hidden[index])).map((node) => {
            const key = keyOf(node, items.indexOf(node));
            return (
              <ItemCell key={key} itemKey={key} inTray onPin={onPin}>
                {node}
              </ItemCell>
            );
          })}
        </Tray>
      </Popover>
    </>
  );

  return { content, measure, pinnedKeys };
}
