'use client';
// AppBar: the Tecton App Bar (React version of the Tecton `<wc-app-bar>` drop-in). It replaces the
// MUI AppBar: the bar always draws the Tecton layout (branding, tabs, the add button and an actions
// region), and `children` fill the actions region. It is built on the MUI AppBar, so the MUI root
// props (`position`, `sx`, `className`, `component`, `ref`...) and the `MuiAppBar` theme keys still
// apply.
import type * as React from 'react';
import type {
  AppBarTypeMap as MuiAppBarTypeMap,
  AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import { AppBarNavigation, type AppBarNavigationProps } from './AppBarNavigation.js';

export type AppBarTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'header',
> = MuiAppBarTypeMap<AdditionalProps & AppBarNavigationProps, RootComponent>;

export type AppBarProps<
  RootComponent extends React.ElementType = MuiAppBarTypeMap['defaultComponent'],
  AdditionalProps = object,
> = MuiAppBarProps<RootComponent, AdditionalProps & AppBarNavigationProps>;

/**
 * Tecton App Bar: branding (`appName`, `logo`, `logoSrc`), icon-only `fixedTabs`, closeable `tabs`,
 * the add button (`maxTabs`, `disableTabAdd`) and `children` in the actions region at the right
 * end. `tier="secondary"` gives the slimmer in-page bar. The page owns the tabs through
 * `onTabSelect`, `onTabClose` and `onTabAdd`.
 *
 * Demos: [App Bar](/components/app-bar)
 */
const AppBar = AppBarNavigation as OverridableComponent<AppBarTypeMap>;

export default AppBar;
