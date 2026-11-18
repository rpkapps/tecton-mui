'use client';
import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import {
  ThemeProvider as MuiThemeProvider,
  type Theme,
  type ThemeOptions,
} from '@mui/material/styles';
import { createTheme, getDefaultTheme } from './createTheme.js';
import { useTectonModeValue } from './modeStore.js';
import { getRtlCache } from './rtl.js';

export interface ThemeProviderProps {
  children?: React.ReactNode;
  /**
   * A theme object (complete, or partial to override the outer theme when nested) or an MUI
   * nested-theme function. When provided it is used as-is, following MUI semantics. When omitted,
   * the Tecton theme for the shared light/dark mode is used.
   */
  theme?: Partial<Theme> | ((outerTheme: Theme) => Theme);
  /**
   * MUI ThemeOptions applied on top of the Tecton defaults for the current shared mode.
   * Pass a stable (memoized/module-level) object to avoid rebuilding the theme.
   */
  themeOptions?: ThemeOptions;
  /** Text direction. `rtl` also enables Emotion RTL style flipping for this subtree. */
  direction?: 'ltr' | 'rtl';
}

/**
 * Tecton ThemeProvider. With no configuration it provides the approved Tecton theme and follows
 * Tecton's page-wide `themeManager` mode. It renders no DOM and does not apply CssBaseline or
 * LocalizationProvider.
 */
export function ThemeProvider({ children, theme, themeOptions, direction }: ThemeProviderProps) {
  const mode = useTectonModeValue();
  const resolvedTheme = React.useMemo(() => {
    if (theme) return theme;
    if (!themeOptions) return getDefaultTheme(mode, direction);
    return createTheme({
      ...themeOptions,
      ...(direction ? { direction } : null),
      palette: { ...themeOptions.palette, mode },
    });
  }, [theme, themeOptions, mode, direction]);

  const content = <MuiThemeProvider theme={resolvedTheme}>{children}</MuiThemeProvider>;
  return direction === 'rtl' ? (
    <CacheProvider value={getRtlCache()}>{content}</CacheProvider>
  ) : (
    content
  );
}
