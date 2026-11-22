---
'@tecton-mui/ui': minor
---

`AppBar` is composed from parts that follow MUI's `Tabs` and `Tab`, replacing the props copied from
the `<wc-app-bar>` drop-in. **Breaking:** `appName`, `logo`, `logoSrc`, `fixedTabs`, `tabs`,
`activeTab`, `maxTabs`, `disableTabAdd`, `onTabSelect`, `onTabClose` and `onTabAdd` are removed, as
are the `AppBarTab`, `AppBarFixedTab`, `AppBarIconName` and `AppBarNavigationProps` types.
`productColor` is removed too: the branding colors fall below 4.5:1 for the app name (app2 and app4
down to 3.1:1), so the logo and the name keep the tertiary text color. The MUI `AppBar` color and
surface props (`color`, `enableColorOnDark`, `elevation`, `square`, `variant`) are no longer
accepted: the theme sets them, so they had no effect.

- `AppBarBrand`: the product mark (`logo`: a Tecton `Icon`, an MUI `SvgIcon`, an `<img>` or any
  element; left out, the placeholder square; `null`, none) and the app name as children.
- `AppBarTabs`: the MUI `Tabs` props (`value`, `onChange(event, value)` and the rest), plus `onAdd`,
  which shows the add button, and `attached`, which opens the selected tab into the content below
  (`true` for the page background, or the content's color as a theme palette path such as
  `'background.paper'` or a CSS color).
- `AppBarTab`: the MUI `Tab` props (`value`, `label`, `icon`, `disabled` and the rest), plus
  `onClose`, which gives the tab a close button, and `tags`. Without a `label` it is an icon-only cell
  such as Home. A Tecton `Icon` shows filled on the selected tab unless it sets its own `variant`.
- `AppBarActions`: the actions at the end of the bar.

`AppBar` draws the Tecton row itself, keeps the MUI root props (`position`, now `static` by
default, `sx`, `component`, `ref`) and `tier`, and renders only the parts it is given. The API
reference documents each part. The look and the behaviour (scroll arrows, the close button next
to the tab, Delete/Backspace to close, focus after a close or add) are unchanged.
