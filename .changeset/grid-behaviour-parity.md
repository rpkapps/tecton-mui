---
'@tecton-mui/ui': minor
---

DataGrid behaviour parity with the MUI grid:

- Column and row drag show a floating ghost and slide the other columns/rows live; Escape cancels;
  dragging near an edge auto-scrolls. The dragged row stays as a dimmed placeholder.
- Row selection persists across pages; the header checkbox selects every filtered row (new
  `checkboxSelectionVisibleOnly` limits it to the current page). Rows removed from the data leave
  the selection unless `keepNonExistentRowsSelected`.
- Cell range selection: Shift+Arrow extends ranges, ranges get a perimeter border, dragging no
  longer creates a native text selection, and Ctrl/Cmd+C always copies the range.
- Ctrl/Cmd+V pastes into the grid instead of opening an editor on the focused cell.
- Space toggles group rows (row grouping and tree data); the row-reorder handle keeps focus after a
  click so Alt+Arrow works.
- Fixes: header checkbox lost its Community class (misaligned); doubled header divider; hovered and
  selected rows shifted cells by 1px; Emotion RTL cache crashed on inputs (mismatched stylis
  prefixer).
