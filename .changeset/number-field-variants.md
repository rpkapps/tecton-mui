---
'@tecton-mui/ui': minor
---

`NumberField` and `NumberSpinner` get a `variant` prop: `outlined` (default) or `filled`, styled like
the matching `TextField` variant. In a filled `NumberSpinner` the buttons share the input's fill.
`slotProps.input` reaches the `FilledInput` in the filled variant (new type
`NumberFieldFilledInputSlotProps`).
