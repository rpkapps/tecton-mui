'use client';
// Heading: the Tecton page heading (Figma "Heading", Tecton Storybook "Organisms/Heading"). Material
// UI has no such component; this one is composed from Material parts, so every surface, state and
// colour comes from the theme. Its parts go in as children, MUI style:
//
//   <Heading>
//     <HeadingTitle onHomeClick={…} onMenuClick={…}>Portfolio</HeadingTitle>
//     <HeadingTabs value={tab} onChange={…} aria-label="Portfolio sections">
//       <Tab label="Overview" />
//       <Tab label="Team" />
//     </HeadingTabs>
//     <HeadingActions>
//       <Button variant="contained" startIcon={…}>New Project</Button>
//     </HeadingActions>
//   </Heading>
//
// The row lays the parts out as the Figma heading frame does: the title cluster, then the tabs, then
// the actions at the end. When they do not fit, the row wraps (the actions first) instead of
// overflowing its container, so the page still reflows at narrow widths (WCAG 1.4.10).
import * as React from 'react';
import clsx from 'clsx';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';

export const headingClasses = {
  /** The heading row. */
  root: 'TectonHeading-root',
  /** On the root with `disableGutters`. */
  disableGutters: 'TectonHeading-disableGutters',
  /** `HeadingTitle`: the title cluster (home button, title, menu button). */
  title: 'TectonHeading-title',
  /** The title text (a `Typography`). */
  titleText: 'TectonHeading-titleText',
  /** The home button before the title. */
  homeButton: 'TectonHeading-homeButton',
  /** The menu (chevron) button after the title. */
  menuButton: 'TectonHeading-menuButton',
  /** `HeadingTabs`: the `Tabs` root. */
  tabs: 'TectonHeading-tabs',
  /** `HeadingActions`: the actions at the end of the row. */
  actions: 'TectonHeading-actions',
} as const;

export type HeadingClassKey = keyof typeof headingClasses;

export interface HeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The heading's content: `HeadingTitle`, `HeadingTabs`, `HeadingActions` or any of your own. */
  children?: React.ReactNode;
  /**
   * The component used for the root node: a string for an HTML element (for example `'header'`) or
   * a component.
   * @default 'div'
   */
  component?: React.ElementType;
  /**
   * Removes the inline padding (the Figma frame's 72px gutters), for a heading inside a container
   * that already has its own.
   * @default false
   */
  disableGutters?: boolean;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const HeadingRoot = styled('div', { name: 'TectonHeading', slot: 'Root' })({
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  // Figma: the title cluster and the tab group sit space-400 apart; wrapped lines space-200.
  columnGap: cssVar('space-400'),
  rowGap: cssVar('space-200'),
  // Figma heading frame: space-400 above and below, space-900 gutters.
  paddingTop: cssVar('space-400'),
  paddingBottom: cssVar('space-400'),
  paddingLeft: cssVar('space-900'),
  paddingRight: cssVar('space-900'),
  [`&.${headingClasses.disableGutters}`]: { paddingLeft: 0, paddingRight: 0 },
});

/**
 * Tecton page heading. Compose it from `HeadingTitle`, `HeadingTabs` (holding MUI `Tab` elements)
 * and `HeadingActions`, or any content of your own.
 *
 * Demos: [Heading](/components/heading)
 */
const Heading = React.forwardRef<HTMLDivElement, HeadingProps>(function Heading(props, ref) {
  const { component, disableGutters = false, className, ...other } = props;
  return (
    <HeadingRoot
      ref={ref}
      as={component}
      className={clsx(
        headingClasses.root,
        disableGutters && headingClasses.disableGutters,
        className,
      )}
      {...other}
    />
  );
});

export default Heading;
