---
'@tecton-mui/ui': patch
---

`AppBar`: the tab strip scrolls exactly as the Tecton drop-in's (`<wc-app-bar>` 1.2.0) does. It is
MUI's scrollable `Tabs` again, with the drop-in's patch, in place of the library's own scrolling
engine, which this replaces (it was never released):

- MUI's 40px scroll arrows. An arrow shows while the strip can scroll its way (MUI's
  IntersectionObserver), and takes no room while it cannot. Below the theme's `sm` breakpoint (600px)
  there are none, as in MUI.
- A click scrolls by the tabs that fit, and a selected or added tab is scrolled into view, as MUI
  does, over the theme's `transitions.duration.standard` (with reduced motion, at once).
- As in the drop-in: when the start arrow shows, the tabs stay where they are, and when the end
  arrow shows at the end, the strip stays at its end. While the strip is at its start, its scroll
  padding keeps a selected tab clear of the start arrow's room.

The drop-in's quirks come with it: the arrows can lag a click or a resize, the tabs move by an
arrow's width when the start arrow hides (in RTL, also when it shows), and an added tab can stay
partly under the end arrow.
`AppBarActions` now counts MUI's arrow width (and none below 600px) when it decides whether the
actions fold into ⋮. The keyboard additions, the focus handling and the accessibility fixes over the
drop-in are unchanged.
