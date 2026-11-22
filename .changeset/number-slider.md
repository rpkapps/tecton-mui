---
'@tecton-mui/ui': minor
---

New `NumberSlider` and `NumberRangeSlider`: a filled number input next to a bar that shows where the
value sits between `min` (default 0) and `max` (default 100). Pressing or dragging the bar sets the
value, snapped to `step`. `NumberRangeSlider` takes a `[start, end]` value, draws a thumb at each end
and shows both numbers in one input. Units go in `slotProps.input.endAdornment`. The value handling,
formatting and keyboard stepping are those of `NumberField`.

`NumberField` and `NumberSpinner` accept `slotProps.input.endAdornment`, for example an
`InputAdornment` with a unit. `NumberField` shows it before the stepper buttons and `NumberSpinner`
centres it with the value. A unit in the adornment of any number field uses the small text style.
