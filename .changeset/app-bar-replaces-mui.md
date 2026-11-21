---
'@tecton-mui/ui': minor
---

**Breaking:** `AppBar` is now always the Tecton App Bar and replaces the MUI `AppBar`. It draws the
Tecton layout (branding, tabs, add button) on every render, and its `children` fill the actions
region at the right end instead of being the bar's content. Compose-it-yourself bars (`AppBar` with a
`Toolbar`, title and buttons) move to `appName`, `tabs` and `children`. The MUI root props
(`position`, `sx`, `className`, `component`, `ref`), `tier` and the `MuiAppBar` theme keys still
apply; `position` defaults to `static`. `Toolbar` is still exported.
