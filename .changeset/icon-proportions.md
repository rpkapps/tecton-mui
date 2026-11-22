---
'@tecton-mui/ui': patch
---

Icons that MUI components draw from the theme are sized like the icons around them:

- `Pagination` and `TablePagination` first / last page buttons draw two regular chevrons,
  centred. The `-small` chevrons made them look a size smaller than the previous / next buttons.
- A completed `Step` draws a full 24px check disc, like the numbered steps beside it; it was a
  20px disc.
- `Tabs` scroll arrows and the `DateTimePicker` date / time tab icons are 20px (`icon-size-150`).
  They took the tab's 14px text size.
- `DataGrid` header filters end a placeholder that does not fit with an ellipsis instead of cutting
  it mid-letter.
