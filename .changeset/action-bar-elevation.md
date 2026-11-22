---
'@tecton-mui/ui': minor
---

`ActionBar` and `ActionBarGroup` take `elevation`, the Figma `<Paper>` elevation of the groups,
which sets their background: `0` the page background (`color-bg-default`), `1` the `Paper`
background (`color-bg-paper`, the default, unchanged) and `2` the raised surface of a `Dialog`
(`color-surface-elevation-2-bg`: white in light mode, black in dark mode). Set it on the bar for all
its groups, or on one group.
