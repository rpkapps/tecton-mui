'use client';
// The heading's tabs: the Tecton filled tab group (MUI Tabs, `variant="pills"`) on a paper surface,
// as the Tecton drop-in heading (`<wc-heading>`) draws and folds them. In a heading too narrow for
// every tab, the first ones show and a More tab at the end of the tab list opens a menu of the rest;
// the More tab is selected while the open tab is among them. On a narrow heading (720px and below)
// the tabs are one dropdown on a row of their own: the More tab alone, named after the open tab.
import * as React from 'react';
import clsx from 'clsx';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab, { type TabProps } from '@mui/material/Tab';
import Tabs, { tabsClasses, type TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { sxList } from '../internal/sxList.js';
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
  | 'slotProps'
> {
  /** The tabs: MUI `Tab` elements. */
  children?: React.ReactNode;
  /** Props for the `Tabs` slots, and for the More tab and its menu. */
  slotProps?: NonNullable<TabsProps['slotProps']> & {
    /**
     * Props of the More tab (a `Tab`), shown when not every tab fits: for example its `label`
     * (default "More").
     */
    moreTab?: Partial<TabProps>;
    /** Props of the More tab's `Menu`, which lists the tabs that do not fit. */
    moreMenu?: Partial<MenuProps>;
  };
}

interface TabItem {
  element: React.ReactElement<Record<string, unknown>>;
  /** The tab's value, as MUI `Tabs` reads it: its `value` prop, or else its index. */
  value: unknown;
}

function readTabs(children: React.ReactNode): TabItem[] {
  return React.Children.toArray(children)
    .filter((child) => React.isValidElement<Record<string, unknown>>(child))
    .map((element, index) => ({
      element,
      value: element.props.value === undefined ? index : element.props.value,
    }));
}

/** The More tab's value: no tab of the page has it. */
const MORE = '\0TectonHeading-more';

// The tab group's row is as tall as the Figma heading's title row (space-600), whatever the tab size.
const TabsRegion = styled('div', { name: 'TectonHeading', slot: 'TabsRegion' })({
  display: 'flex',
  alignItems: 'center',
  minHeight: cssVar('space-600'),
});

// Figma <TabGroup type="filled" background=true>: the pills on a paper surface. The theme's `pills`
// variant styles the strip and leaves this surface to the heading.
const TabGroup = styled('div', { name: 'TectonHeading', slot: 'TabGroup' })({
  display: 'flex',
  flexShrink: 0,
  backgroundColor: cssVar('color-bg-paper'),
  padding: cssVar('space-75'),
  borderRadius: cssVar('radius-50'),
});

// Figma <TabGroup> gap: space-100 between the tabs; each tab as wide as its label.
const tabsSx = {
  minHeight: cssVar('space-400'),
  [`& .${tabsClasses.list}`]: { gap: cssVar('space-100') },
  '& .MuiTab-root': { minWidth: 0 },
} as const;

const MoreIcon = styled('span', { name: 'TectonHeading', slot: 'MoreIcon' })({
  display: 'block',
  fontSize: cssVar('icon-size-100'),
});

/**
 * The heading's tabs: MUI `Tabs` with the Tecton filled (`pills`) look on a paper surface. Give them
 * an `aria-label`. In a `Heading` that is too narrow, the last tabs go into the menu of a More tab.
 */
const HeadingTabs = React.forwardRef<HTMLDivElement, HeadingTabsProps>(
  function HeadingTabs(props, ref) {
    const { children, value, onChange, className, sx, slotProps, ...other } = props;
    const { moreTab: moreTabProps, moreMenu: moreMenuProps, ...tabsSlotProps } = slotProps ?? {};
    const items = React.useMemo(() => readTabs(children), [children]);
    const total = items.length;

    const regionRef = React.useRef<HTMLDivElement>(null);
    const groupRef = React.useRef<HTMLDivElement>(null);
    const tabsRef = React.useRef<HTMLDivElement>(null);
    const handleTabsRef = useForkRef(tabsRef, ref);

    const heading = useHeadingPart('tabs', regionRef, () => {
      const list = tabsRef.current?.querySelector(`.${tabsClasses.list}`);
      const tabs = list
        ? Array.from(list.children).filter(
            (child) =>
              child.getAttribute('role') === 'tab' &&
              !child.classList.contains(headingClasses.moreTab),
          )
        : [];
      const group = groupRef.current ? getComputedStyle(groupRef.current) : null;
      return {
        items: tabs.map(widthOf),
        gap: list ? px(getComputedStyle(list).columnGap) : 0,
        padding: group ? px(group.paddingLeft) + px(group.paddingRight) : 0,
        more: widthOf(list?.querySelector(`.${headingClasses.moreTab}`)),
      };
    });
    const measuring = heading?.layout.measuring ?? false;
    let count = total;
    if (heading && !measuring) count = heading.narrow ? 0 : Math.min(total, heading.layout.tabs);
    const shown = items.slice(0, count);
    const hidden = items.slice(count);
    const openHidden = hidden.find((item) => item.value === value);

    // A tab added or removed: share the row again.
    const requestMeasure = heading?.requestMeasure;
    useEnhancedEffect(() => {
      requestMeasure?.();
    }, [total, requestMeasure]);

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchor) && hidden.length > 0;
    const menuId = React.useId();

    // The More tab: "More" after the tabs that show, or alone, the open tab's name (a dropdown).
    const hiddenLabel = (openHidden ?? hidden[0])?.element.props.label as React.ReactNode;
    const {
      onClick: onMoreClick,
      className: moreClassName,
      label: moreLabel,
      ...moreProps
    } = moreTabProps ?? {};
    const label = measuring || shown.length > 0 ? (moreLabel ?? 'More') : hiddenLabel;
    let tabsValue: unknown = false;
    if (shown.some((item) => item.value === value)) tabsValue = value;
    else if (openHidden && !measuring) tabsValue = MORE;

    return (
      <TabsRegion ref={regionRef} data-heading-part="tabs">
        <TabGroup ref={groupRef} className={headingClasses.tabGroup}>
          <Tabs
            ref={handleTabsRef}
            {...other}
            value={tabsValue}
            onChange={(event, next) => {
              if (next !== MORE) onChange?.(event, next);
            }}
            variant="pills"
            slotProps={tabsSlotProps}
            className={clsx(headingClasses.tabs, className)}
            sx={[tabsSx, ...sxList(sx)]}
          >
            {shown.map((item) => React.cloneElement(item.element, { value: item.value }))}
            {measuring || hidden.length > 0 ? (
              <Tab
                value={MORE}
                label={label}
                icon={<MoreIcon className="tecton-chevron-down-outline" aria-hidden />}
                iconPosition="end"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                tabIndex={measuring ? -1 : undefined}
                {...moreProps}
                className={clsx(headingClasses.moreTab, moreClassName)}
                onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                  onMoreClick?.(event);
                  setAnchor(event.currentTarget);
                }}
              />
            ) : null}
          </Tabs>
        </TabGroup>
        <Menu
          id={menuId}
          anchorEl={anchor}
          open={open}
          onClose={() => setAnchor(null)}
          {...moreMenuProps}
        >
          {hidden.map((item) => {
            const tab = item.element.props as {
              label?: React.ReactNode;
              disabled?: boolean;
              'aria-label'?: string;
            };
            return (
              <MenuItem
                key={item.element.key}
                selected={item.value === value}
                disabled={tab.disabled}
                onClick={(event) => {
                  setAnchor(null);
                  if (item.value !== value) onChange?.(event, item.value);
                }}
              >
                {tab.label ?? tab['aria-label']}
              </MenuItem>
            );
          })}
        </Menu>
      </TabsRegion>
    );
  },
);

export default HeadingTabs;
