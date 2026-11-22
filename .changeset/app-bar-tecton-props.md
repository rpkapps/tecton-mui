---
'@tecton-mui/ui': patch
---

`AppBar`: `productColor` now colors the built-in logo and app name (it was published as
`--tecton-appbar-product-color` but nothing in the bar used it), and `tier` and `productColor` no
longer reach the root element. `tier` rendered as an invalid `tier` attribute on the `<header>`,
and `productColor` made React warn about an unknown DOM prop. The `MuiAppBar` theme variants still
match both props, and a custom `component` still sets the root element. The docs list the branding
regions (`branding`, `branding-lockup`, `branding-logo`, `branding-name`) for restyling the lockup.
