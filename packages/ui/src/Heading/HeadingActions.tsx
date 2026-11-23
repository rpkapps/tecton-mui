'use client';
import * as React from 'react';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Popover, { type PopoverProps } from '@mui/material/Popover';
import { styled, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { flattenChildren } from './flattenChildren.js';
import { headingClasses } from './Heading.js';
import { px, useHeadingPart, widthOf } from './HeadingContext.js';

export interface HeadingActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The actions: buttons, icon buttons, selects, a toggle button group, and vertical `Divider`s
   * (`orientation="vertical" flexItem emphasis="subtle"`) between groups of them. Put the primary
   * action last: when the heading is too narrow, the actions collapse into the overflow button
   * first to last, and the last one stays the longest.
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

const keyOf = (node: React.ReactNode, index: number) =>
  React.isValidElement(node) && node.key != null ? node.key : `#${index}`;

/** The tray's content: the hidden actions without separators at either end. */
function trimSeparators(nodes: React.ReactNode[]) {
  let start = 0;
  let end = nodes.length;
  while (start < end && isSeparator(nodes[start])) start += 1;
  while (end > start && isSeparator(nodes[end - 1])) end -= 1;
  return nodes.slice(start, end);
}

/**
 * A click on a command in the tray closes it, as in a menu; controls that keep a state or open
 * their own popup (toggle buttons, selects, menu buttons) leave it open.
 */
function closesTray(target: EventTarget) {
  if (!(target instanceof Element)) return false;
  const control = target.closest('button, a[href]');
  return (
    control != null &&
    !control.hasAttribute('aria-pressed') &&
    !control.hasAttribute('aria-haspopup') &&
    control.getAttribute('role') !== 'combobox'
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
    const total = items.length;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const overflowRef = React.useRef<HTMLButtonElement>(null);
    const handleRef = useForkRef(rootRef, ref);

    const heading = useHeadingPart('actions', rootRef, () => {
      const root = rootRef.current;
      const cells = root
        ? Array.from(root.children).filter((child) => child.hasAttribute('data-heading-action'))
        : [];
      return {
        items: cells.map(widthOf),
        separators: items.map(isSeparator),
        gap: root ? px(getComputedStyle(root).columnGap) : 0,
        overflow: widthOf(overflowRef.current),
      };
    });
    const measuring = heading?.layout.measuring ?? false;
    const hiddenCount = heading && !measuring ? Math.min(heading.layout.actions, total) : 0;

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchor) && hiddenCount > 0;
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
        {(measuring || hiddenCount > 0) && (
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
        {items.slice(hiddenCount).map((node, index) => (
          <ActionItem key={keyOf(node, hiddenCount + index)} data-heading-action="">
            {node}
          </ActionItem>
        ))}
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
            {trimSeparators(items.slice(0, hiddenCount)).map((node, index) => (
              <ActionItem key={keyOf(node, index)}>{node}</ActionItem>
            ))}
          </Tray>
        </Popover>
      </ActionsRoot>
    );
  },
);

export default HeadingActions;
