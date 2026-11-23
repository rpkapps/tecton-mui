'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';
import { headingClasses } from './Heading.js';

export interface HeadingActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The actions: buttons, icon buttons, selects, a toggle button group, and vertical `Divider`s
   * (`orientation="vertical" flexItem emphasis="subtle"`) between groups of them.
   */
  children?: React.ReactNode;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const ActionsRoot = styled('div', { name: 'TectonHeading', slot: 'Actions' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  // Figma: the heading's actions sit space-200 apart.
  gap: cssVar('space-200'),
  // At the end of the row, whatever comes before it.
  marginLeft: 'auto',
});

/**
 * The heading's actions, at the end of its row. When the row is too narrow they move to a line of
 * their own, still at the end, and wrap there.
 */
const HeadingActions = React.forwardRef<HTMLDivElement, HeadingActionsProps>(
  function HeadingActions({ className, ...other }, ref) {
    return <ActionsRoot ref={ref} className={clsx(headingClasses.actions, className)} {...other} />;
  },
);

export default HeadingActions;
