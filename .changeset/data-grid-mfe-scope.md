---
'@tecton-mui/ui': patch
---

`DataGrid`: a cell selection no longer highlights cells in a grid of another React root. The
selection stylesheet was scoped with a class built from `useId()`, which repeats across roots that
hydrate from server-rendered markup or that each bundle their own React, so two micro-frontends'
grids could share the scope. Grids now get a page-unique `data-tecton-grid-scope` attribute, shared
even between two copies of the library, and the root no longer carries the `tdg-…` class.

The hosted micro-frontend guide, the SSR guide and the README now recommend a unique
`identifierPrefix` for every React root on the page, so labels and `aria-*` ids of components in
different roots cannot collide.
