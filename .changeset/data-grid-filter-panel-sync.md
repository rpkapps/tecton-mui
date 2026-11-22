---
'@tecton-mui/ui': patch
---

DataGrid header filters and the filter panel edit the same conditions. A value typed in a header
filter shows in the filter panel, a condition set in the panel shows in its column's header filter,
and **Remove all** clears both. Before, each kept its own conditions, so the same column could be
filtered twice without the panel showing it.

The filter panel without conditions shows only its actions, with no empty space above them, and
keeps the keyboard on **Add filter** after the last condition is removed. With
`disableMultipleColumnsFiltering`, **Add filter** stays available while there is no condition.
