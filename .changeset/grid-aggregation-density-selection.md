---
'@tecton-mui/ui': patch
---

DataGrid fixes:

- A selected row is one color across its whole width (the area after the last column used a
  different shade).
- `NativeSelect` (also the grid's boolean and single-select header filters) uses the Tecton chevron
  instead of the Material triangle.
- Docs and README: grouping, aggregation and pinning examples use `initialState`, so the column
  menu can change them (a controlled `aggregationModel` / `rowGroupingModel` without its change
  handler ignores the menu, as in MUI). New Density example (`density="compact"`).
- Opening the filter panel moves the focus into it (it stayed on the toolbar button); Escape returns
  it to the button.
- An outlined Autocomplete (also the filter panel's "is any of" input) keeps room for its clear and
  popup buttons; the text and chips no longer run under them.
- The toolbar's active-filter dot sits on the corner of the filter icon.
- While a typed filter value is being applied, the value input shows a small Tecton progress
  indicator instead of Material's sync icon.
- A hovered row shows only the hover fill, without the stroke (selected rows keep theirs).
- The filter panel's value input takes the rest of the row, so "is any of" values stay on one line.
