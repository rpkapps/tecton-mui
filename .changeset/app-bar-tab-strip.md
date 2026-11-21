---
'@tecton-mui/ui': patch
---

`AppBar` tab strip: added, selected and closed tabs are in view at once, and the scroll arrows show
exactly while the strip can scroll their way. The previous fix still waited on MUI's timing, which
on some machines left a newly added tab hidden under the end arrow for about a second. The arrows
now follow the strip's scroll position instead of MUI's IntersectionObserver (which could also leave
a start arrow on at the start, or an end arrow at the end), and the selected tab is scrolled into
view before the browser paints. Clicking an arrow scrolls a page with the browser's smooth
scrolling.
