---
'@tecton-mui/ui': patch
---

DataGrid popups, search icons and footer use the Tecton drop-in colors in both modes:

- The filter panel is Tecton paper and the columns panel the elevation-2 popover surface (in dark
  mode MUI X painted both a gray that Tecton does not have), without a shadow.
- The column menu uses the action/secondary surface with 32px items and 14px icons.
- The quick filter and columns panel search icons are 20px (they were 12px).
- Footer text uses the secondary text color and the pagination arrows the tertiary action color.
