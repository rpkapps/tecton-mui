// Internal normalized Tecton entry. Components and public styles APIs import Tecton only through
// this module, so switching the adapter source (UMD -> npm) never touches public code.
import './augmentations.js';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { createMuiTheme } from './generated/mui/createMuiTheme.js';
import { muiCompatOverrides } from './compat.js';

export * from './generated/core/index.js';
export { TECTON_VERSION, TECTON_SOURCE, TECTON_MODES } from './generated/meta.js';
export { tectonIconVariants } from './generated/icons.js';
export type {
  TectonIconName,
  TectonMonochromeIconName,
  TectonMulticolorIconName,
} from './generated/icons.js';
export { useKeyboardFocusVisible } from './generated/mui/useKeyboardFocusVisible.js';
export type { KeyboardFocusVisible } from './generated/mui/useKeyboardFocusVisible.js';
import type { ThemeMode } from './generated/core/index.js';

/** Builds a Tecton-based MUI theme. `options` follow MUI ThemeOptions and win over Tecton defaults. */
export function buildTectonTheme(mode: ThemeMode, options?: ThemeOptions): Theme {
  const overrides = options ? deepmerge(muiCompatOverrides, options) : muiCompatOverrides;
  return createMuiTheme({ mode, overrides });
}
