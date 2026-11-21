'use client';
// AppBar: the MUI AppBar, plus the Tecton app bar layout (React port of the Tecton drop-in
// `<wc-app-bar>`). Without navigation props it is the MUI component, unchanged: children, props,
// refs and theme keys behave exactly as in @mui/material. Any navigation prop (`tabs`, `appName`,
// `onTabSelect`...) renders the Tecton layout instead, with `children` in its actions region.
import * as React from 'react';
import MuiAppBar, {
  type AppBarTypeMap as MuiAppBarTypeMap,
  type AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import {
  AppBarNavigation,
  APP_BAR_NAVIGATION_PROPS,
  type AppBarNavigationProps,
} from './AppBarNavigation.js';

export type AppBarTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'header',
> = MuiAppBarTypeMap<AdditionalProps & AppBarNavigationProps, RootComponent>;

export type AppBarProps<
  RootComponent extends React.ElementType = MuiAppBarTypeMap['defaultComponent'],
  AdditionalProps = object,
> = MuiAppBarProps<RootComponent, AdditionalProps & AppBarNavigationProps>;

function hasNavigationProps(props: object) {
  const record = props as Record<string, unknown>;
  return APP_BAR_NAVIGATION_PROPS.some((key) => record[key] !== undefined);
}

/**
 * App bar. Without navigation props it is the MUI `AppBar`. With any of `tabs`, `fixedTabs`,
 * `activeTab`, `appName`, `logo`, `logoSrc`, `maxTabs`, `disableTabAdd`, `onTabSelect`,
 * `onTabClose` or `onTabAdd` it renders the Tecton app bar: branding, tabs, the add button, and
 * `children` in the actions region at the right end.
 *
 * Demos: [App Bar](/components/app-bar)
 */
const AppBar = React.forwardRef<HTMLElement, AppBarProps>(function AppBar(props, ref) {
  if (hasNavigationProps(props)) return <AppBarNavigation ref={ref} {...props} />;
  return <MuiAppBar ref={ref} {...props} />;
}) as OverridableComponent<AppBarTypeMap>;

export default AppBar;
