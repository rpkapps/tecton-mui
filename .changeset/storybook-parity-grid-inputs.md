---
'@tecton-mui/ui': patch
---

DataGrid and input fixes from the Tecton Storybook comparison:

- DataGrid column headers match the Tecton table: 16px sort and column menu icons in the secondary
  text color and a medium-weight title.
- DataGrid row stripes follow the row index, so they no longer flip while scrolling a virtualized
  or pinned grid.
- The filter panel stays in place when a dropdown inside it opens and the page scrollbar is hidden.
- An outlined `Select` (or `OutlinedInput`) with a `label` keeps its top border closed, like the
  Tecton TextField.
- `Icon` paints its glyph in the content box, so padding on an icon no longer enlarges the glyph.
- The DataGrid filter and columns panels use outlined inputs with a closed border, as in the Tecton
  drop-in filter and column menus.
