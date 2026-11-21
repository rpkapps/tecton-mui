---
'@tecton-mui/ui': minor
---

`ActionBar` follows the Figma component more closely:

- `ActionBarGroup` takes `orientation="horizontal"` to put its controls in a row, for Figma's
  double dropdown (two `ActionBarSelect`s side by side). Left and Right move between the controls
  of a row (mirrored in RTL); Up and Down still move along the bar.
- `ActionBarSelect` insets its value like Figma: 4px from the edge (12px filled), so the text no
  longer touches the group's edge.
- `ActionBarTool` icons are 20px (`icon-size-150`), the size they have on the bar's buttons, in a
  32px menu row; they were the 14px text size.
