---
'@tecton-mui/ui': patch
---

`AppBar`: on a narrow tab strip, the scroll arrows page by whole tabs instead of by the Home tab's
48px. A page was MUI's: the tabs that fit, counted from the first tab wherever the strip was, which
stopped at Home once Home and the first tab were wider than the strip.

A click now moves the strip about its width in whole tabs, counted from where it is: the tab cut
off at the edge moves to the other edge. A tab cut off by a sliver (48px, less on a very narrow
strip) counts as shown and the strip moves past it; when that tab is about as wide as the strip or
wider, the strip moves one strip width; a page that would stop within a sliver of the end goes to
the end. Wide strips page about as before. In RTL the arrows mirror.
