---
'@tecton-mui/ui': minor
---

`AppBarActions` collapse into an overflow (⋮) button on a narrow bar.
The tabs scroll to make room first; only when even the narrowest tab strip (the selected tab between
its arrows, and the add button) leaves too little room do the actions collapse, first to last, so the
last (primary) one stays the longest. The button opens a tray that shows them as they are. New
`slotProps.overflowButton` and `slotProps.overflowTray`; stable classes
`TectonAppBar-overflowButton` and `TectonAppBar-overflowTray`. The collapsing is shared with
`HeadingActions` (`internal/overflow`).
