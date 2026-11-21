---
'@tecton-mui/ui': patch
---

Outlined inputs in the error state (`TextField`, `Select`, `NumberField`, `NumberSpinner`) keep their
red outline while focused with the mouse. Tecton's focus rule used to reset it to the normal border.
