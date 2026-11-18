import type { Theme, ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { buildTectonTheme } from './tecton/index.js';

/**
 * MUI-compatible `createTheme` that starts from the Tecton defaults. Options follow MUI's
 * `ThemeOptions` (palette.mode selects the Tecton light/dark base). Additional arguments are
 * deep-merged onto the result exactly like MUI (e.g. locale objects).
 */
export function createTheme(options: ThemeOptions = {}, ...args: object[]): Theme {
  const mode = options.palette?.mode === 'dark' ? 'dark' : 'light';
  const theme = buildTectonTheme(mode, options);
  return args.reduce<Theme>((acc, arg) => deepmerge(acc, arg) as Theme, theme);
}

const defaultThemes = new Map<string, Theme>();

/** Cached default Tecton theme per mode/direction. Building a theme is costly; do it once. */
export function getDefaultTheme(mode: 'light' | 'dark', direction: 'ltr' | 'rtl' = 'ltr'): Theme {
  const key = `${mode}:${direction}`;
  let theme = defaultThemes.get(key);
  if (!theme) {
    theme = buildTectonTheme(mode, direction === 'rtl' ? { direction } : undefined);
    defaultThemes.set(key, theme);
  }
  return theme;
}
