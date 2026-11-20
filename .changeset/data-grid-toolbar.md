---
'@tecton-mui/ui': minor
---

DataGrid toolbar and filter panel:

- The toolbar filter button now shows when filters are active. The wrapper filters rows itself and
  gives the Community grid an empty filter model, so Community's count was always 0. The default
  toolbar (`showToolbar`) is rebuilt from the public toolbar parts with the same controls and
  `slotProps.toolbar` options, and `@tecton-mui/ui/DataGrid` exports a `FilterPanelTrigger` whose
  `render` / `className` functions receive the real `filterCount`.
- Theme correction: the toolbar, filter panel, density, undo/redo and actions icons use Tecton icons
  instead of Material icons.
- Docs: default toolbar, custom toolbar and filter panel examples.
