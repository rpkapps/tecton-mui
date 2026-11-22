---
'@tecton-mui/ui': patch
---

Keyboard focus shows the Tecton focus ring on every button-like control. The theme sets MUI's
`theme.focusVisible` to Tecton's ring, so `ToggleButton`, contained `ButtonGroup`, `Pagination`,
`BottomNavigationAction`, `StepButton`, `TableSortLabel`, `CardActionArea`, digital clock time slots
and links get it (menu items keep their focus fill), and `Tab` and `ListItemButton` draw it inside
so the tab strip or a scrolling list no longer cuts it off. Pass `createTheme({ focusVisible: false
})` to keep Tecton's previous rings.
