---
'@tecton-mui/ui': patch
---

`AppBar`: an added (or newly selected) tab now always ends fully in view. Before, every second tab
added to a full strip stayed partly hidden under the end scroll arrow, which then stayed visible:
the arrow appeared after the strip had scrolled the tab into view and narrowed it (the Tecton
drop-in does the same). Scrolling the strip yourself is never undone.
