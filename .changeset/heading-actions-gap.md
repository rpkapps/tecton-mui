---
'@tecton-mui/ui': patch
---

`Heading`: the actions keep their gap from the tabs or the title (`space-400`, `space-200` on a
narrow heading) even when the row is too short for the title. An open `HeadingSearch` field, which
never folds, used to sit right against the tabs (opened from the overflow menu on a heading about
760–900px wide); the title now shortens instead.
