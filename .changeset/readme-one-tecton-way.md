---
'@tecton-mui/ui': patch
---

README: dates and icons have one documented way. Pickers use `date-fns` and native `Date` values
(the Day.js, Luxon and Moment adapter examples are gone), and every icon is a Tecton `Icon` (the note
that `SvgIcon` and plain SVG children still work is gone). No code changes: the other date adapters
and `SvgIcon` remain exported.
