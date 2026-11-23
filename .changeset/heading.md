---
'@tecton-mui/ui': minor
---

New `Heading`: the Tecton page heading (the "Organisms / Heading" stories of the Tecton Storybook),
composed from parts, MUI style. `HeadingTitle` is the title, an `<h1>` by default
(`slotProps.title` sets the element and `Typography` variant), with a home button (`onHomeClick`, or
an `href` in `slotProps.homeButton`) and a menu chevron (`onMenuClick`). `HeadingTabs` takes the MUI
`Tabs` props for MUI `Tab` children and shows the Tecton filled tab group on paper. `HeadingActions`
holds the page's actions at the end of the row. `Heading` takes `component`, `disableGutters`, `sx`
and a ref; `headingClasses` names each part. It matches all eight Storybook stories pixel for pixel,
and when the row does not fit it wraps (the actions first, then the tabs and their pills) instead of
overflowing the page.
