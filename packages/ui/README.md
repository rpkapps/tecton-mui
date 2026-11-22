# @tecton-mui/ui

A private React component library with the familiar MUI component names, imports, props and
customization APIs, preconfigured with the **Tecton** design system.

- MUI Core and Lab components are direct re-exports of the MIT MUI packages (same components,
  props, slots and refs), styled by Tecton through the theme. MUI X Community Date and Time
  Pickers and `SimpleTreeView` are included, and so is MUI X Chat (`ChatBox` and its parts, with the
  headless runtime at `@tecton-mui/ui/ChatHeadless`). Chat is an alpha upstream API.
- One unified `DataGrid`, range pickers and one unified `RichTreeView` add advanced features,
  implemented independently on public MUI X Community APIs. No commercial MUI X code is used.
- `NumberField`, `NumberSpinner` and `Menubar`, which Material UI 9.5.0 offers only as copy-paste
  recipes, packaged as components: built on Base UI (`@base-ui/react`, MIT) and styled by the theme.
- `NumberSlider` and `NumberRangeSlider`: a number input (or a range of two) next to a drag bar,
  built on the same Base UI number field.
- `ActionBar`, the Tecton vertical tool palette, composed from Material components.
- `ColorSwatchControl`, the Tecton color input: a swatch and hex value that open the browser's
  color picker.
- Tecton fonts, icons and tokens, with a typed `Icon` (no `@mui/icons-material` needed). Light and
  dark mode shared by every React root on the page, RTL and SSR helpers.
- ESM only, TypeScript declarations for every public path, tree-shakeable imports.

**Requirements:** React and React DOM **19 or later** (peer dependencies); `@types/react` 19 is an
optional peer. **License:** `UNLICENSED` (internal). Open-source dependencies, Tecton artifacts and
bundled fonts are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Installation

```bash
pnpm add @tecton-mui/ui react react-dom
```

MUI, Emotion and `date-fns` come with the package. Do not install your own `@mui/material` or
`@mui/x-*`: a second copy breaks theming and context.

## Imports

Both import styles are supported and resolve to the same components:

```tsx
// Root named imports
import { Button, TextField, DataGrid } from '@tecton-mui/ui';

// Individual component imports (default export, MUI-style subpaths)
import Button from '@tecton-mui/ui/Button';
import DataGrid from '@tecton-mui/ui/DataGrid';

// Theming utilities (mirrors @mui/material/styles)
import { ThemeProvider, createTheme, styled, useTheme } from '@tecton-mui/ui/styles';
```

Importing `@tecton-mui/ui/Button` does not pull in the Data Grid, pickers, Tree View or date
adapters. When the same name exists in more than one MUI package, the root export keeps one of them.
Import the other one from its component subpath.

## ThemeProvider

`ThemeProvider` with no props applies the Tecton theme for the current shared light/dark mode:

```tsx
import { ThemeProvider } from '@tecton-mui/ui/styles';
import Button from '@tecton-mui/ui/Button';

export function App() {
  return (
    <ThemeProvider>
      <Button variant="contained">Save</Button>
    </ThemeProvider>
  );
}
```

`ThemeProvider` renders no DOM. It does **not** render `CssBaseline` or `LocalizationProvider`.

| Prop           | Description                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `themeOptions` | MUI `ThemeOptions` merged over the Tecton defaults for the current mode. Pass a stable (module-level or memoized) object so the theme is not rebuilt on every render. |
| `theme`        | A complete theme, or an MUI nested-theme function, used as is (MUI semantics). It does not follow the shared mode by itself.                                          |
| `direction`    | `'ltr'` (default) or `'rtl'`. See [RTL](#rtl).                                                                                                                        |

`createTheme(options)` has the MUI signature and starts from the Tecton defaults. `palette.mode`
selects the light or dark Tecton base. The standard MUI customization APIs (`sx`, `styled`,
`slots`, `slotProps`, `variants`, `defaultProps`, `styleOverrides`) all keep working.

**Styling policy:** consumer applications should not visually override Tecton styling or tokens.
This is an organization policy. The library does not block or warn about overrides.

Tecton adds a few typed props through MUI module augmentation, for example `activated` on `Button`
and `IconButton`, `variant="square"` on `IconButton`, `shape` on `Chip` and `Badge`, `emphasis` on
`Divider` and `tier` on `AppBar`. `AppBar` is the Tecton App Bar, composed from `AppBarBrand`,
`AppBarTabs` / `AppBarTab` (the MUI `Tabs` and `Tab` props, plus close and add buttons) and
`AppBarActions`. It replaces the MUI `AppBar` and its `Toolbar` composition; see the App Bar page of
the docs portal.

## Stylesheets: shell, hosted MFE and standalone

The library has no micro-frontend runtime. Each MFE is an independent React root in a regular DOM
element. What the library provides is a set of explicit style entry points. Ordinary component
imports never inject global CSS.

| Entry point                                                  | Contents                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `@tecton-mui/ui/styles/global.css`                           | Tecton fonts (`@font-face`, font files included), icon classes and design tokens (`--tecton-*`). |
| `@tecton-mui/ui/styles/components.css`                       | Static component styles (currently empty; component styles are rendered by Emotion at runtime).  |
| `@tecton-mui/ui/styles/fonts.css`, `icons.css`, `tokens.css` | The three parts of `global.css` as separate files.                                               |

Your bundler must handle CSS imports and the relative font URLs in `global.css` / `fonts.css`.

| Environment    | `global.css`    | `components.css`      | `ThemeProvider` | `CssBaseline`                       |
| -------------- | --------------- | --------------------- | --------------- | ----------------------------------- |
| Shell          | Import **once** | Optional              | Yes             | Render **once**                     |
| Hosted MFE     | **Never**       | Optional, recommended | Yes, its own    | **Never** (use `ScopedCssBaseline`) |
| Standalone app | Import **once** | Optional              | Yes             | Yes, if it owns the page            |

**Shell, or a standalone app that owns the page:**

```tsx
import '@tecton-mui/ui/styles/global.css';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@tecton-mui/ui/CssBaseline';
import { ThemeProvider, initTecton } from '@tecton-mui/ui/styles';

initTecton(); // optional explicit step, see "Token initialization"

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);
```

**Hosted MFE** (its own React root inside the shell's page):

```tsx
import '@tecton-mui/ui/styles/components.css';
import { createRoot } from 'react-dom/client';
import Button from '@tecton-mui/ui/Button';
import { ThemeProvider } from '@tecton-mui/ui/styles';

export function mount(element: HTMLElement) {
  // A prefix no other root on the page uses.
  const root = createRoot(element, { identifierPrefix: 'feature-' });
  root.render(
    <ThemeProvider>
      <Button variant="contained">Save</Button>
    </ThemeProvider>,
  );
  return () => root.unmount();
}
```

A hosted MFE relies on the shell for fonts, icons, tokens and the global reset. Importing
`global.css` again would duplicate the `@font-face` rules and token declarations.

Give each MFE root an `identifierPrefix` that no other root on the page uses. Components connect
labels, inputs, menus and their `aria-*` attributes with ids from React's `useId`. Those ids are
unique across roots only when every root shares one copy of React and renders on the client. A
hydrated root, or one rendered by its own copy of React, starts from the same ids as the other
roots. With `hydrateRoot`, pass the same prefix to the server renderer.

Dialogs, drawers, popovers and menus of the shell and of MFEs can be open on top of each other,
also when each MFE bundles its own copy or version of the library. `ThemeProvider` installs a
page-level modal layer (the newest version on the page runs): only the top modal takes the focus,
page scrolling stays locked until the last modal closes, and the page behind stays hidden from
assistive technology. There is nothing to set up, and with one copy it changes nothing.

### Token initialization

Importing CSS does not run JavaScript. The Tecton runtime (the shared Tecton theme manager)
initializes in the browser the first time `ThemeProvider` or `useTectonMode` renders, or when you
call `initTecton()`. On initialization it:

1. Checks whether the Tecton tokens are already present, either as a `<style data-tecton="tokens">`
   element or as `--tecton-*` variables on `<html>` (for example from `global.css`). If they are,
   it marks them as present and does not inject them again. Otherwise it injects the tokens once as
   `<style data-tecton="tokens">` in `<head>`.
2. Sets `data-theme="light"` or `data-theme="dark"` on `<html>`. The token CSS defines both modes
   with this attribute.

Fonts and icon classes are never injected; they come only from the CSS files. `initTecton(config?)`
is safe to call from every root. `config` accepts `defaultMode` (`'light' | 'dark' | 'system'`,
default `'light'`) and `storageKey` (default `tecton-theme-mode`).

## CssBaseline and ScopedCssBaseline

- `CssBaseline` applies the page-wide reset and the Tecton global rules: body font, colors and
  shared keyframes. Render it **once per page**, in the shell or in a standalone app that owns the
  page.
- A hosted MFE must not render `CssBaseline`, because a second global reset can override the
  shell's page styles. If you need baseline styles only inside your container, wrap your tree in
  `ScopedCssBaseline`.

```tsx
import ScopedCssBaseline from '@tecton-mui/ui/ScopedCssBaseline';

<ThemeProvider>
  <ScopedCssBaseline>{/* MFE content */}</ScopedCssBaseline>
</ThemeProvider>;
```

## Light and dark mode

Tecton's theme manager is the single source of truth for the mode. It is created once per page and
stored on `globalThis`, so the shell and every independently mounted MFE root (even one using a
separate copy of the library) read and change the same mode. There is no React-owned mode state.

```tsx
import { useTectonMode } from '@tecton-mui/ui/styles';
import Button from '@tecton-mui/ui/Button';

function ModeToggle() {
  const { mode, toggleMode } = useTectonMode();
  return <Button onClick={toggleMode}>{mode === 'dark' ? 'Light mode' : 'Dark mode'}</Button>;
}
```

`useTectonMode()` also returns `preference`, `setMode('light' | 'dark' | 'system')` and
`clearPreference()`. The preference is stored in `localStorage`, `'system'` follows
`prefers-color-scheme`, and other tabs follow changes through `storage` events.
`useTectonModeValue()` returns only the mode; `getThemeManager()` returns the manager (`null` on the
server).

### SSR

Render these in `<head>` to avoid a flash of the wrong mode and to deliver tokens before
hydration:

```tsx
import { TectonModeScript, TectonTokensStyle } from '@tecton-mui/ui/styles';

<head>
  {/* Sets data-theme on <html> from the stored preference before first paint. */}
  <TectonModeScript />
  {/* Server-renders the tokens with the marker the runtime checks, so they are not injected again. */}
  <TectonTokensStyle />
</head>;
```

- `TectonModeScript` accepts `storageKey`, `defaultMode` (use the same values as `initTecton()`)
  and `nonce`. `getTectonModeScript(options)` returns the script source for non-React templates.
- `TectonTokensStyle` is for SSR apps that do not load `global.css`; load `fonts.css` and
  `icons.css` separately.
- On the server, `ThemeProvider` renders the light theme, or the `defaultMode` passed to
  `initTecton()` if it is `'light'` or `'dark'`. After hydration, React components switch to the
  stored mode.
- The Community Data Grid foundation renders its content on the client, after hydration.

## RTL

```tsx
<ThemeProvider direction="rtl">
  <div dir="rtl">
    <App />
  </div>
</ThemeProvider>
```

`direction="rtl"` sets `theme.direction` and wraps the subtree in a shared Emotion cache that
flips styles (`@mui/stylis-plugin-rtl`). `ThemeProvider` renders no DOM, so set `dir="rtl"` yourself
on `<html>` or on a container element. If you pass a complete `theme`, also set `direction: 'rtl'`
in that theme.

## Icons

```tsx
import Icon from '@tecton-mui/ui/Icon';
import Button from '@tecton-mui/ui/Button';

<Button startIcon={<Icon name="add" />}>Add</Button>;
<Icon name="add" variant="filled" size="large" title="Add item" />;
```

- `name` is typed with the icon names extracted from the pinned Tecton `icons.css`.
- `variant`: `'outline'` (default) or `'filled'`. If the requested variant does not exist, the
  available one is used.
- `size`: `'inherit'` (default, 1em), `'xsmall'`, `'small'`, `'medium'` or `'large'`.
- Without `title` the icon is decorative (`aria-hidden`). With `title` it gets `role="img"` and an
  `aria-label`.
- Icons are CSS classes, so the host must load `icons.css` (included in `global.css`).
- MUI's font-ligature `Icon` is not exported. `SvgIcon` and plain SVG children still work.

## Dates: LocalizationProvider

`LocalizationProvider` is separate from `ThemeProvider`, as in MUI, and is not nested inside it.
Render it wherever you use pickers. By default it uses `AdapterDateFns` (native `Date` values) and
the date-fns `en-US` locale.

```tsx
import { LocalizationProvider } from '@tecton-mui/ui';
import DatePicker from '@tecton-mui/ui/DatePicker';

<LocalizationProvider>
  <DatePicker label="Start date" />
</LocalizationProvider>;
```

Change the locale with `adapterLocale`, or use another adapter with `dateAdapter`. The other
adapters are separate subpaths and are never bundled by default. Install the date library yourself.

```tsx
import { de } from 'date-fns/locale/de';
import { AdapterDayjs } from '@tecton-mui/ui/AdapterDayjs'; // requires `dayjs` in your app

<LocalizationProvider adapterLocale={de}>…</LocalizationProvider>;
<LocalizationProvider dateAdapter={AdapterDayjs}>…</LocalizationProvider>;
```

Available adapters: `AdapterDateFns` (default), `AdapterDayjs`, `AdapterLuxon`, `AdapterMoment`.

## Number fields

Numeric inputs with stepping, formatting and min/max clamping:

```tsx
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

<NumberField
  label="Budget"
  defaultValue={250000}
  step={1000}
  format={{ style: 'currency', currency: 'USD' }}
/>;
<NumberSpinner label="Crew" defaultValue={4} min={0} max={12} />;
```

Both take the Base UI `NumberField.Root` props (`value`, `defaultValue`, `onValueChange`,
`onValueCommitted`, `min`, `max`, `step`, `smallStep`, `largeStep`, `format`, `locale`,
`snapOnStep`, `allowWheelScrub`, `name`, …) plus the Material field props `label`, `helperText`,
`error`, `required`, `disabled`, `readOnly`, `size`, `fullWidth`, `placeholder`, `inputRef`, `sx`
and `slotProps`, and `variant` (`outlined`, the default, or `filled`). A unit goes in
`slotProps.input.endAdornment` (an `InputAdornment`). The value is a `number` or `null`. Pass `locale` when server and browser locales can differ, so that server-rendered text
matches.

`NumberSlider` adds a bar beside a filled input: it shows the value between `min` (default `0`) and
`max` (default `100`), and pressing or dragging it sets the value. `NumberRangeSlider` does the same
for a `[start, end]` range with two thumbs and both numbers in one input:

```tsx
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import NumberRangeSlider from '@tecton-mui/ui/NumberRangeSlider';
import NumberSlider from '@tecton-mui/ui/NumberSlider';

const hz = { input: { endAdornment: <InputAdornment position="end">Hz</InputAdornment> } };

<NumberSlider label="Step" defaultValue={5} min={1} max={16} slotProps={hz} />;
<NumberRangeSlider label="Frequency" defaultValue={[10, 50]} max={80} slotProps={hz} />;
```

`NumberSlider` takes the same props as `NumberField` except `variant` (filled only), plus
`slotProps.rail` for the bar. `NumberRangeSlider` takes the value and stepping props as a range
(`value`, `defaultValue`, `onValueChange` and `onValueCommitted` use `[number, number]`) and
`getAriaLabel` to name its two inputs.

## Menubar

A desktop-style row of application menus (File, Edit, View) with full keyboard support:

```tsx
import Menubar, {
  MenubarItem,
  MenubarMenu,
  MenubarPopup,
  MenubarPortal,
  MenubarPositioner,
  MenubarTrigger,
} from '@tecton-mui/ui/Menubar';

<Menubar aria-label="Editor">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarPortal>
      <MenubarPositioner>
        <MenubarPopup>
          <MenubarItem hint="Ctrl+S" onClick={save}>
            Save
          </MenubarItem>
        </MenubarPopup>
      </MenubarPositioner>
    </MenubarPortal>
  </MenubarMenu>
</Menubar>;
```

The parts wrap the Base UI `Menubar` and `Menu` parts and take their props, plus `sx` and
`className`. Items use the theme's `MenuItem` styles and popups the `Menu` paper. Submenus,
checkbox items, radio groups and labelled groups are available as `MenubarSubmenu`,
`MenubarCheckboxItem`, `MenubarRadioGroup`/`MenubarRadioItem` and `MenubarGroup`/`MenubarGroupLabel`.

## ActionBar

A vertical tool palette for canvases and viewers (Tecton "Action Bar"), a WAI-ARIA toolbar with one
tab stop and arrow-key navigation:

```tsx
import ActionBar, {
  ActionBarButton,
  ActionBarGroup,
  ActionBarTool,
  ActionBarToolMenu,
} from '@tecton-mui/ui/ActionBar';

<ActionBar aria-label="Section tools" value={tool} onChange={(event, value) => setTool(value)}>
  <ActionBarGroup>
    <ActionBarButton value="select" label="Select" icon={<Icon name="select-cursor" />} />
    <ActionBarToolMenu label="Zoom tools">
      <ActionBarTool value="zoom-in" label="Zoom in" icon={<Icon name="zoom-in" />} />
      <ActionBarTool value="zoom-out" label="Zoom out" icon={<Icon name="zoom-out" />} />
    </ActionBarToolMenu>
  </ActionBarGroup>
  <ActionBarGroup>
    <ActionBarButton label="Undo" icon={<Icon name="undo" />} onClick={undo} />
  </ActionBarGroup>
</ActionBar>;
```

Buttons with a `value` are tools (one is current); buttons without one are plain actions. A tool
menu holds a set of tools and opens on long press, right-click or the arrow key toward its menu.
`ActionBarSelect` adds a compact `Select` (two can share a row in an
`<ActionBarGroup orientation="horizontal">`); `alignment="right"` docks the bar on the right.

## ColorSwatchControl

A color input styled as a filled input (Tecton "Color Swatch"): a swatch of the color beside its
uppercase hex value. It is a native `<input type="color">`, so a click, <kbd>Enter</kbd> or
<kbd>Space</kbd> opens the browser's color picker, and keyboard focus shows the pink Tecton focus
ring.

```tsx
import ColorSwatchControl from '@tecton-mui/ui/ColorSwatchControl';

<ColorSwatchControl
  aria-label="Horizon fill"
  value={fill}
  onChange={(event, value) => setFill(value)} // '#218585', live while the picker is open
  onChangeCommitted={(event, value) => save(value)} // once, when the user settles on a color
/>;
```

`size="small"` (28px) or `"medium"` (32px) matches the filled inputs; `inherited` marks a color the
item inherits instead of setting it; `name` submits the color with a form.

## Advanced components

### DataGrid

There is one `DataGrid`. With no advanced props it behaves like the MIT Community grid, and every
Community export is re-exported from `@tecton-mui/ui/DataGrid`. Advanced features turn on only
through their props.

```tsx
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', width: 180 },
  { field: 'department', headerName: 'Department', width: 160 },
  { field: 'salary', headerName: 'Salary', type: 'number', width: 140 },
];

<div style={{ height: 480 }}>
  <DataGrid
    rows={rows}
    columns={columns}
    initialState={{
      pinnedColumns: { left: ['id'] },
      rowGrouping: { model: ['department'] },
      aggregation: { model: { salary: 'sum' } },
    }}
    headerFilters
  />
</div>;
```

| Feature                    | Props / API                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Multi-column sort / filter | On by default (Shift/Ctrl-click to sort). `disableMultipleColumnsSorting`, `disableMultipleColumnsFiltering`, `headerFilters`  |
| Column pinning, reordering | `pinnedColumns`, `onPinnedColumnsChange`, `onColumnOrderChange`. Header drag reordering is on unless `disableColumnReorder`    |
| Row pinning, reordering    | `pinnedRows`, `rowReordering`, `onRowOrderChange`                                                                              |
| Tree data                  | `treeData`, `getTreeDataPath`                                                                                                  |
| Row grouping, aggregation  | `rowGroupingModel`, `aggregationModel`, `aggregationFunctions` (built in: `sum`, `avg`, `min`, `max`, `size`)                  |
| Master/detail              | `getDetailPanelContent`, `getDetailPanelHeight`, `detailPanelExpandedRowIds`                                                   |
| Cell selection, paste      | `cellSelection`, `cellSelectionModel`, `onClipboardPasteEnd`, `disableClipboardPaste`                                          |
| Server-side data           | `dataSource` (`getRows`, optional `updateRow`, grouping callbacks), `dataSourceCache`, `lazyLoading` (no `rowCount`: infinite) |
| Infinite scroll            | `onRowsScrollEnd`, `scrollEndThreshold` (client rows)                                                                          |
| Batched updates            | `advancedApiRef.current.updateRows(...)`, `throttleRowsMs`                                                                     |
| Undo / redo                | `historyStackSize` (default `0`, off); Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y to redo                              |
| Imperative API             | `useGridAdvancedApiRef()` with `advancedApiRef`                                                                                |

`DataGridPro` and `DataGridPremium` are not exported. The supported advanced props are exactly
those declared in `DataGridAdvancedProps`, which is exported as a type. Supported, partial and
unsupported behaviour is listed in the [Data Grid support matrix](./src/DataGrid/SUPPORT.md)
(repository link; the docs portal renders the same matrix).

### Range pickers

```tsx
import * as React from 'react';
import { LocalizationProvider } from '@tecton-mui/ui';
import DateRangePicker, { type DateRange } from '@tecton-mui/ui/DateRangePicker';

function Stay() {
  const [value, setValue] = React.useState<DateRange>([null, null]);
  return (
    <LocalizationProvider>
      <DateRangePicker
        label="Stay"
        value={value}
        onChange={(next) => setValue(next)}
        localeText={{ start: 'Check-in', end: 'Check-out' }}
      />
    </LocalizationProvider>
  );
}
```

Separate components follow the MUI naming: `DateRangePicker`, `TimeRangePicker`,
`DateTimeRangePicker`, their `Desktop*`, `Mobile*` and `Static*` variants, `DateRangeCalendar`,
`MultiInputDateRangeField` and the `SingleInput*RangeField` fields. The responsive pickers use the
desktop variant when `desktopModeMediaQuery` matches (`@media (pointer: fine)` by default). Props
that are not implemented are rejected by TypeScript. See the
[range picker support matrix](./src/internal/range-pickers/SUPPORT.md).

### Tree View

`SimpleTreeView` is the Community component. `RichTreeView` is the Community component plus
independently implemented reordering, lazy loading and virtualization. There is no
`RichTreeViewPro`.

```tsx
import RichTreeView from '@tecton-mui/ui/RichTreeView';

const items = [
  { id: 'docs', label: 'Documents', children: [{ id: 'cv', label: 'CV.pdf' }] },
  { id: 'img', label: 'Images' },
];

<RichTreeView
  items={items}
  itemsReordering
  onItemPositionChange={({ itemId, oldPosition, newPosition }) => {
    /* persist the new order */
  }}
/>;
```

- Reordering: drag and drop, or Alt+Shift+Arrow keys, with live-region announcements.
- Lazy loading: `dataSource={{ getChildrenCount, getTreeItems }}`, `dataSourceCache`,
  `onDataSourceError`.
- Virtualization: opt-in with `virtualization`. It needs a fixed `itemHeight` and a parent with a
  height.

See the [Tree View support matrix](./src/RichTreeView/SUPPORT.md).

## Scope and limitations

- **Not included:** MUI X Charts, MUI X Scheduler, and the Data Grid features pivoting, Excel
  export, spreadsheet formulas or computed columns (Community `valueGetter` still works) and the AI
  assistant.
- **Commercial MUI X props:** for `DataGrid`, `RichTreeView` and the range pickers, a commercial
  MUI X prop that is not in their TypeScript props or support matrices is not supported.
- **MUI Lab** components are re-exported as published by the pinned `@mui/lab` beta. They can
  change between upstream releases.

## Documentation, versioning and changelog

Live examples, API tables and the support matrices: the docs portal at `__DOCS_URL__`.

The package follows semantic versioning. Release notes are generated with Changesets into
`CHANGELOG.md` in this package and are shown on the portal's **Releases → Changelog** page. Each
release pins exact versions of its MUI dependencies and of the Tecton artifacts (Tecton 0.11.2 at
the moment, exposed as `TECTON_VERSION` from `@tecton-mui/ui/styles`).
