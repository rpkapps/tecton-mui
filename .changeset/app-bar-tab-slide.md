---
'@tecton-mui/ui': patch
---

`AppBar`: the tab strip slides again, as in the Tecton drop-in. An arrow click and bringing a selected
or added tab into view take 300ms (the theme's `transitions.duration.standard`) with MUI's easing,
instead of jumping. The slide aims at a target recomputed every frame, and stops when the user
wheels, touches, presses a key or clicks in the strip.

The scroll arrows still only show while the strip can scroll their way, but they follow where a
slide is going: an arrow that goes away does so as the slide starts, and one that shows grows in
over the slide, instead of popping in or out when the strip arrives, which made the tabs jump by
an arrow's width (most visibly when adding a tab). They are 48px cells with a divider toward the
tabs, like the Home cell. Reduced motion (the OS setting, or a theme with
`motion.reducedMotion: 'always'`) jumps. A strip that has no width yet no longer scrolls on load.

The tabs and scroll arrows have MUI's click ripple again: the strip had turned motion off for them.
