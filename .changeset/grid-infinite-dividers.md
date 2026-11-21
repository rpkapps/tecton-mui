---
'@tecton-mui/ui': minor
---

DataGrid:

- `onRowsScrollEnd` and `scrollEndThreshold` (same props as the MUI grid): infinite scrolling for
  client rows. The handler fires when the user scrolls near the last row, and while the rows do not
  fill the viewport.
- Infinite loading: with `lazyLoading` and a data source that returns no `rowCount`, the grid now
  stops exactly at the last row (several chunks past the end could leave placeholder rows) and a
  short first chunk ends the grid.
- Row dividers: a 1px line between rows (Tecton's grid theme removed them). All grid dividers (rows,
  header, footer, pinned sections) use `color-divider`, as the Tecton table; the first row of pinned sections and the empty filler cell no longer draw stray lines.
