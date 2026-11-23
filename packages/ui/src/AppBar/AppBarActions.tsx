'use client';
import * as React from 'react';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { fitCollapse } from '../internal/overflow/collapse.js';
import { useMeasureAfterGrowth } from '../internal/overflow/growth.js';
import {
  useCollapsingItems,
  type OverflowSlotProps,
} from '../internal/overflow/useCollapsingItems.js';
import { actionsGap, AppBarContext, type AppBarTier } from './AppBar.js';
import { SCROLL_ARROW_WIDTH } from './TabStripScrollButton.js';

export interface AppBarActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The actions: icon buttons, text buttons, a menu button, an avatar or a `Menubar`. Put the
   * primary one last: when the bar is too narrow for them, they collapse into an overflow (⋮)
   * button first to last, and the last one stays the longest.
   */
  children?: React.ReactNode;
  /** Props for the overflow button and its tray. */
  slotProps?: OverflowSlotProps;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

/** Stable class names of the app bar's overflow button and tray. */
const overflowClasses = {
  overflowButton: 'TectonAppBar-overflowButton',
  overflowTray: 'TectonAppBar-overflowTray',
};

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const ActionsRoot = styled('div', {
  name: 'TectonAppBarActions',
  slot: 'Root',
  shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: AppBarTier }>(({ tier }) => ({
  position: 'relative',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: cssVar('space-100'),
  flexShrink: 0,
  // At the end of the bar, whatever comes before it.
  marginLeft: 'auto',
  paddingTop: cssVar('space-100'),
  paddingBottom: cssVar('space-100'),
  paddingRight: cssVar('space-200'),
  // The tier's space between the tabs and the actions, plus the region's own inset.
  paddingLeft: `calc(${actionsGap(tier)} + ${cssVar('space-200')})`,
}));

const px = (value: string) => Number.parseFloat(value) || 0;
const outerWidth = (element: Element) => {
  const style = getComputedStyle(element);
  return element.getBoundingClientRect().width + px(style.marginLeft) + px(style.marginRight);
};

/**
 * The tab strip at its narrowest: the selected tab (or the first) between the two scroll arrows,
 * with what else its region holds (the add button). The strip scrolls down to that before the
 * actions give up any room.
 */
function tabStripMinWidth(region: Element) {
  const tabs = region.querySelector('.MuiTabs-root');
  const tab =
    region.querySelector('[role="tab"][aria-selected="true"]') ??
    region.querySelector('[role="tab"]');
  const others = Array.from(region.children)
    .filter((child) => child !== tabs)
    .reduce((total, child) => total + outerWidth(child), 0);
  return (tab ? tab.getBoundingClientRect().width + 2 * SCROLL_ARROW_WIDTH : 0) + others;
}

/** The room the bar leaves the actions: its row, less everything else at its narrowest. */
function availableWidth(actions: HTMLElement) {
  const row = actions.parentElement;
  if (!row) return Number.POSITIVE_INFINITY;
  const style = getComputedStyle(row);
  let available = row.clientWidth - px(style.paddingLeft) - px(style.paddingRight);
  Array.from(row.children).forEach((child) => {
    if (child === actions) return;
    available -=
      child.getAttribute('data-region') === 'tab-strip'
        ? tabStripMinWidth(child)
        : outerWidth(child);
  });
  const own = getComputedStyle(actions);
  return available - px(own.paddingLeft) - px(own.paddingRight);
}

/**
 * The app bar's actions, at its end: icon buttons, text buttons, a menu button or an avatar. The
 * tabs scroll to make room for them; when even the narrowest tab strip leaves too little, the
 * actions collapse into an overflow (⋮) button, first to last, whose tray shows them as they are.
 */
const AppBarActions = React.forwardRef<HTMLDivElement, AppBarActionsProps>(
  function AppBarActions(props, ref) {
    const { children, slotProps, className, ...other } = props;
    const { tier } = React.useContext(AppBarContext);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(rootRef, ref);

    // Measured before the browser paints: every action at its natural width (`measuring`), then
    // as many collapse as the room the bar leaves requires.
    const [layout, setLayout] = React.useState({ measuring: true, collapsed: 0 });
    const overflow = useCollapsingItems({
      children,
      collapsed: layout.collapsed,
      measuring: layout.measuring,
      rootRef,
      slotProps,
      classes: overflowClasses,
    });
    const remeasure = React.useCallback(() => {
      setLayout((current) => (current.measuring ? current : { ...current, measuring: true }));
    }, []);

    useEnhancedEffect(() => {
      const root = rootRef.current;
      if (!layout.measuring || !root) return;
      // No layout (hidden, or not in the page yet): everything shows.
      const collapsed =
        root.getClientRects().length === 0
          ? 0
          : fitCollapse(overflow.measure(), availableWidth(root));
      setLayout({ measuring: false, collapsed });
    }, [layout]);

    // Any change of size, of the bar or of the actions (a label, an avatar that loaded), measures
    // again; a measure that changes nothing changes no size, so this settles. An action growing into
    // its place (an opening search) was measured at its full size: measure again once it has grown.
    const onResize = useMeasureAfterGrowth(rootRef, remeasure);
    useEnhancedEffect(() => {
      const root = rootRef.current;
      const row = root?.parentElement;
      if (!root || !row || typeof ResizeObserver === 'undefined') return undefined;
      const observer = new ResizeObserver(onResize);
      observer.observe(row);
      observer.observe(root);
      return () => observer.disconnect();
    }, [onResize]);

    // An action pinned or unpinned changes what can collapse.
    useEnhancedEffect(() => {
      remeasure();
    }, [overflow.pinnedKeys, remeasure]);

    return (
      <ActionsRoot
        ref={handleRef}
        tier={tier}
        data-region="right"
        data-slot="actions"
        data-measuring={layout.measuring ? '' : undefined}
        className={className}
        {...other}
      >
        {overflow.content}
      </ActionsRoot>
    );
  },
);

export default AppBarActions;
