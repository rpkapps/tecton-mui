# Storybook parity report

Visual comparison of `@tecton-mui/ui` with the official Tecton MUI Storybook **0.10.1**
(`https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/storybook-mui/0.10.1/`), rendered
with the Tecton UMD theme **0.11.2**, the same Tecton source our adapter generates from.

## What the Storybook runs

- The story bundles carry their **own MUI build**, not the UMD's copy: MUI Material 9 (the Button
  class list has no removed `textPrimary`-style variant classes, as in our 9.5.0) and MUI X 9
  pickers (`MuiPickerDay`, `MuiPickersTextField`, `.Mui-selected` on days). React 19.2.8 (ours
  19.3.1). No MUI version difference showed up in any screenshot.
- The theme is `window.WebframeworkTectonMui.createMuiTheme({ mode })` from the 0.11.2 UMD:
  Tecton's verbatim theme, **without** a compat layer.
- Global decorator: `layout: 'padded'` (body `padding: 1rem`) plus a `padding: 24px`,
  `min-height: 100vh` box painted with `--tecton-color-bg-default`. The mode comes from Tecton's
  theme manager (`localStorage['tecton-theme-mode']`).

## Method

1. No source maps are published, so the story modules (`assets/*.stories-*.js`) were decompiled
   to JSX (imports resolved to MUI component names; `play` functions and docs parameters
   dropped) and turned into harness modules,
   `tests/e2e/harness/src/storybook/stories/<Component>.tsx`, with one entry per story id rendered
   with `@tecton-mui/ui`. `Date.tsx` was written by hand from the same code, because the Storybook
   inlines the MUI X pickers. `StorybookScenario.tsx` reproduces the preview layout. Route:
   `/?scenario=sb:<story-id>`.
2. Both sides are captured at 1280×900, `deviceScaleFactor: 1`, full page, in the same mode, with
   fonts loaded, transitions/animations disabled and grayscale text antialiasing
   (`--disable-lcd-text`, see the menu note under Documented differences). Focus is blurred and the pointer parked, as
   the Storybook's `afterEach` does. Storybook `play` functions are stripped from the story
   bundles by request interception, so both sides are compared in their initial render state.
   Several plays click, type or hover: they open drawers, expand accordions and select tabs.
3. A pixel differs when one RGB channel differs by more than 24/255. The result is the share of
   differing pixels, and the page sizes must be equal.

Scope: all 240 `Atoms/*`, `Molecules/*` and `Organisms/*` stories except the Table, Filtering and
Inline Editing placeholders, in both modes (480 comparisons). Extra scenarios
(`stories/PickersExtra.tsx`, `stories/TreeExtra.tsx`) compare our clocks, range pickers and
`RichTreeView` with the closest stories.

`tests/e2e/storybook-parity.spec.ts` re-runs 64 cases in both modes (128 tests) live against the
CDN. The tolerance is 0.05 % differing pixels, or 0.6 % for the range picker against the `Range`
story. The suite skips itself when the CDN is unreachable, unless `STORYBOOK_PARITY_REQUIRED=1`.
Behind a proxy, run it with `NODE_USE_ENV_PROXY=1`.

## Summary (after fixes)

| Category  | Stories | Pixel-identical in both modes |
| --------- | ------- | ----------------------------- |
| Atoms     | 98      | 98                            |
| Molecules | 112     | 112                           |
| Organisms | 30      | 30                            |
| **Total** | **240** | **240**                       |

All 240 stories were pixel-identical in both modes when the suite was written; the five
"Organisms / App Bar" stories have since been retired (see Drop-ins: App Bar). Before the fixes, the picker stories with a
selected day differed (`organisms-date--range` 0.075 %, `organisms-date--examples` 0.071 %). The
first pass ran with `play` functions active and showed differences that came only from story
interaction state: accordion and drawer stories opened by their play, tabs selected by a click,
focus left on menus. Stripping the plays removed all of them.

## Fixes

| Area          | File                                                                                                             | Change                                                                                                                                                                                                                                                                                                                                  | Reason                                                                                                                                                                                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme compat  | `packages/ui/src/styles/tecton/compat.ts`                                                                        | Removed the PickerDay state alias (`.MuiPickerDay-selected` → `.Mui-selected`, `-disabled`, `today`)                                                                                                                                                                                                                                    | Tecton 0.11.2 styles `.MuiPickerDay-selected` / `-disabled`, which MUI X 9 never renders, so the Storybook shows MUI's own selected day: `primary.main` fill (`#644a78` light) under Tecton's text color. Our alias painted it `--tecton-color-action-primary-bg-active` (`#765292`). We now render exactly what the Storybook renders. |
| Range pickers | `packages/ui/src/internal/range-pickers/RangePickerParts.tsx`                                                    | Toolbar rebuilt on the Community toolbar geometry: `16px 24px` padding, overline title in `text.secondary`, `h4` endpoint values as plain text buttons (`text.secondary`, the edited endpoint `text.primary`), no fixed button height. The view is centered in wide layouts (auto inline margins, like the Community `margin: 0 auto`). | To match the Storybook "Range" story (a `StaticDatePicker`): its toolbar, its centered 320 px calendar and its header/grid position.                                                                                                                                                                                                    |
| Range pickers | `packages/ui/src/internal/range-pickers/RangePicker.tsx`, `pickerTypes.ts`                                       | Static range pickers default to `closeOnSelect: false` with a Cancel / OK action bar (Cancel restores the last accepted value). Toolbar values use `shortDate` for date ranges; new `slotProps.toolbar.toolbarFormat`.                                                                                                                  | The Community static pickers (and the Storybook story) show Cancel / OK and commit with OK. AGENTS.md §7: with no advanced props, behave like the Community counterpart.                                                                                                                                                                |
| Tests         | `DateRangePicker/tests/DateRangePicker.test.tsx`, `styles/tests/ThemeProvider.test.tsx`                          | Static OK / Cancel / `closeOnSelect` / `toolbarFormat` tests. The compat test now asserts that no alias is added.                                                                                                                                                                                                                       |                                                                                                                                                                                                                                                                                                                                         |
| Docs          | `internal/range-pickers/SUPPORT.md`, `repo-docs/tecton-integration.md`, `.changeset/storybook-parity-pickers.md` |                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |

Range picker against the `Range` story (`organisms-date--range` vs
`extra-pickers--range-single-endpoint`): 1.15 % differing pixels before the fixes, 0.45 % after.
The remaining pixels are only the caption and toolbar texts ("SELECT DATE RANGE / Dec 14 – End"
vs "SELECT DATE / Thu, Dec 14") and the month-switch chevron.

## Clock views (TimeClock, DigitalClock, MultiSectionDigitalClock)

There is no clock story in the Storybook: "Time" is a `MobileDatePicker` and "DateTime" is a filled
`DatePicker`. Neither Tecton nor our compat layer styles the clocks. Standalone, the three views
render correctly in both modes (`extra-pickers--clocks`): circular dial background, all 12
numbers, selected hour.

The reported defect is **layout, not library or theme**. The docs demo placed the three views as
direct children of a flex row (`<Stack direction="row">`). MUI sizes these views for a picker
layout:

- `TimeClock` is a 320 px `overflow: hidden` view that a flex row may shrink, so the dial is
  clipped to a pill and loses the 9/3 o'clock numbers.
- `DigitalClock` and `MultiSectionDigitalClock` are `width: 100%`, so they take the row's free
  space.

`extra-pickers--clocks-flex-row` reproduces the defect exactly, and
`extra-pickers--clocks-flex-row-wrapped` shows the fix: wrap each view in a block box (or give the
row children `flexShrink: 0` and `width: auto`). The fix belongs in the docs demo. Changing MUI's
view sizing in the theme would diverge from MUI.

## Documented differences (not fixed)

- **The `Range` story is not a range picker.** It is a single-date `StaticDatePicker`, and
  Storybook 0.10.1 has no range, time-clock or date-time-picker story. The range band, hover
  preview, two-calendar layout and field therefore have no Storybook reference. They use the same
  tokens as the matched pieces: `PickerDay`, the calendar header and the `primary.main` endpoints.
  The band is `alpha(primary.main, selectedOpacity)` and the preview is a dashed `divider` outline.
- **Month-switch chevron:** the range calendar offers only the day view, so its header has no
  "December 2023 ⌄" switch button.
- **`play` interactions:** stories whose play clicks, types or hovers are compared before the
  play runs. The interaction states use the same MUI components and theme.
- **Icon gallery:** the Storybook builds the icon list from the CDN `icons.css`. Our reproduction
  reads the packaged copy of the same 0.11.2 file.
- **Card media:** `images.unsplash.com` photos load on both sides, or on neither when the network
  blocks them.
- **Menu overflow and text antialiasing:** Tecton pulls the menu list one border width past the
  bottom of the scrollable paper, so every Tecton menu overflows by 1px and shows a scrollbar where
  scrollbars take space. `compat.ts` takes that pixel from the list's bottom padding instead: same
  pixels, no overflow. As a side effect, Chromium composites the Storybook's paper as an opaque
  scroller and draws its text with LCD (subpixel) antialiasing, while ours is painted on the
  transparent popover layer with grayscale antialiasing. With LCD text on, `molecules-select--open`
  differed by 0.18–0.27 % (glyph edges only), so the suite runs with `--disable-lcd-text`.

## Drop-ins: App Bar (`<wc-app-bar>` vs React `AppBar`)

`AppBar` is the Tecton app bar and no longer composes MUI-style (`AppBar` + `Toolbar`), so the five
"Organisms / App Bar" stories of storybook-mui, which compose it that way, were retired from the
reproduction (they matched before). The drop-in stories below cover the bar.

The drop-in Storybook (`https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/apps/storybook/1.1.0/`,
"Drop-ins / App Bar") renders the `<wc-app-bar>` web component, which bundles MUI 9 and takes its
theme from the same Tecton 0.11.2 UMD. Its story module was decompiled the same way. The web
component renders MUI `AppBar`, `Toolbar`, `Tabs`, `Tab`, `Chip` and `IconButton` with the Tecton
`MuiAppBar` overrides; `AppBar` with navigation props renders the same tree
(`packages/ui/src/AppBar/AppBarNavigation.tsx`). The harness module
`tests/e2e/harness/src/storybook/stories/DropInsAppBar.tsx` reproduces the story host page (event
log, toasts, tab state) with the React component.

All 11 stories (Primary, Figma variant, Secondary, Branding, Tab options, Tab limits, Overflow,
Slots, Slots with changing content, Live attributes, Playground) are compared in both modes; all
but Overflow are pixel-identical (0 differing pixels), and Overflow differs only by the intended
differences below. `storybook-parity.spec.ts` runs all 22 comparisons.

- **Scroll arrows:** Tecton's compat layer gives `Tabs` Tecton chevrons; the drop-in keeps MUI's
  `KeyboardArrowLeft` / `KeyboardArrowRight` SVGs, so the app bar passes the same glyphs through
  `slots`.
- **Scroll arrow cells (intended difference):** the React bar's arrows are 48px cells with a
  divider toward the tabs, like the Home (fixed tab) cell next to them; the drop-in keeps MUI's
  borderless 40px buttons. They follow where the strip's slide is going: an arrow that goes away does so
  as the slide starts and one that shows grows in over it, where the drop-in's pop in or out when
  the strip arrives and make the tabs jump by an arrow's width. Only
  strips that overflow show an arrow (the Overflow story, within its 0.1 % allowance).
- **Viewport captures:** these cases capture the viewport, not the full page. A full-page capture
  briefly resizes the page; scrollable `Tabs` react to that resize (scroll arrows, scroll position)
  at random on either side. The same happens without any capture under heavy load: MUI's
  IntersectionObserver can leave both arrows on although the tabs fit, in the drop-in and in ours.
  `settle` also waits until every tab strip has stopped scrolling (the selected tab is scrolled into
  view by a JavaScript animation).
- **Scroll arrows and scroll-into-view (intended difference):** the React bar's arrows follow the
  strip's scroll position, and the bar does all of its own scrolling (`AppBar/tabStrip.tsx`): an
  arrow click, and bringing a selected or added tab into view, slide with MUI's duration (the theme's
  `standard`, 300ms) and easing, towards a target recomputed every frame, so an arrow that shows or
  hides on the way cannot leave the tab short. MUI's own writes to the strip's scroll position are
  ignored. The drop-in's arrows follow MUI's IntersectionObserver, which can lag or miss updates (a
  start arrow at the start, an end arrow at the end, an added tab left under the end arrow). The
  Overflow story therefore allows 0.1 %: the drop-in sometimes shows that stray start arrow; the
  React bar never does. Every other story is pixel-identical.
- **Keyboard (intended differences):** Delete or Backspace closes the active tab, and focus moves to
  the newly active tab when the focused tab, its close button or the add button is removed. The
  drop-in ignores Delete and leaves focus on the document body. Covered by
  `tests/e2e/app-bar.spec.ts`; no visual difference.
- **Accessibility fixes (intended, no visual difference):** the drop-in nests the close button in
  its tab (axe `nested-interactive`) and gives both the `Tabs` root and its list `role="tablist"`
  (axe `aria-required-children`). The active tab now keeps an empty slot of the button's size and
  the button is laid over it from the Tabs scroller (`AppBar/TabCloseButton.tsx`), and only the list
  is a tab list. `tests/e2e/app-bar.spec.ts` runs axe on the bar and checks the button sits on its
  slot (LTR, RTL, scrolled strips).

## Heading (`Heading` component vs "Organisms / Heading")

The eight "Organisms / Heading" stories compose each heading by hand from MUI parts: a padded
1920px (or fluid) frame, a title cluster (home button, title, chevron), a filled tab group on a
paper box and a right cluster. `@tecton-mui/ui` now ships that composition as `Heading` with
`HeadingTitle`, `HeadingTabs` and `HeadingActions` (`packages/ui/src/Heading`), and the
reproduction (`stories/Heading.tsx`) renders every story with it. All eight are pixel-identical in
both modes, and `storybook-parity.spec.ts` runs all 16 comparisons.

- **Responsive layout (intended difference):** at 1280px the Storybook's fluid "Elevated" row does
  not fit. It overflows its container (the page scrolls sideways to 1637px), the selects truncate
  their values and "Create Project" breaks onto two lines. `Heading` keeps one row and lets its parts
  give way instead (priority+): the secondary actions collapse into an overflow (⋮) button, then the
  tabs after the selected one into a More pill ("Elevated" at 1280px: six tabs, More, ⋮ and Create
  Project). A very narrow heading gives the tabs a row of their own, so nothing overflows down to
  320px (WCAG 1.4.10). The Elevated story is therefore compared at a 1920px viewport, where its
  fluid row fits and is pixel-identical. `tests/e2e/heading.spec.ts` covers the collapse order, the
  More menu, the overflow tray, the compact layout, RTL, keyboard and axe.
- **Search:** the stories' Search icon button is a placeholder. The reproduction renders it with
  `HeadingSearch`, which opens into a search field; closed, it is pixel-identical to the story's
  icon button.
- **Title letter spacing:** the title uses the theme's `h4` variant (Tecton heading 1) with
  `letter-spacing: normal`, as the story's title has. MUI's own `h4` letter spacing (0.00735em)
  survives in the theme and would move the glyphs.

## Per-story results

| Story id                                   | Result  | Light diff % | Dark diff % | Cause / fix                                                                                                                     |
| ------------------------------------------ | ------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `atoms-avatar--icon-avatar`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-avatar--image-avatar`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-avatar--initials-avatar`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-avatar--sizes`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-avatar--examples`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-avatar--playground`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-backdrop--backdrop-example`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-badge--colors`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-badge--dot`                         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-badge--placement`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-badge--standard`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-badge--examples`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-badge--playground`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-breadcrumbs--icons`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-breadcrumbs--menu-variant`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-breadcrumbs--no-icons`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-breadcrumbs--examples`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-breadcrumbs--playground`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--activated`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--disabled`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--icon-button-playground`     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--outlined`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--primary`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--secondary`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--tertiary`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--working`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--examples`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-button--playground`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-checkbox--bare`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-checkbox--grouped`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-checkbox--labeled`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-checkbox--examples`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-checkbox--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--clickable`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--clickable-filled`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--clickable-outlined`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--deletable`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--filled`                       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--outlined`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--shapes`                       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--examples`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-chip--playground`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-color-swatch--medium`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-color-swatch--small`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-divider--horizontal`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-divider--labeled`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-divider--vertical`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-divider--examples`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-fab--circular`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-fab--colors`                        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-fab--extended`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-fab--sizes`                         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-fab--examples`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-fab--playground`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-icon--color`                        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-icon--recolorable`                  | match   | 0.000        | 0.000       | Matches; the story reads the icon list from the CDN icons.css, our reproduction from the packaged icons.css (same 0.11.2 file). |
| `atoms-icon--sizes`                        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-icon--examples`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-link--body`                         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-link--disabled`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-link--inline`                       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-link--with-icon`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-link--examples`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-link--playground`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-progress--circular`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-progress--linear`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-progress--examples`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-progress--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--disabled`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--enabled`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--error`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--horizontal`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--vertical`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--examples`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-radio-group--playground`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--disabled`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--filled`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--half`                       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--read-only`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--sizes`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--examples`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-rating--playground`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-stack--column`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-stack--divided`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-stack--row`                         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-stack--spaced`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-switch--bare`                       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-switch--grouped`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-switch--labeled`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-switch--small`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-switch--examples`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-switch--playground`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-tooltip--arrow`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-tooltip--default`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-tooltip--long`                      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-tooltip--placement`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-tooltip--examples`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `atoms-tooltip--playground`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-accordion--activated`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-accordion--disabled`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-accordion--standard`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-accordion--examples`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-accordion--playground`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--button-and-close`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--filled`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--full-row`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--outlined`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--title-only`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--with-button`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--with-close`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--with-description`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-alert--playground`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-autocomplete--multi-closed`     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-autocomplete--multi-open`       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-autocomplete--single-closed`    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-autocomplete--single-open`      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-autocomplete--examples`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-autocomplete--playground`       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--outlined`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--primary`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--secondary`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--sizes`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--tertiary`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--vertical`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--examples`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-button-group--playground`       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--clickable`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--clickable-alt`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--media`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--outlined`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--standard`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--with-actions`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--examples`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-card--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-dialog--confirm`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-dialog--fullscreen`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-dialog--scroll-body`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-dialog--standard`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-dialog--examples`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-dialog--playground`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-drawer--anchors`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-drawer--composition`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-drawer--mini`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-drawer--persistent`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-drawer--temporary`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-drawer--playground`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--compact-subheader`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--dense`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--gutters-off`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--gutters-on`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--regular`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--regular-subheader`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--states`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-list--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--dense`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--divider-disabled`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--dividers`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--nested`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--shortcut`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--standard`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--examples`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-menu--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-popover--stickers`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-popover--playground`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--filled`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--open`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--outlined`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--standard`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--states`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--examples`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-select--playground`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--continuous`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--discrete`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--marks`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--range`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--range-hover`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--vertical`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--vertical-marks`         | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--vertical-range-hover`   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--examples`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-slider--playground`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-snackbar--anchors`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-snackbar--default`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-snackbar--error`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-snackbar--success`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-snackbar--playground`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--add-trigger`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--filled`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--filled-wrapper`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--medium`                   | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--project-nav`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--small`                    | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--small-vertical`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--small-with-trailing-icon` | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--vertical`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--with-icon`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--with-trailing-icon`       | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-tabs--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--filled`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--outlined`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--sizes`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--standard`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--states`              | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--examples`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-textfield--playground`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-toggle-button--colors`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-toggle-button--patterns`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-toggle-button--sizes`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-toggle-button--states`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `molecules-toggle-button--playground`      | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-appbar--primary`                | retired | –            | –           | Composes MUI's `AppBar` with `Toolbar`; `AppBar` is now the Tecton app bar (see Drop-ins: App Bar).                             |
| `organisms-appbar--product-logo`           | retired | –            | –           | Composes MUI's `AppBar` with `Toolbar`; `AppBar` is now the Tecton app bar (see Drop-ins: App Bar).                             |
| `organisms-appbar--secondary`              | retired | –            | –           | Composes MUI's `AppBar` with `Toolbar`; `AppBar` is now the Tecton app bar (see Drop-ins: App Bar).                             |
| `organisms-appbar--examples`               | retired | –            | –           | Composes MUI's `AppBar` with `Toolbar`; `AppBar` is now the Tecton app bar (see Drop-ins: App Bar).                             |
| `organisms-appbar--playground`             | retired | –            | –           | Composes MUI's `AppBar` with `Toolbar`; `AppBar` is now the Tecton app bar (see Drop-ins: App Bar).                             |
| `organisms-date--date-input`               | match   | 0.000        | 0.000       | Matches.                                                                                                                        |
| `organisms-date--date-time`                | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-date--month-view`               | match   | 0.000        | 0.000       | Matches.                                                                                                                        |
| `organisms-date--range`                    | match   | 0.000        | 0.000       | Matches after the PickerDay compat fix (before: selected day `#765292` vs Storybook `#644a78`, 0.075 %).                        |
| `organisms-date--sizes`                    | match   | 0.000        | 0.000       | Matches.                                                                                                                        |
| `organisms-date--time`                     | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-date--year-view`                | match   | 0.000        | 0.000       | Matches; one dark run measured 0.265 % (year list scroll position settling under load), three reruns 0.000 %.                   |
| `organisms-date--examples`                 | match   | 0.000        | 0.000       | Matches after the PickerDay compat fix (selected day in the static calendar).                                                   |
| `organisms-date--playground`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--compact`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--elevated`              | match   | 0.000        | 0.000       | Matches at a 1920px viewport. At 1280px the Storybook row overflows; `Heading` collapses (see Heading).                         |
| `organisms-heading--page`                  | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--reports`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--section`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--wells`                 | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--with-crumbs`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-heading--workspaces`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--actions`             | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--collapsed`           | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--color-tags`          | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--icons`               | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--multi-select`        | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--standard`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--examples`            | match   | 0.000        | 0.000       |                                                                                                                                 |
| `organisms-tree-view--playground`          | match   | 0.000        | 0.000       |                                                                                                                                 |
