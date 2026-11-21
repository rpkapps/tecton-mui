---
'@tecton-mui/ui': patch
---

`AppBar`: the tab strip slides again, as in the Tecton drop-in. An arrow click and bringing a selected
or added tab into view now take 300ms (the theme's `transitions.duration.standard`) with MUI's
easing, instead of jumping. The slide aims at a target recomputed every frame, so an arrow that shows
or hides on the way does not leave the tab short, and it stops when the user wheels, touches, presses
a key or clicks in the strip. Reduced motion (the OS setting) jumps. The scroll arrows are now 48px
wide, the same as the Home tab cell. A strip that has no width yet no longer scrolls on load.
