---
'@tecton-mui/ui': minor
---

Picker visuals now match the official Tecton Storybook: the selected `PickerDay` uses MUI's own
selected style (as the Storybook renders it) instead of an alias of Tecton's never-matching
`.MuiPickerDay-selected` rule. Range pickers look like the Community pickers: the toolbar uses the
Community toolbar geometry with `h4` endpoint values in the `shortDate` format (new
`slotProps.toolbar.toolbarFormat`), the view is centered in wide layouts, and static range pickers
show Cancel / OK and commit with OK by default (`closeOnSelect` defaults to `false`, as in
`StaticDatePicker`).
