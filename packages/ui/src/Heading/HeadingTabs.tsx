'use client';
import * as React from 'react';
import clsx from 'clsx';
import Button, { type ButtonProps } from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tabs, { tabsClasses, type TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { cssVar } from '../styles/tecton/index.js';
import { headingClasses } from './Heading.js';
import { px, useHeadingPart, widthOf } from './HeadingContext.js';
import { visibleTabIndices } from './layout.js';

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
  /** Props for the `Tabs` slots, and for the More pill and its menu. */
  slotProps?: NonNullable<TabsProps['slotProps']> & {
    /**
     * Props of the More pill (a tertiary text `Button`), shown when not every tab fits: for
     * example its label (`children`, default "More").
     */
    moreButton?: Partial<ButtonProps>;
    /** Props of the More pill's `Menu`, which lists the tabs that do not fit. */
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

// The tab group's row is as tall as the Figma heading's title row (space-600), whatever the tab size.
const TabsRegion = styled('div', { name: 'TectonHeading', slot: 'TabsRegion' })({
  display: 'flex',
  alignItems: 'center',
  minHeight: cssVar('space-600'),
});

// Figma <TabGroup type="filled" background=true>: the pills on a paper surface. The theme's `pills`
// variant styles the strip and leaves this surface to the heading. The More pill sits in it too.
const TabGroup = styled('div', { name: 'TectonHeading', slot: 'TabGroup' })({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: cssVar('space-25'),
  backgroundColor: cssVar('color-bg-paper'),
  padding: cssVar('space-75'),
  borderRadius: cssVar('radius-50'),
});

// The More pill has the look of a tab that is not selected (the tertiary action colors of the
// filled tab group), and the tab's size.
const MoreButton = styled(Button, { name: 'TectonHeading', slot: 'MoreButton' })({
  flexShrink: 0,
  minWidth: 0,
  minHeight: cssVar('space-400'),
  paddingTop: cssVar('space-50'),
  paddingBottom: cssVar('space-50'),
  paddingLeft: cssVar('space-100'),
  paddingRight: cssVar('space-100'),
  borderRadius: cssVar('radius-50'),
  lineHeight: cssVar('line-height-medium'),
  // Open: the pressed look of the tertiary button (Figma State=Activated).
  '&[aria-expanded="true"]': {
    backgroundColor: cssVar('color-action-tertiary-bg-active'),
    color: cssVar('color-action-tertiary-text-active'),
  },
});

const MoreIcon = styled('span', { name: 'TectonHeading', slot: 'MoreIcon' })({
  fontSize: cssVar('icon-size-100'),
});

/** Kept for the measure pass but out of the flow and out of sight. */
const measureOnly = { position: 'absolute', visibility: 'hidden', left: 0, top: 0 } as const;

/**
 * The heading's tabs: MUI `Tabs` with the Tecton filled (`pills`) look on a paper surface. Give them
 * an `aria-label`. In a `Heading` that is too narrow, the tabs after the selected one go into a More
 * pill's menu; the selected tab always shows.
 */
const HeadingTabs = React.forwardRef<HTMLDivElement, HeadingTabsProps>(
  function HeadingTabs(props, ref) {
    const { children, value, onChange, className, slotProps, ...other } = props;
    const {
      moreButton: moreButtonProps,
      moreMenu: moreMenuProps,
      ...tabsSlotProps
    } = slotProps ?? {};
    const items = React.useMemo(() => readTabs(children), [children]);
    const total = items.length;
    const pinned = items.findIndex((item) => item.value === value);

    const regionRef = React.useRef<HTMLDivElement>(null);
    const groupRef = React.useRef<HTMLDivElement>(null);
    const tabsRef = React.useRef<HTMLDivElement>(null);
    const moreRef = React.useRef<HTMLButtonElement>(null);
    const handleTabsRef = useForkRef(tabsRef, ref);

    const heading = useHeadingPart('tabs', regionRef, () => {
      const list = tabsRef.current?.querySelector(`.${tabsClasses.list}`);
      const tabs = list
        ? Array.from(list.children).filter((child) => child.getAttribute('role') === 'tab')
        : [];
      const group = groupRef.current ? getComputedStyle(groupRef.current) : null;
      return {
        items: tabs.map(widthOf),
        gap: list ? px(getComputedStyle(list).columnGap) : 0,
        padding: group ? px(group.paddingLeft) + px(group.paddingRight) : 0,
        more: widthOf(moreRef.current),
        pinned,
      };
    });
    const measuring = heading?.layout.measuring ?? false;
    const count = heading && !measuring ? heading.layout.tabs : total;
    const shown = visibleTabIndices(total, count, pinned);
    const shownSet = new Set(shown);
    const hidden = items.filter((_, index) => !shownSet.has(index));

    // Another selected tab may be wider than the one it replaces: share the row again.
    const requestMeasure = heading?.requestMeasure;
    useEnhancedEffect(() => {
      requestMeasure?.();
    }, [pinned, total, requestMeasure]);

    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    // A tab picked in the menu takes the focus (once it shows), not the More pill.
    const [picked, setPicked] = React.useState(false);
    const pendingFocus = React.useRef(false);
    const open = Boolean(anchor) && hidden.length > 0;
    const menuId = React.useId();
    const buttonId = React.useId();

    React.useEffect(() => {
      if (!pendingFocus.current) return;
      pendingFocus.current = false;
      const selected = tabsRef.current?.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      );
      (selected ?? moreRef.current)?.focus();
    });

    const { onClick: onMoreClick, className: moreClassName, ...moreProps } = moreButtonProps ?? {};

    return (
      <TabsRegion ref={regionRef} data-heading-part="tabs">
        <TabGroup ref={groupRef} className={headingClasses.tabGroup}>
          <Tabs
            ref={handleTabsRef}
            {...other}
            value={value}
            onChange={onChange}
            variant="pills"
            slotProps={tabsSlotProps}
            className={clsx(headingClasses.tabs, className)}
          >
            {shown.map((index) => {
              const item = items[index]!;
              return React.cloneElement(item.element, { value: item.value });
            })}
          </Tabs>
          {(measuring || hidden.length > 0) && (
            <MoreButton
              ref={moreRef}
              id={buttonId}
              variant="text"
              color="tertiary"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? menuId : undefined}
              endIcon={<MoreIcon className="tecton-chevron-down-outline" aria-hidden />}
              tabIndex={measuring ? -1 : undefined}
              aria-hidden={measuring || undefined}
              style={measuring ? measureOnly : undefined}
              {...moreProps}
              className={clsx(headingClasses.moreButton, moreClassName)}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                onMoreClick?.(event);
                setPicked(false);
                setAnchor(event.currentTarget);
              }}
            >
              {moreProps.children ?? 'More'}
            </MoreButton>
          )}
        </TabGroup>
        <Menu
          id={menuId}
          anchorEl={anchor}
          open={open}
          onClose={() => setAnchor(null)}
          disableRestoreFocus={picked}
          {...moreMenuProps}
          slotProps={{
            ...moreMenuProps?.slotProps,
            list: { 'aria-labelledby': buttonId, ...moreMenuProps?.slotProps?.list },
          }}
        >
          {hidden.map((item) => {
            const tab = item.element.props as {
              label?: React.ReactNode;
              icon?: React.ReactNode;
              disabled?: boolean;
              'aria-label'?: string;
            };
            return (
              <MenuItem
                key={item.element.key}
                disabled={tab.disabled}
                onClick={(event) => {
                  setPicked(true);
                  setAnchor(null);
                  pendingFocus.current = true;
                  onChange?.(event, item.value);
                }}
              >
                {tab.icon ? <ListItemIcon>{tab.icon}</ListItemIcon> : null}
                <ListItemText>{tab.label ?? tab['aria-label']}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
      </TabsRegion>
    );
  },
);

export default HeadingTabs;
