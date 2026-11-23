'use client';
import * as React from 'react';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Popover, { type PopoverProps } from '@mui/material/Popover';
import { styled, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { flattenChildren } from './flattenChildren.js';
import { headingClasses } from './Heading.js';
import { px, useHeadingPart, widthOf } from './HeadingContext.js';
import { hiddenActions } from './layout.js';

export interface HeadingActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The actions: buttons, icon buttons, a `HeadingSearch`, selects, a toggle button group, and
   * vertical `Divider`s (`orientation="vertical" flexItem emphasis="subtle"`) between groups of
   * them. Put the primary action last: when the heading is too narrow, the actions collapse into
   * the overflow button first to last, and the last one stays the longest.
   */
  children?: React.ReactNode;
  /** Props for the overflow button and its tray. */
  slotProps?: {
    /** Props of the overflow (⋮) button, an `IconButton`: its `aria-label` (default "More actions"). */
    overflowButton?: Partial<IconButtonProps>;
    /** Props of the overflow tray, a `Popover` holding the actions that do not fit. */
    overflowTray?: Partial<PopoverProps>;
  };
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

/** What an action learns about its place: in the row or in the overflow tray. */
export interface HeadingActionContextValue {
  /** The action is in the overflow tray. */
  inTray: boolean;
  /** Keeps the action in the row (it never collapses) while `true`: an open search field. */
  setPinned: (pinned: boolean) => void;
}

export const HeadingActionContext = React.createContext<HeadingActionContextValue | null>(null);

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const ActionsRoot = styled('div', { name: 'TectonHeading', slot: 'Actions' })({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  // Figma: the heading's actions sit space-200 apart.
  gap: cssVar('space-200'),
  // At the end of the row, whatever comes before it.
  marginLeft: 'auto',
});

// One cell per action, as tall as the row, so that a `flexItem` divider spans it.
const ActionItem = styled('div', { name: 'TectonHeading', slot: 'Action' })({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  flexShrink: 0,
});

// The tray keeps the actions as they are, in a row (wrapping on a narrow screen).
const Tray = styled('div', { name: 'TectonHeading', slot: 'OverflowTray' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: cssVar('space-200'),
  padding: `${cssVar('space-150')} ${cssVar('space-200')}`,
});

/** Kept for the measure pass but out of the flow and out of sight. */
const measureOnly = { position: 'absolute', visibility: 'hidden', left: 0, top: 0 } as const;

const isSeparator = (node: React.ReactNode) => React.isValidElement(node) && node.type === Divider;

/** A `HeadingSearch` collapses after the other actions (known from its type, never from state). */
const isLate = (node: React.ReactNode) =>
  React.isValidElement(node) &&
  (node.type as { muiName?: string } | null)?.muiName === 'HeadingSearch';

const keyOf = (node: React.ReactNode, index: number) =>
  String(React.isValidElement(node) && node.key != null ? node.key : `#${index}`);

/** The tray's content: the hidden actions, without separators at either end or two in a row. */
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

/** An action's cell, telling the action where it is and letting it pin itself to the row. */
function ActionCell({
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
  const context = React.useMemo<HeadingActionContextValue>(
    () => ({ inTray, setPinned: (pinned) => onPin(itemKey, pinned) }),
    [inTray, itemKey, onPin],
  );
  return (
    <HeadingActionContext.Provider value={context}>
      <ActionItem {...other}>{children}</ActionItem>
    </HeadingActionContext.Provider>
  );
}

/**
 * The heading's actions, at the end of its row. In a `Heading` that is too narrow, they collapse
 * into an overflow (⋮) button, first to last; its tray shows them as they are.
 */
const HeadingActions = React.forwardRef<HTMLDivElement, HeadingActionsProps>(
  function HeadingActions(props, ref) {
    const { children, slotProps, className, ...other } = props;
    const items = React.useMemo(() => flattenChildren(children), [children]);
    const keys = items.map(keyOf);
    const separators = items.map(isSeparator);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const overflowRef = React.useRef<HTMLButtonElement>(null);
    const handleRef = useForkRef(rootRef, ref);

    // Actions that keep their place in the row: an open search field. A pinned action never
    // collapses, so it never unmounts from the row on its own and the state stays settled.
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
    const late = items.map(isLate);

    const heading = useHeadingPart('actions', rootRef, () => {
      const root = rootRef.current;
      const cells = root
        ? Array.from(root.children).filter((child) => child.hasAttribute('data-heading-action'))
        : [];
      return {
        items: cells.map(widthOf),
        separators,
        pinned,
        late,
        gap: root ? px(getComputedStyle(root).columnGap) : 0,
        overflow: widthOf(overflowRef.current),
      };
    });
    const measuring = heading?.layout.measuring ?? false;
    const hidden = hiddenActions(
      { separators, pinned, late },
      heading && !measuring ? heading.layout.actions : 0,
    );
    const collapsed = hidden.some((isHidden, index) => isHidden && !separators[index]);

    // An action pinned or unpinned changes what can collapse: share the row again.
    const requestMeasure = heading?.requestMeasure;
    useEnhancedEffect(() => {
      requestMeasure?.();
    }, [pinnedKeys, requestMeasure]);

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchor) && collapsed;
    const trayId = React.useId();
    const buttonId = React.useId();
    const rtl = useTheme().direction === 'rtl';
    const side = rtl ? 'right' : 'left';

    const {
      onClick: onOverflowClick,
      className: overflowClassName,
      ...overflowProps
    } = slotProps?.overflowButton ?? {};
    const trayProps = slotProps?.overflowTray;

    return (
      <ActionsRoot
        ref={handleRef}
        data-heading-part="actions"
        className={clsx(headingClasses.actions, className)}
        {...other}
      >
        {(measuring || collapsed) && (
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
            className={clsx(headingClasses.overflowButton, overflowClassName)}
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
            <ActionCell
              key={keys[index]}
              itemKey={keys[index]!}
              inTray={false}
              onPin={onPin}
              data-heading-action=""
            >
              {node}
            </ActionCell>
          ),
        )}
        <Popover
          anchorEl={anchor}
          open={open}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: side }}
          transformOrigin={{ vertical: 'top', horizontal: side }}
          {...trayProps}
        >
          <Tray
            id={trayId}
            role="dialog"
            aria-labelledby={buttonId}
            className={headingClasses.overflowTray}
            onClick={(event) => {
              if (closesTray(event.target)) setAnchor(null);
            }}
          >
            {trayItems(items.filter((_, index) => hidden[index])).map((node) => {
              const key = keyOf(node, items.indexOf(node));
              return (
                <ActionCell key={key} itemKey={key} inTray onPin={onPin}>
                  {node}
                </ActionCell>
              );
            })}
          </Tray>
        </Popover>
      </ActionsRoot>
    );
  },
);

export default HeadingActions;
