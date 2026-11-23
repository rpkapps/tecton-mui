'use client';
import * as React from 'react';
import clsx from 'clsx';
import Tabs, { tabsClasses, type TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';
import { sxList } from '../internal/sxList.js';
import { headingClasses } from './Heading.js';

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
// It may shrink to the heading's width (see the tab rows below).
const TabsRegion = styled('div', { name: 'TectonHeading', slot: 'TabsRegion' })({
  display: 'flex',
  alignItems: 'center',
  minHeight: cssVar('space-600'),
  minWidth: 0,
  maxWidth: '100%',
});

// Figma <TabGroup type="filled" background=true>: the pills on a paper surface. The theme's `pills`
// variant styles the strip and leaves this surface to the heading. A group wider than the heading
// (a narrow window) wraps its pills onto more rows instead of overflowing the page; a group that
// fits keeps its single row.
const tabsSx = {
  backgroundColor: cssVar('color-bg-paper'),
  padding: cssVar('space-75'),
  borderRadius: cssVar('radius-50'),
  minWidth: 0,
  [`& .${tabsClasses.list}`]: { flexWrap: 'wrap' },
} as const;

/**
 * The heading's tabs: MUI `Tabs` with the Tecton filled (`pills`) look on a paper surface. Give them
 * an `aria-label`.
 */
const HeadingTabs = React.forwardRef<HTMLDivElement, HeadingTabsProps>(
  function HeadingTabs(props, ref) {
    const { className, sx, ...other } = props;
    return (
      <TabsRegion>
        <Tabs
          ref={ref}
          {...other}
          variant="pills"
          className={clsx(headingClasses.tabs, className)}
          sx={[tabsSx, ...sxList(sx)]}
        />
      </TabsRegion>
    );
  },
);

export default HeadingTabs;
