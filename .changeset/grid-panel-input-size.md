---
'@tecton-mui/ui': patch
---

`DataGrid` toolbar and panel controls are md (32px), as in the Tecton drop-in filter and column
menus:

- The toolbar quick filter is the height of the toolbar buttons beside it; it was 28px.
- The filter panel's column, operator, value and And/Or fields and its **Add filter** / **Remove
  all** buttons are md. **Remove all** shows the filled trash bin, as the drop-in's **Remove All**
  does.
- The columns panel search field is md.

They keep that size at every `density`. A `size` set in `slotProps.baseTextField`,
`slotProps.baseSelect`, `slotProps.toolbar.quickFilterProps` or an operator's
`InputComponentProps` still wins.
