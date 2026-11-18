---
'@tecton-mui/ui': patch
---

DataGrid:
- A failing server group load is no longer re-requested on every render.
- `refetchRows()` now reaches the server.
- Server data resets local row patches.
- Server tree data works without `getGroupKey`.
- Re-adding a deleted row id no longer duplicates the row.
- Sorting by the grouping column orders groups.
- Paste respects `isCellEditable`, reports rejected updates and always pairs the paste start/end callbacks.
- Header filter dates use local time.
- Column drag targets include virtualized columns.
- Inline `slots`/`slotProps` keep their identity.
- Copy and paste look rows up in O(1).

Pickers:
- Finishing the end time first keeps the TimeRangePicker open for the start time.
- A controlled value set by the parent no longer fires `onAccept` on close.
- A nested `LocalizationProvider` without `dateAdapter` keeps the parent's adapter.
