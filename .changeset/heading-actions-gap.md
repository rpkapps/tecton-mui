---
'@tecton-mui/ui': patch
---

`Heading`: the actions keep a gap from the tabs or the title, the space between two actions
(`space-200`, `space-100` on a narrow heading), even when the row is too short for the title. An
open `HeadingSearch` field, which never folds, used to sit right against the tabs (opened from the
overflow menu on a heading about 760–900px wide); the title now shortens instead.
