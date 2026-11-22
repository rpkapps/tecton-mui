'use client';
import * as React from 'react';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';
import { actionsGap, AppBarContext, type AppBarTier } from './AppBar.js';

export interface AppBarActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The actions: icon buttons, text buttons, a menu button, an avatar or a `Menubar`. */
  children?: React.ReactNode;
  /** The system prop that allows defining system overrides as well as additional CSS styles. */
  sx?: SxProps<Theme>;
}

// Physical sides, as everywhere in the library: the RTL style cache mirrors them.
const ActionsRoot = styled('div', {
  name: 'TectonAppBarActions',
  slot: 'Root',
  shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: AppBarTier }>(({ tier }) => ({
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

/**
 * The app bar's actions, at its end: icon buttons, text buttons, a menu button or an avatar. The
 * region never shrinks, so wide content takes room from the tabs.
 */
const AppBarActions = React.forwardRef<HTMLDivElement, AppBarActionsProps>(
  function AppBarActions(props, ref) {
    const { tier } = React.useContext(AppBarContext);
    return <ActionsRoot ref={ref} tier={tier} data-region="right" data-slot="actions" {...props} />;
  },
);

export default AppBarActions;
