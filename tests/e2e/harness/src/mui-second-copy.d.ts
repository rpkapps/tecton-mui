// MUI's CommonJS build under another name (vite.config.ts); see secondMuiCopy.ts.
declare module 'mui-second-copy/*' {
  const exports: Record<string, unknown>;
  export = exports;
}
