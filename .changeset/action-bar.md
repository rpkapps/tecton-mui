---
'@tecton-mui/ui': minor
---

Add `ActionBar`, the Tecton vertical tool palette (Figma "Action Bar"). `@tecton-mui/ui/ActionBar`
exports `ActionBar`, `ActionBarGroup`, `ActionBarButton`, `ActionBarToolMenu`, `ActionBarTool`,
`ActionBarSelect` and `actionBarClasses`; all are also root exports. The bar keeps one current tool
(`value`, `defaultValue`, `onChange`) and follows the WAI-ARIA toolbar pattern: one tab stop, roving
focus with the arrow keys, Home and End. Tool sets (`ActionBarToolMenu`) show the tool picked last
and open a menu of their tools on long press, right-click or the arrow key toward the menu.
`alignment` docks the bar left or right (mirrored in RTL). Surfaces, buttons, tooltips, menus and
selects use the theme and the Tecton tokens of the Figma component.
