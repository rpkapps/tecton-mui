---
'@tecton-mui/ui': minor
---

New `Heading`: the Tecton page heading (the `<wc-heading>` drop-in of the Tecton drop-in
Storybook), composed from parts, MUI style. `HeadingTitle` is the title, an `<h1>` by default
(`slotProps.title` sets the element and `Typography` variant), with a home button (`onHomeClick`, or
an `href` in `slotProps.homeButton`) and a menu chevron (`onMenuClick`). `HeadingTabs` takes the MUI
`Tabs` props for MUI `Tab` children and shows the Tecton filled tab group on paper. `HeadingActions`
holds the page's actions, MUI components, at the end of the row, in the Figma heading's look.
`Heading` takes `component`, `disableGutters`, `sx` and a ref; `headingClasses` names each part. It
matches the drop-in's ten "Drop-ins / Heading" stories pixel for pixel, at every width.

It behaves as the drop-in does. Above 720px (the heading's own width) it keeps one row: the actions
that do not fit fold into an overflow (⋮) menu before the primary action, which never folds (first
the buttons, then the view toggle, the selects, the icon buttons and the search), and the menu lists
them as menu items read from the components (a select's options as radio items, ...); then the last
tabs fold into a More tab at the end of the tab list, which is selected while the open tab is in
its menu; a title that still does not fit ends with an ellipsis. At 720px and below the heading is
narrow: 16px padding, the tabs one dropdown on a row of their own, the primary action an icon
button.
