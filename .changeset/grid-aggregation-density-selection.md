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
