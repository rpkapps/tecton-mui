---
'@tecton-mui/ui': patch
---

Inputs reached with the keyboard (`TextField`, `Select`, `Autocomplete`, `NumberField`,
`NumberSpinner`) show the Tecton focus ring; a field clicked with the mouse still shows none. The
`ThemeProvider` marks the keyboard-focused input root with `data-tecton-focus-visible`, and Tecton's
`.Tecton-focusVisible` rules match it as well. On a `NumberSpinner` the ring surrounds both buttons
and the value.
