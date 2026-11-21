---
'@tecton-mui/ui': patch
---

DataGrid:

- Right-pinned columns can be resized: their resize handle sits on the column's start edge (as in
  the MUI grid) instead of the grid's outer edge, where it could not be grabbed.
- The column resize handle is MUI's size again (a 2px x 14px bar in a 24px box) and turns Tecton's
  interactive text color on hover, focus and while resizing.
- One focus ring: a cell or header no longer draws its ring around a focused control that has its
  own (header filter inputs, checkboxes, icon buttons).
- SpeedDial: the add icon is 24px and centered.
