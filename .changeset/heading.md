---
'@tecton-mui/ui': minor
---

New `Heading`: the Tecton page heading (the "Organisms / Heading" stories of the Tecton Storybook),
composed from parts, MUI style. `HeadingTitle` is the title, a `Typography` that is an `<h1>` by
default and takes the `Typography` props (`component`, `variant`). A home button and a menu chevron
are plain `IconButton`s placed before and after it in the `Heading`, which sets them beside the
title and measures them with it. `HeadingTabs` takes the MUI
`Tabs` props for MUI `Tab` children and shows the Tecton filled tab group on paper. `HeadingActions`
holds the page's actions at the end of the row. `Heading` takes `component`, `disableGutters`, `sx`
and a ref; `headingClasses` names each part. It matches all eight Storybook stories pixel for pixel.

The row never wraps. When it runs out of room, its parts give way in turn (priority+): the actions
move into an overflow (⋮) button whose tray shows them as they are, first to last, keeping the last
(primary) one; then the tab group narrows and scrolls with arrows, like the app bar's tabs (the
selected tab kept in view, the edges it can scroll past faded out); then the primary action. A very narrow heading gives the tabs a row of their own and shortens the title with
an ellipsis. The gutters follow the heading's own width (72px, 32px, 16px).
