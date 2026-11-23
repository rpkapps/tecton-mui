---
'@tecton-mui/ui': minor
---

New `HeadingSearch`, so that search in a `Heading` works: a Search button that opens into a search
field in place, among the heading's actions. It takes `value` / `defaultValue` and
`onChange(event, value)` like a field, `open` / `onOpen` / `onClose(event, reason)` for the
field, and `size` (`medium` by default, like the buttons and inputs beside it, or `small`). The field grows out of
the button toward the start of the row, the actions before it moving over smoothly (no motion with
reduced motion). It opens focused; Escape clears it, then closes it and gives the focus back to the
button; it only closes empty, so a search in progress stays on show. In a narrow heading, a closed
search collapses into the overflow tray after the other secondary actions and opens in the tray;
an open one keeps its place while the other actions and the tabs make room. New `headingClasses`:
`search`, `searchButton`, `searchField`.
