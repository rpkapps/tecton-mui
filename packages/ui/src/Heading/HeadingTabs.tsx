'use client';
// The heading's tabs: the Tecton filled tab group (MUI Tabs, `variant="pills"`) on a paper surface.
// When the group is wider than the room the heading gives it, it scrolls as MUI's scrollable Tabs
// (`variant="scrollable"`, `scrollButtons="auto"`) do: both scroll arrows while the tabs do not fit,
// the one that cannot scroll its way disabled and out of sight, a click that scrolls by the tabs
// that fit, the selected tab kept in view, no arrows on a phone, and native wheel, touch and
// keyboard scrolling. The theme styles the filled group through `variant="pills"`, which
// `variant="scrollable"` would replace, so the shared tab strip engine (internal/tab-strip) drives
// the pills' scroller directly and the arrows sit beside the Tabs, in the group.
import * as React from 'react';
import clsx from 'clsx';
import TabScrollButton from '@mui/material/TabScrollButton';
import Tabs, { tabsClasses, type TabsProps } from '@mui/material/Tabs';
import { styled, useTheme, type Theme } from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { sxList } from '../internal/sxList.js';
import { TabStripContext, useTabStrip, useTabStripArrow } from '../internal/tab-strip/tabStrip.js';
import { headingClasses } from './Heading.js';
import { px, useHeadingPart, widthOf } from './HeadingContext.js';

/**
 * The MUI `Tabs` props. The props that only apply to other variants or to vertical tabs are left
 * out: the heading's tabs are always the Tecton filled (`pills`) tab group, in a row.
 */
export interface HeadingTabsProps extends Omit<
  TabsProps,
  | 'variant'
  | 'orientation'
  | 'centered'
  | 'scrollButtons'
  | 'allowScrollButtonsMobile'
  | 'visibleScrollbar'
  | 'indicatorColor'
  | 'textColor'
  | 'TabIndicatorProps'
  | 'TabScrollButtonProps'
  | 'ScrollButtonComponent'
> {
  /** The tabs: MUI `Tab` elements. */
  children?: React.ReactNode;
}

// The tab group's row is as tall as the Figma heading's title row (space-600), whatever the tab size.
// It takes the room the heading gives it, and no less than its scroll arrows need.
const TabsRegion = styled('div', { name: 'TectonHeading', slot: 'TabsRegion' })({
  display: 'flex',
  alignItems: 'center',
  minHeight: cssVar('space-600'),
  minWidth: 0,
});

// Figma <TabGroup type="filled" background=true>: the pills on a paper surface. The theme's `pills`
// variant styles the strip and leaves this surface to the heading. The scroll arrows sit in it too.
const TabGroup = styled('div', { name: 'TectonHeading', slot: 'TabGroup' })({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  maxWidth: '100%',
  backgroundColor: cssVar('color-bg-paper'),
  padding: cssVar('space-75'),
  borderRadius: cssVar('radius-50'),
});

// The pills' scroller: MUI keeps a non-scrollable strip `overflow: hidden` (inline). The heading's
// strip scrolls, natively too (wheel, touch), without a scrollbar.
const tabsSx = {
  minWidth: 0,
  flex: '0 1 auto',
  [`& .${tabsClasses.scroller}`]: {
    overflowX: 'auto !important',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
} as const;

/**
 * Tecton chevrons, the size of the heading's other small glyphs. MUI also hands an icon slot its
 * `fontSize` and `ownerState`, which a `<span>` does not take.
 */
const chevron = (glyph: string) =>
  function HeadingScrollIcon({ className, style }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
      <span
        className={clsx(glyph, className)}
        style={{ fontSize: cssVar('icon-size-100'), ...style }}
        aria-hidden
      />
    );
  };
const arrowSlots = {
  StartScrollButtonIcon: chevron('tecton-chevron-left-outline'),
  EndScrollButtonIcon: chevron('tecton-chevron-right-outline'),
};

/**
 * An arrow: a square as tall as a pill, with the pills' gap toward them. Written for LTR; the RTL
 * style cache mirrors it.
 */
const arrowSx = (edge: 'start' | 'end') => (theme: Theme) =>
  ({
    flexShrink: 0,
    width: cssVar('space-400'),
    height: cssVar('space-400'),
    borderRadius: cssVar('radius-50'),
    [edge === 'start' ? 'marginRight' : 'marginLeft']: cssVar('space-25'),
    // The filled tab group's tertiary colors, as on a pill that is not selected.
    color: cssVar('color-action-tertiary-adornment'),
    '&:hover': {
      backgroundColor: cssVar('color-action-tertiary-bg-hover'),
      color: cssVar('color-action-tertiary-adornment-hover'),
    },
    // As MUI's scrollable Tabs do without `allowScrollButtonsMobile`: no arrows on a phone, where
    // the tabs scroll by touch.
    [theme.breakpoints.down('sm')]: { display: 'none' },
  }) as const;
const startArrowSx = arrowSx('start');
const endArrowSx = arrowSx('end');

/**
 * A scroll arrow, as in MUI's scrollable Tabs (`scrollButtons="auto"`): both arrows show while the
 * tabs do not fit, and the one that cannot scroll its way is disabled, out of sight (MUI's own
 * `TabScrollButton` style) but in its place, so that the tabs never move when it comes or goes.
 */
function ScrollArrow({ edge }: { edge: 'start' | 'end' }) {
  const rtl = useTheme().direction === 'rtl';
  const direction = (edge === 'start') !== rtl ? 'left' : 'right';
  const { shown, scrollable, onClick } = useTabStripArrow(direction);
  if (!scrollable) return null;
  return (
    <TabScrollButton
      direction={direction}
      orientation="horizontal"
      slots={arrowSlots}
      disabled={!shown}
      onClick={onClick}
      className={headingClasses.scrollButton}
      sx={edge === 'start' ? startArrowSx : endArrowSx}
    />
  );
}

/**
 * The heading's tabs: MUI `Tabs` with the Tecton filled (`pills`) look on a paper surface. Give them
 * an `aria-label`. When they do not fit, they scroll, with arrows, as MUI's scrollable Tabs do.
 */
const HeadingTabs = React.forwardRef<HTMLDivElement, HeadingTabsProps>(
  function HeadingTabs(props, ref) {
    const { children, value, className, sx, ...other } = props;
    const tabCount = React.Children.toArray(children).filter(React.isValidElement).length;
    const regionRef = React.useRef<HTMLDivElement>(null);
    const groupRef = React.useRef<HTMLDivElement>(null);
    const tabsRef = React.useRef<HTMLDivElement>(null);
    const handleTabsRef = useForkRef(tabsRef, ref);

    const selected = value === false || value == null ? null : String(value);
    // The arrows sit beside the Tabs, in the group: a click on one is the user's too. A click pages
    // as in MUI's scrollable Tabs.
    const strip = useTabStrip(tabsRef, selected, tabCount, groupRef, 'scroll-size');
    const theme = useTheme();

    useHeadingPart('tabs', regionRef, () => {
      const group = groupRef.current;
      const list = tabsRef.current?.querySelector(`.${tabsClasses.list}`);
      const tabs = list
        ? Array.from(list.children).filter((child) => child.getAttribute('role') === 'tab')
        : [];
      const style = group ? getComputedStyle(group) : null;
      const padding = style ? px(style.paddingLeft) + px(style.paddingRight) : 0;
      // The tabs side by side, whatever the strip's width (they never shrink).
      const gap = list ? px(getComputedStyle(list).columnGap) : 0;
      const all =
        tabs.reduce((total, tab) => total + widthOf(tab), 0) + gap * Math.max(0, tabs.length - 1);
      const selected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
      // Each arrow: a pill-high square and the pills' gap, none on a phone (see `arrowSx`).
      const phone =
        typeof window !== 'undefined' &&
        !!window.matchMedia?.(theme.breakpoints.down('sm').replace(/^@media\s*/, '')).matches;
      const arrow =
        style && !phone
          ? px(style.getPropertyValue('--tecton-space-400')) +
            px(style.getPropertyValue('--tecton-space-25'))
          : 0;
      return {
        natural: padding + all,
        min: padding + Math.min(all, widthOf(selected)) + (tabs.length > 1 ? 2 * arrow : 0),
      };
    });

    return (
      <TabStripContext.Provider value={strip}>
        <TabsRegion ref={regionRef} data-heading-part="tabs">
          <TabGroup ref={groupRef} className={headingClasses.tabGroup}>
            <ScrollArrow edge="start" />
            <Tabs
              ref={handleTabsRef}
              {...other}
              value={value}
              variant="pills"
              className={clsx(headingClasses.tabs, className)}
              sx={[tabsSx, ...sxList(sx)]}
            >
              {children}
            </Tabs>
            <ScrollArrow edge="end" />
          </TabGroup>
        </TabsRegion>
      </TabStripContext.Provider>
    );
  },
);

export default HeadingTabs;
