---
'@tecton-mui/ui': minor
---

DataGrid fixes:

- One set of scrollbars: the virtual scroller no longer shows its native scrollbars next to the
  grid's own (the thin-scrollbar style re-enabled them). This also fixes rows jumping by the
  scrollbar size when scrolling sideways after scrolling to the bottom.
- The last rows can be scrolled fully into view with header filters and with pinned or total
  rows (the pinned sections are added to the scroll range); the scrollbar lane under the total
  row has the footer surface.
- Multi-sort priority numbers sit on the sort arrow instead of above the header text.
- Group labels count the rows in the group (as the MUI grid does), and group and total rows use
  the medium weight on their cells.
- The column menu no longer shows two dividers in a row (or one at the start or end) when a
  section is empty for the column.
- Column reordering marks the drop slot (tinted, outlined, muted content) and stops header hover
  effects and tooltips while dragging.
- Row reordering in scrolling, virtualized grids: the upper auto-scroll zone starts below the
  headers (dragging up scrolled only over the headers), the dragged row keeps its slot paint when
  it remounts, a drop line shows where it lands while it is scrolled out of view, and rows that
  scroll into view during the drag no longer slide in.
- Keyboard: Tecton removes the focus outline of cells and headers, so a theme correction draws the
  Tecton focus ring on keyboard focus. The header filter row is part of arrow-key navigation, and
  Up/Down step over open detail panels.
- The empty space after the last column no longer looks like an extra column (no separator line,
  header-filter row painted to the edge).
- Without pagination the footer shows the total row count; new `hideFooterRowCount` prop hides it.
