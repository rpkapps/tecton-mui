---
'@tecton-mui/ui': minor
---

New `Heading`: the Tecton page heading (the "Organisms / Heading" stories of the Tecton Storybook),
composed from parts, MUI style. `HeadingTitle` is the title, an `<h1>` by default
(`slotProps.title` sets the element and `Typography` variant), with a home button (`onHomeClick`, or
an `href` in `slotProps.homeButton`) and a menu chevron (`onMenuClick`). `HeadingTabs` takes the MUI
`Tabs` props for MUI `Tab` children and shows the Tecton filled tab group on paper. `HeadingActions`
holds the page's actions at the end of the row. `Heading` takes `component`, `disableGutters`, `sx`
and a ref; `headingClasses` names each part. It matches all eight Storybook stories pixel for pixel.

The row never wraps. When it runs out of room, its parts give way in turn (priority+): the actions
move into an overflow (⋮) button whose tray shows them as they are, first to last, keeping the last
(primary) one; then the tab group narrows and scrolls with arrows, like the app bar's tabs (the
selected tab kept in view); then the primary action. A very narrow heading gives the tabs a row of their own and shortens the title with
an ellipsis. The gutters follow the heading's own width (72px, 32px, 16px).
