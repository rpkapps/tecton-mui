---
'@tecton-mui/ui': patch
---

`DataGrid`: the advanced features work in server-rendered pages. After hydration the Community grid
renders its root one render late, and the features that listen on the root looked for it only once,
so they never started: cell range selection, copy and paste, undo/redo shortcuts, Alt+Arrow column
moves, column and row drag reordering, resizing right-pinned columns, the sticky offsets and scroll
shadows of pinned columns, and `onRowsScrollEnd`. With pinned columns, hydration also threw
(`Cannot read properties of undefined (reading 'store')`), which unmounted the whole React root.
These features now attach as soon as the grid root mounts.
