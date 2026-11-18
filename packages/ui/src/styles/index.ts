// Public `@tecton-mui/ui/styles` entry. Mirrors `@mui/material/styles`; ThemeProvider and
// createTheme are Tecton-preconfigured replacements with MUI-compatible signatures.
export * from '@mui/material/styles';
export { ThemeProvider } from './ThemeProvider.js';
export type { ThemeProviderProps } from './ThemeProvider.js';
export { createTheme, getDefaultTheme } from './createTheme.js';
export { initTecton, getThemeManager, useTectonMode, useTectonModeValue } from './modeStore.js';
export type {
  TectonModeApi,
  ThemeMode,
  ThemeModePreference,
  ThemeManagerConfig,
} from './modeStore.js';
export { getRtlCache } from './rtl.js';
export { TectonModeScript, TectonTokensStyle, getTectonModeScript } from './ssr.js';
export type { TectonModeScriptOptions } from './ssr.js';
export {
  cssVar,
  useKeyboardFocusVisible,
  TECTON_VERSION,
  tectonPaletteLight,
  tectonPaletteDark,
  spacing as tectonSpacing,
  borderRadius as tectonBorderRadius,
  borderWidth as tectonBorderWidth,
  iconSize as tectonIconSize,
  textStyles as tectonTextStyles,
  fontFamilies as tectonFontFamilies,
} from './tecton/index.js';
export type { KeyboardFocusVisible, TectonThemeManager } from './tecton/index.js';
