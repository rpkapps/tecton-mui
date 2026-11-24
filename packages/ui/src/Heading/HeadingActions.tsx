'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { flattenChildren } from '../internal/overflow/flattenChildren.js';
import { actionKind, iconOnly } from '../internal/overflow/overflowMenu.js';
import {
  useCollapsingItems,
  type OverflowMenuSlotProps,
} from '../internal/overflow/useCollapsingItems.js';
import { headingClasses } from './Heading.js';
import { useHeadingPart } from './HeadingContext.js';

export interface HeadingActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The actions, MUI components: icon buttons (search, filter), selects, a toggle button group (the
   * page view), buttons, and vertical `Divider`s (`orientation="vertical" flexItem
   * emphasis="subtle"`) between groups of them. Put the primary action (a contained button) last.
   * When the heading is too narrow, the others fold into the overflow (⋮) menu: first the other
   * buttons, then the toggle button groups, the selects, the icon buttons and a `HeadingSearch`.
   * The primary action never folds.
   */
  children?: React.ReactNode;
  /** Props for the overflow button and its menu. */
  slotProps?: OverflowMenuSlotProps;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const ActionsRoot = styled('div', { name: 'TectonHeading', slot: 'Actions' })({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  // Figma: the heading's actions sit space-200 apart (space-100 on a narrow heading).
  gap: cssVar('space-200'),
  // At the end of the row, whatever comes before it.
  marginLeft: 'auto',
  // The Figma heading's controls, as the Tecton drop-in heading draws them: buttons space-400 tall
  // on one line, the start icon space-25 from the label; the view toggle's buttons with space-75
  // between the glyph (icon-size-100) and the label, in medium type; selects space-400 tall, the
  // value right after a start label.
  // `&&`: over the theme's own rules for these parts.
  '&& .MuiButton-root': {
    height: cssVar('space-400'),
    whiteSpace: 'nowrap',
    lineHeight: cssVar('line-height-medium'),
  },
  '&& .MuiButton-icon.MuiButton-startIcon': { marginLeft: 0, marginRight: cssVar('space-25') },
  // Figma: the heading's icon buttons (search, filter) draw their glyphs in the tertiary text color,
  // in every state; the overflow button keeps the theme's.
  [`&& .MuiIconButton-colorTertiary:not(.${headingClasses.overflowButton})`]: {
    color: cssVar('color-action-tertiary-text'),
  },
  '&& .MuiToggleButton-root': { gap: cssVar('space-75'), fontSize: cssVar('font-size-medium') },
  '&& .MuiToggleButton-root [class*="tecton-"]': { fontSize: cssVar('icon-size-100') },
  '&& .MuiInputBase-root:has(.MuiSelect-select)': { height: cssVar('space-400') },
  '&& .MuiSelect-select': { minHeight: 0 },
  '&& .MuiInputBase-adornedStart .MuiSelect-select': { paddingLeft: 0 },
});

const overflowClasses = {
  overflowButton: headingClasses.overflowButton,
  overflowTray: headingClasses.overflowMenu,
};

/**
 * The heading's actions, at the end of its row, as in the Tecton drop-in heading. In a `Heading`
 * that is too narrow, the actions but the primary one fold into an overflow (⋮) menu, which lists
 * them as menu items; on a narrow heading (720px and below) the primary action shows its icon only.
 */
const HeadingActions = React.forwardRef<HTMLDivElement, HeadingActionsProps>(
  function HeadingActions(props, ref) {
    const { children, slotProps, className, ...other } = props;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(rootRef, ref);

    // The heading measures the actions (after render, through the overflow row's `measure`) and
    // says how many fold.
    const heading = useHeadingPart('actions', rootRef, () => overflow.measure());
    const measuring = heading?.layout.measuring ?? false;
    const narrow = heading?.narrow ?? false;
    // On a narrow heading, the primary action is an icon button.
    const items = React.useMemo(() => {
      const flat = flattenChildren(children);
      return narrow
        ? flat.map((node) => (actionKind(node) === 'primary' ? iconOnly(node) : node))
        : flat;
    }, [children, narrow]);
    const overflow = useCollapsingItems({
      children: items,
      collapsed: heading && !measuring ? heading.layout.actions : 0,
      measuring,
      rootRef,
      slotProps,
      classes: overflowClasses,
      mode: 'menu',
    });

    // An action pinned or unpinned changes what can fold: share the row again.
    const requestMeasure = heading?.requestMeasure;
    useEnhancedEffect(() => {
      requestMeasure?.();
    }, [overflow.pinnedKeys, requestMeasure]);

    return (
      <ActionsRoot
        ref={handleRef}
        data-heading-part="actions"
        className={clsx(headingClasses.actions, className)}
        {...other}
      >
        {overflow.content}
      </ActionsRoot>
    );
  },
);

export default HeadingActions;
