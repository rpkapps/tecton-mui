---
'@tecton-mui/ui': patch
---

DataGrid:

- Right-pinned columns can be resized: their resize handle sits on the column's start edge (as in
  the MUI grid) instead of the grid's outer edge, where it could not be grabbed.
- The column resize handle looks like MUI X 9's: a 1px full-height bar that widens to a 3px rounded
  bar on hover, while resizing and on touch devices, in Tecton's interactive text color.
- One focus ring: a cell or header no longer draws its ring around a focused control that has its
  own (header filter inputs, checkboxes, icon buttons).
- SpeedDial: the add icon is 24px and centered.
- Docs: nested light/dark sections need `data-theme` on the section (theming guide); the Paper
  elevation, customized list and dark AppBar examples set it.
