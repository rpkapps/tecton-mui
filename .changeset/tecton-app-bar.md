---
'@tecton-mui/ui': minor
---

`AppBar` renders the Tecton App Bar (React version of the Tecton `<wc-app-bar>` drop-in) when given
navigation props: branding (`appName`, `logo`, `logoSrc`), icon-only `fixedTabs`, closeable `tabs`
with icons and tags, the add button (`maxTabs`, `disableTabAdd`), `tier="secondary"`, and
`children` as the actions at the right end. The page owns the data through `onTabSelect`,
`onTabClose` and `onTabAdd`. It looks and behaves like the drop-in, with keyboard additions: Delete
or Backspace closes the active tab, and focus moves to the newly active tab when the focused tab or
the add button goes away. Without navigation props, `AppBar` is the MUI `AppBar`, unchanged.
