// A second, independent copy of MUI on the page: its CommonJS build, aliased as
// `mui-second-copy/*` in vite.config.ts and pre-bundled on its own. It brings its own
// ModalManager, FocusTrap and Emotion, as a micro-frontend that bundles its own MUI (or an older
// version of the library) does. Its modals carry no library registration: copy "unknown".
import type * as React from 'react';
import * as dialog from 'mui-second-copy/Dialog';
import * as button from 'mui-second-copy/Button';
import * as styles from 'mui-second-copy/styles';

type Exports = Record<string, unknown> & { default?: unknown };
// CommonJS interop: the exports may arrive wrapped once more.
const exportsOf = (ns: Exports): Exports => {
  const inner = ns.default as Exports | undefined;
  return inner && typeof inner === 'object' && inner.__esModule ? inner : ns;
};

type Props = React.PropsWithChildren<Record<string, unknown>>;
export const SecondDialog = exportsOf(dialog).default as React.ComponentType<Props>;
export const SecondButton = exportsOf(button).default as React.ComponentType<Props>;
export const SecondThemeProvider = exportsOf(styles).ThemeProvider as React.ComponentType<Props>;
export const createSecondTheme = exportsOf(styles).createTheme as () => object;
