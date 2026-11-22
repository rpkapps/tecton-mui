---
'@tecton-mui/ui': minor
---

`NumberRangeSlider`: drag the tinted part of the bar between the two thumbs to move the whole range.
Both values move by the same amount, so the width stays, and the range stops at `min` and `max`. A
press between the thumbs no longer moves the nearer thumb; it only grabs the range. The cursor shows
what a press does: `grab` (and `grabbing` while dragging) between the thumbs, and the sideways
`ew-resize` on the thumbs, which have a wider grab area, and on the rest of the bar.
