---
'@tecton-mui/ui': patch
---

DataGrid header filters and column reordering:

- The operator menu names operators in words ("Greater than", not `>`), with the symbol in an
  aligned column, and its arrow keys move through the menu instead of jumping to the grid.
- An operator picked before a value is typed is kept and applies once there is a value.
- Boolean and single-select columns filter with a Tecton `Select` instead of a native `<select>`;
  "Is any of" picks several options there, and takes comma-separated values in text and number
  filters.
- The multi-sort priority number is a filled badge that stands out on the header in both modes.
- Alt+Left/Right on a focused column header moves the column within its pinned section. Moves from
  the column menu also stay within the section, and moves inside a pinned section reorder its
  pinned list.
