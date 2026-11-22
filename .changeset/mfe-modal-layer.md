---
'@tecton-mui/ui': patch
---

Dialogs, drawers, popovers, menus and select menus of different copies of the library on one page
(micro-frontends that each bundle `@tecton-mui/ui`, in any version) now stack like modals of one
copy. Every copy of MUI tracks its own open modals, so a dialog of one copy over a dialog of another
made the two focus traps take the focus from each other (the page threw "Maximum call stack size
exceeded"), and closing them out of order unlocked page scrolling while a dialog was still open,
exposed the page behind it to assistive technology, or left scrolling locked for good.

`ThemeProvider` now installs a page-level modal layer: only the top modal takes the focus (lower
modals of other copies are `inert`), page scrolling stays locked until the last modal closes and
then gets the page's own style back, the page behind the top modal stays hidden from assistive
technology, and the focus returns to the modal below when the top one closes. Nothing to set up;
with modals of one copy the layer changes nothing. When several library versions are on the page,
the newest layer runs and takes over from an older one.
