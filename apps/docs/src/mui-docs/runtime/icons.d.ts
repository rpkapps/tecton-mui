// Types for the docs-only `@mui/icons-material/<Name>` shim (see MuiIcon.tsx and the Vite alias).
// An ambient module cannot use a relative `import type`, hence the `import()` type.
declare module '@mui/icons-material/*' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const Icon: import('./MuiIcon').MuiIconShim;
  export default Icon;
}
