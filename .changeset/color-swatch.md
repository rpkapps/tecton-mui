---
'@tecton-mui/ui': minor
---

Add `ColorSwatchControl`, the Tecton color input (Storybook "Atoms/Color Swatch"), at
`@tecton-mui/ui/ColorSwatchControl` and as a root export, with `colorSwatchControlClasses` and
`normalizeColorSwatchControlValue`. It shows a swatch of the color beside its uppercase hex value,
styled as a small (28px) or medium (32px) filled input, and opens the browser's color picker. The
control is a native `<input type="color">`: it takes `value`, `defaultValue` and
`onChange(event, value)`, plus `onChangeCommitted` for the color the user settles on, `inherited`,
`disabled`, `name`, `id` and `inputRef`. Keyboard focus shows the pink Tecton focus ring
(`color-focus-ring`), not the saffron ring of the Storybook story. The name matches the Storybook
code; the value is a hex string rather than the snippet's `{ hex }` object.
