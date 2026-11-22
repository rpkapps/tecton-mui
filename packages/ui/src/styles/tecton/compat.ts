// Runtime compatibility corrections between the pinned Tecton theme and the pinned MUI release.
// Each entry documents the upstream assumption it corrects; remove entries once Tecton catches up.
import { alpha, type Theme, type ThemeOptions } from '@mui/material/styles';
import { focusRingShadow, slotIcon } from './generated/mui/components/shared.js';
import { cssVar } from './generated/core/index.js';
import { gridIconSlots, iconCompatOverrides, tablePaginationFirstLast } from './compatIcons.js';
import { chatCompatOverrides } from './compatChat.js';
import { chatMarkdownStyleOverrides } from './compatChatMarkdown.js';
import { withInputFocusVisible } from './focusVisible.js';

// Tecton sets `outline: none` on focused Data Grid cells and column headers and draws nothing
// instead, so keyboard focus is invisible while navigating with the arrow keys (WCAG 2.4.7).
// Draw Tecton's 2px focus-ring colour inside the cell (an outer ring would be clipped by the
// neighbouring cells), for keyboard focus only: on the cell itself, or on a control inside it that
// draws no ring of its own (the row reorder handle). Inputs, selects and MUI controls with
// Tecton's focus ring (`Mui-focusVisible`: checkbox, icon buttons, header filter inputs) keep only
// their own ring, so there is never a ring inside a ring.
export const GRID_FOCUS_SELECTOR =
  '&:focus-visible, &:has(:focus-visible):not(:has(input:focus-visible, select:focus-visible, textarea:focus-visible, .Mui-focusVisible, [class*="headerFilterControl"]:focus-within))';
const gridFocusRing = {
  [GRID_FOCUS_SELECTOR]: {
    outline: `${cssVar('border-width-200')} solid ${cssVar('color-focus-ring')}`,
    outlineOffset: `calc(-1 * ${cssVar('border-width-200')})`,
  },
};

const menuBorder = cssVar('border-width-100');
const menuListBottomPadding = {
  // MUI List padding (8px) and Tecton's dense menu list padding (space-50), one border less.
  '& > .MuiList-padding:last-child': { paddingBottom: `calc(8px - ${menuBorder})` },
  '& > .MuiList-dense.MuiList-padding:last-child': {
    paddingBottom: `calc(${cssVar('space-50')} - ${menuBorder})`,
  },
};

// The search icon of the quick filter and the columns panel search. The slot icon is 1em of the
// small input text (12px); the Tecton drop-in menus draw it at 20px, like MUI's small SvgIcon.
const searchAdornmentIcon = {
  '& .MuiInputAdornment-root > [class*="tecton-"]': { fontSize: cssVar('icon-size-150') },
};

export const muiCompatOverrides: ThemeOptions = {
  // MUI 9.5 draws one keyboard focus ring for ButtonBase and ~25 components from
  // `theme.focusVisible`, insets it where an ancestor would clip it (Tab, ListItemButton, MenuItem)
  // and lifts a focused grouped button above its siblings. Tecton 0.11.2 (built against MUI 9.4)
  // does not set it, so many controls had no ring, a clipped one, or a grey MUI fill. Tecton's ring
  // as an outline: 2px focus-ring colour after a 1px gap, the same 3px as `focusRingShadow`.
  focusVisible: {
    outlineColor: cssVar('color-focus-ring'),
    outlineWidth: cssVar('border-width-200'),
    outlineOffset: '1px',
  },
  components: {
    // Tecton icons for every MUI icon slot Tecton leaves on Material icons (compatIcons.ts).
    ...iconCompatOverrides,
    // MUI X Chat: Tecton icons, focus rings, monospace font, avatar fill and readable timestamps
    // (compatChat.ts).
    ...chatCompatOverrides,
    // Markdown in messages: tables, quotes, lists and headings (compatChatMarkdown.ts).
    MuiChatMessage: {
      ...chatCompatOverrides.MuiChatMessage,
      styleOverrides: {
        ...chatCompatOverrides.MuiChatMessage?.styleOverrides,
        ...chatMarkdownStyleOverrides,
      },
    },
    MuiDataGrid: {
      // Tecton sets Tecton icons for the column header and column menu slots only, so the toolbar,
      // filter panel and density controls showed MUI's filled Material icons next to Tecton's
      // outline icons. Map the remaining Data Grid icon slots to their Tecton icons.
      defaultProps: {
        slots: {
          columnSelectorIcon: slotIcon('tecton-view-column-outline'),
          openFilterButtonIcon: slotIcon('tecton-filter-outline'),
          columnFilteredIcon: slotIcon('tecton-filter-outline'),
          filterPanelDeleteIcon: slotIcon('tecton-close-small-outline'),
          exportIcon: slotIcon('tecton-download-outline'),
          quickFilterIcon: slotIcon('tecton-search-outline'),
          quickFilterClearIcon: slotIcon('tecton-close-small-outline'),
          densityCompactIcon: slotIcon('tecton-density-compact-outline'),
          densityStandardIcon: slotIcon('tecton-density-standard-outline'),
          densityComfortableIcon: slotIcon('tecton-density-comfortable-outline'),
          moreActionsIcon: slotIcon('tecton-more-vert-outline'),
          undoIcon: slotIcon('tecton-undo-outline'),
          redoIcon: slotIcon('tecton-redo-outline'),
          ...gridIconSlots,
        },
      },
      styleOverrides: {
        root: {
          // Grid dividers use Tecton's divider token, as the Tecton table (MuiTableCell and the
          // drop-in table) does. MUI X otherwise derives a neutral gray from palette.divider (it
          // reads palette.TableCell.border only for CSS-variables themes), which is what row
          // lines, header and separators used.
          '&&': { '--DataGrid-t-color-border-base': cssVar('color-divider') },
          // Column resize handle: MUI darkens it to its accent colour on hover, focus and while
          // resizing, which is barely visible against Tecton's divider in dark mode. Use Tecton's
          // interactive text colour in both modes.
          '& .MuiDataGrid-columnSeparator--resizable:hover, & .MuiDataGrid-columnSeparator--resizing, & .MuiDataGrid-columnHeader:focus .MuiDataGrid-columnSeparator--resizable, & .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator--resizable:hover':
            { color: cssVar('color-action-text-only-text') },
          // The separator bar (compatIcons.ts): 1px at rest, a 3px rounded bar on hover, while
          // resizing and on touch devices, as MUI X 9 draws its separator icon.
          '& .TectonDataGrid-separatorBar': {
            width: '1px',
            height: '100%',
            borderRadius: '0.5px',
            backgroundColor: 'currentColor',
          },
          '& .MuiDataGrid-columnSeparator--resizing .TectonDataGrid-separatorBar': {
            width: '3px',
            borderRadius: '1.5px',
          },
          '@media (hover: hover)': {
            '& .MuiDataGrid-columnSeparator--resizable:hover .TectonDataGrid-separatorBar': {
              width: '3px',
              borderRadius: '1.5px',
            },
          },
          '@media (hover: none)': {
            '& .MuiDataGrid-columnSeparator--resizable .TectonDataGrid-separatorBar': {
              width: '3px',
              borderRadius: '1.5px',
            },
          },
        },
        // Tecton puts a bottom border on the header container, but MUI X already draws one on every
        // header cell (in --DataGrid-t-color-border-base above); together they render 2px.
        columnHeaders: { borderBottom: 'none' },
        // Tecton draws a 1px stroke around hovered and selected rows as a real border and shrinks
        // the cells to fit, which shifts every cell 1px right and down. Hovered rows get no stroke
        // (only the hover fill, as in the Tecton table drop-in); selected rows keep it, drawn as an
        // overlay (rows are position: relative in MUI X) above pinned cells (z-index 30) and below
        // the sticky header/footer containers (40).
        row: {
          // Tecton fills a selected row's cells with table/cell/active but the empty area after the
          // last column with input/filled/active, so a selected row is two shades wherever the
          // columns do not fill the width. The Tecton table drop-in fills the whole selected row
          // with table/cell/active; so does the grid.
          '&.Mui-selected': {
            backgroundColor: cssVar('color-table-cell-bg-active'),
            '&:hover': { backgroundColor: cssVar('color-table-cell-bg-active') },
          },
          '&:hover': {
            border: 'none',
            '& .MuiDataGrid-cell': { height: 'var(--height)' },
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            border: 'none',
            '& .MuiDataGrid-cell': { height: 'var(--height)' },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              border: `${cssVar('border-width-100')} solid ${cssVar('color-action-outlined-border')}`,
              pointerEvents: 'none',
              zIndex: 31,
            },
          },
        },
        footerContainer: {
          borderTop: `${cssVar('border-width-100')} solid ${cssVar('color-divider')}`,
          // Footer text and pagination arrows as in the Tecton table drop-in (TablePagination and
          // the grid footer otherwise use the primary text colour).
          color: cssVar('color-text-secondary'),
          '& .MuiTablePagination-root': { color: cssVar('color-text-secondary') },
          '& .MuiTablePagination-actions': { color: cssVar('color-action-tertiary-text') },
        },
        // Grid popups as the Tecton drop-in menus draw them. MUI X paints panels in its own overlay
        // color (in dark mode the paper mixed with 10% white, a gray Tecton does not have) with an
        // elevation-8 shadow; Tecton popovers have no shadow.
        panelContent: {
          // Filter panel (drop-in filter menu): Tecton paper.
          backgroundColor: cssVar('color-bg-paper'),
          boxShadow: 'none',
          borderRadius: cssVar('radius-50'),
          // Columns panel (drop-in column menu): the elevation-2 popover surface.
          '&:has(.MuiDataGrid-columnsManagement)': {
            backgroundColor: cssVar('color-surface-elevation-2-bg'),
          },
          ...searchAdornmentIcon,
        },
        menu: {
          '& .MuiPaper-root': { boxShadow: 'none' },
          // Column menu (drop-in data grid menu): action/secondary surface, 32px items and icons
          // at the item text size (14px, between the 12px and 16px icon tokens).
          '& .MuiPaper-root:has(.MuiDataGrid-menuList)': {
            backgroundColor: cssVar('color-action-secondary-bg'),
          },
          '& .MuiDataGrid-menuList .MuiMenuItem-root': { minHeight: cssVar('space-400') },
          '& .MuiDataGrid-menuList .MuiListItemIcon-root [class*="tecton-"]': {
            fontSize: cssVar('font-size-medium'),
          },
        },
        toolbarQuickFilter: searchAdornmentIcon,
        // Tecton places a top-right badge for a 32px icon button (top -10px, right -11px, no
        // translate). In grid toolbars the badge wraps the 20px icon inside the button, so the
        // active-filter dot sat well away from it; put a dot on the icon's corner, as MUI does.
        toolbar: {
          '& .MuiBadge-dot.MuiBadge-anchorOriginTopRightRectangular, & .MuiBadge-dot.MuiBadge-anchorOriginTopRightCircular':
            {
              top: 0,
              right: 0,
              transform: 'scale(1) translate(50%, -50%)',
              transformOrigin: '100% 0%',
              '&.MuiBadge-invisible': { transform: 'scale(0) translate(50%, -50%)' },
            },
        },
        // Header icons and title as in Tecton's table (the MUI Table drop-in in the Tecton
        // Storybook): Tecton's grid theme draws 24px sort icons in the action colour, leaves the
        // column menu button in MUI's default colour (black / white) and uses a regular-weight
        // title. The table uses a medium-weight title and 16px sort icons painted in the primary
        // text colour (the icon mask's background; its `color` property reads secondary).
        sortIcon: {
          color: cssVar('color-text-primary'),
          width: cssVar('icon-size-100'),
          height: cssVar('icon-size-100'),
        },
        iconButtonContainer: {
          '& .MuiIconButton-root': { color: cssVar('color-text-secondary') },
        },
        menuIconButton: { color: cssVar('color-text-secondary') },
        columnHeaderTitle: { fontWeight: cssVar('font-weight-medium-strong') },
        columnHeader: {
          // 16px icons in the header buttons (sort, filtered, column menu).
          '& .MuiDataGrid-iconButtonContainer [class^="tecton-"], & .MuiDataGrid-menuIcon [class^="tecton-"]':
            { width: cssVar('icon-size-100'), height: cssVar('icon-size-100') },
          // Tecton zeroes the padding of body checkbox cells ("Figma DataGrid Checkbox cell has no
          // padding") but not of the header checkbox cell, which shifts the select-all checkbox
          // 10px off the row checkboxes. Mirror the body rule on the header cell.
          '&.MuiDataGrid-columnHeaderCheckbox': { padding: 0 },
          ...gridFocusRing,
        },
        cell: {
          ...gridFocusRing,
          // Row dividers. Tecton's grid theme zeroes the cells' top border (its Figma DataGrid
          // draws none), so rows ran together; the Tecton table drop-in separates rows with a
          // 1px line. Restore MUI X's row line, in --DataGrid-t-color-border-base
          // (color-divider, as every grid divider and the Tecton table).
          borderTopWidth: cssVar('border-width-100'),
          // Tecton centers row content (`align-items: center`), so the empty filler cell after the
          // last column collapsed to its 1px border in the middle of the row; stretch it.
          '&.MuiDataGrid-cellEmpty': { alignSelf: 'stretch' },
        },
      },
    } as NonNullable<ThemeOptions['components']>['MuiDataGrid'],
    // Tecton draws the menu border "inside" the paper by pulling the list back one border width
    // with negative margins. The bottom margin leaves the list's last pixel row outside the paper's
    // padding box, so the scrollable paper overflows by 1px and every menu shows a scrollbar. Keep
    // the top pull (overflow above the box is not scrollable) and take the bottom pixel from the
    // list's own bottom padding instead: same height and pixels, no overflow.
    MuiMenu: {
      styleOverrides: {
        paper: {
          '& > :last-child': { marginBottom: 0 },
          ...menuListBottomPadding,
        },
      },
    },
    // Tecton labels sit statically above the field and never float into the outlined border. Tecton
    // keeps the border closed for TextField by forcing `shrink: false`, which TextField passes on as
    // `notched`. A `Select` (or bare `OutlinedInput`) with a `label` does not go through TextField,
    // so the outline still cut a gap for the label once it had a value. Close it there too; an
    // explicit `notched` prop still wins.
    MuiOutlinedInput: {
      defaultProps: { notched: false },
      styleOverrides: {
        root: {
          // Tecton 0.11.2 resets the outline of a pointer-focused input with
          // `.Mui-focused:not(.Tecton-focusVisible) .MuiOutlinedInput-notchedOutline`, which is more
          // specific than its `.Mui-error` outline rule, so an invalid field lost its red outline
          // while focused with the pointer (keyboard focus kept it). Out-rank that one rule.
          '&.Mui-error.Mui-focused:not(.Tecton-focusVisible) .MuiOutlinedInput-notchedOutline': {
            borderColor: cssVar('color-status-error-outline-border-strong'),
          },
        },
      },
    },
    // Tecton gives Select its Tecton chevron but leaves NativeSelect with MUI's filled Material
    // triangle. Use the same chevron, in the text-only Select icon colour (NativeSelect renders an
    // `Input`).
    MuiNativeSelect: {
      defaultProps: { IconComponent: slotIcon('tecton-chevron-down-outline') },
      styleOverrides: { icon: { color: cssVar('color-input-text-only-text') } },
    },
    // Tecton zeroes all padding of an outlined Autocomplete input (`padding: 0 !important`), which
    // also removes the room MUI keeps on the right for the clear and popup buttons, so the text and
    // chips ran under them. Filled inputs keep it. Restore MUI's reserved space for outlined ones.
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '&.MuiAutocomplete-hasPopupIcon .MuiOutlinedInput-root.MuiAutocomplete-inputRoot, &.MuiAutocomplete-hasClearIcon .MuiOutlinedInput-root.MuiAutocomplete-inputRoot':
            { paddingRight: '39px !important' },
          // Both buttons: Tecton's 16px clear button (no padding, 2px gap) and the 24px popup
          // button take 40px; MUI's 65px assumed two 28px buttons.
          '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiOutlinedInput-root.MuiAutocomplete-inputRoot':
            { paddingRight: '52px !important' },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          // Tecton's group clips its children (`overflow: hidden`, for the rounded group border),
          // so the outset `theme.focusVisible` ring of a grouped button showed only where it
          // touched the next button. Draw it inside the button.
          '& .MuiToggleButtonGroup-grouped.Mui-focusVisible': {
            outlineOffset: `calc(-1 * ${cssVar('border-width-200')})`,
          },
        },
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        content: {
          // Tecton 0.11.2 draws the tree item focus ring on `.Mui-focusVisible` and hides
          // `[data-focused]`. MUI X 9 no longer sets `Mui-focusVisible` on tree items (focus moves
          // to the `treeitem` element and is marked with `data-focused`), so keyboard focus was
          // invisible (WCAG 2.4.7). Draw Tecton's ring when the item has keyboard focus. Every
          // row is `position: relative`, so the next row (a child, when expanded) painted over the
          // bottom of the ring; the focused row is lifted above its neighbours.
          '.MuiTreeItem-root:focus-visible > &&': { boxShadow: focusRingShadow, zIndex: 1 },
        },
      },
    },
    MuiPickerDay: {
      styleOverrides: {
        root: {
          // Tecton 0.11.2 styles disabled days as `.MuiPickerDay-disabled`, which MUI X 9 never
          // renders (it uses the global `Mui-disabled`), and its `root` color overrides MUI's own
          // disabled color, so disabled days looked enabled. Apply Tecton's disabled text token to
          // `Mui-disabled`. Selected days are left as the Tecton Storybook renders them (see below).
          '&.Mui-disabled:not(.Mui-selected)': { color: cssVar('color-text-disabled') },
        },
      },
    },
    // MUI X does not augment the theme with MuiTreeItemLoader; the key is still read by the loader.
    ...({
      MuiTreeItemLoader: {
        styleOverrides: {
          root: {
            // Tecton 0.11.2 indents nested tree items with padding on the group and gives item content
            // a fixed inline padding. The loading row keeps MUI's depth-based padding, so inside a
            // nested group it was indented twice. Match the item content there; flat (virtualized)
            // trees have no group and keep the depth-based indent.
            '.MuiTreeItem-groupTransition &': { paddingLeft: cssVar('space-100') },
          },
        },
      },
    } as Record<string, object>),
    MuiTablePagination: {
      defaultProps: {
        // Tecton 0.11.2 passes icon slots via `slotProps.actions.slots`, which MUI 9 ignores;
        // MUI 9 reads TablePaginationActions slots from TablePagination `slots.actions`.
        slots: {
          actions: {
            previousButtonIcon: slotIcon('tecton-chevron-left-outline'),
            nextButtonIcon: slotIcon('tecton-chevron-right-outline'),
            ...tablePaginationFirstLast,
          },
        },
      },
    },
  },
};

export function applyThemeCompat(theme: Theme): Theme {
  const components = (theme.components ?? {}) as Record<
    string,
    { defaultProps?: object; styleOverrides?: object } | undefined
  >;
  // Tecton 0.11.2 themes only MuiSimpleTreeView; RichTreeView shares its item visuals (chevrons).
  if (components.MuiSimpleTreeView && !components.MuiRichTreeView) {
    components.MuiRichTreeView = components.MuiSimpleTreeView;
  }
  // Tecton 0.11.2 sets `defaultProps.disableRipple` on MuiYearCalendar / MuiMonthCalendar. Those
  // MUI X 9 components have no such prop (their buttons have no ripple), so it reached the DOM and
  // React warned about an unknown attribute. Drop it.
  for (const name of ['MuiYearCalendar', 'MuiMonthCalendar']) {
    const defaults = components[name]?.defaultProps as Record<string, unknown> | undefined;
    if (defaults && 'disableRipple' in defaults) {
      const { disableRipple: _ignored, ...rest } = defaults;
      components[name] = { ...components[name], defaultProps: rest };
    }
  }
  // Tecton repeats the menu border pull on the Select menu paper (`defaultProps.MenuProps`), where
  // `sx` outranks the MuiMenu correction above: apply the same fix there.
  const selectPaper = (
    components.MuiSelect?.defaultProps as
      { MenuProps?: { slotProps?: { paper?: { sx?: Record<string, unknown> } } } } | undefined
  )?.MenuProps?.slotProps?.paper;
  if (selectPaper?.sx && '& > :last-child' in selectPaper.sx) {
    selectPaper.sx = {
      ...selectPaper.sx,
      '& > :last-child': { marginBottom: 0 },
      ...menuListBottomPadding,
    };
  }
  // Tecton stripes Data Grid rows with `:nth-of-type(even)`. The grid virtualizes rows: the
  // rendered window starts at any row and is re-rendered on horizontal scroll, so DOM order is not
  // row order and the stripes flipped while scrolling. The DataGrid marks rows by their position
  // (`TectonDataGrid-row--odd`); the rule moves to that class in place, so the hover and selected
  // rules after it still win.
  const grid = components.MuiDataGrid?.styleOverrides as Record<string, unknown> | undefined;
  const row = grid?.row as Record<string, unknown> | undefined;
  if (grid && row && '&:nth-of-type(even)' in row) {
    grid.row = Object.fromEntries(
      Object.entries(row).map(([key, value]) =>
        key === '&:nth-of-type(even)' ? ['&.TectonDataGrid-row--odd', value] : [key, value],
      ),
    );
  }
  // MUI X 9 paints the TimeClock face `rgba(0,0,0,.07)` in both modes and Tecton 0.11.2 has no
  // MuiClock override, so in dark mode the face was invisible. Dark mode only: light keeps the
  // Tecton Storybook rendering.
  if (theme.palette.mode === 'dark') {
    const clock = (components.MuiClock ??= {}) as { styleOverrides?: Record<string, object> };
    clock.styleOverrides = {
      ...clock.styleOverrides,
      clock: { backgroundColor: cssVar('color-component-input-filled-background') },
    };
  }
  // `theme.focusVisible` insets the ring on Tab and ListItemButton (an `overflow: hidden` tab strip
  // or scrolling list clipped Tecton's outset box-shadow ring to one edge). Tecton's own ring rule
  // would draw a second ring outside it, so drop its box-shadow there.
  if (theme.focusVisible) {
    for (const name of ['MuiTab', 'MuiListItemButton']) {
      const entry = components[name];
      const overrides = entry?.styleOverrides as Record<string, unknown> | undefined;
      const root = overrides?.root as Record<string, unknown> | undefined;
      const focus = root?.['&.Mui-focusVisible'] as Record<string, unknown> | undefined;
      if (entry && root && focus && 'boxShadow' in focus) {
        const { boxShadow: _ring, ...rest } = focus;
        // New objects, key order kept: the generated overrides may be shared between themes.
        components[name] = {
          ...entry,
          styleOverrides: { ...overrides, root: { ...root, '&.Mui-focusVisible': rest } },
        };
      }
    }
  }
  // With `theme.focusVisible`, MUI swaps the menu item focus fill for its ring. Tecton menus mark
  // focus with that fill (its Storybook draws the "hovered" option with `Mui-focusVisible`), so
  // menus keep it. Digital clock items (MenuItems too) keep the ring: on the selected time slot the
  // fill change is invisible.
  const menuItem = components.MuiMenuItem;
  const menuItemOverrides = menuItem?.styleOverrides as Record<string, unknown> | undefined;
  const menuItemRoot = menuItemOverrides?.root;
  if (theme.focusVisible && menuItem && menuItemRoot && typeof menuItemRoot === 'object') {
    const menuFocus =
      '&.Mui-focusVisible:not(.MuiDigitalClock-item, .MuiMultiSectionDigitalClockSection-item)';
    const { action, primary } = theme.palette;
    components.MuiMenuItem = {
      ...menuItem,
      styleOverrides: {
        ...menuItemOverrides,
        root: {
          ...menuItemRoot,
          [menuFocus]: { outline: 'none', backgroundColor: action.focus },
          [`&.Mui-selected${menuFocus.slice(1)}`]: {
            backgroundColor: alpha(primary.main, action.selectedOpacity + action.focusOpacity),
          },
        },
      },
    };
  }
  // Tecton draws the input focus ring on `.Tecton-focusVisible`, which only its Storybook adds (by
  // hand, with `useKeyboardFocusVisible`), so plain TextField/Select/NumberField never showed it.
  // The rules also match the attribute that the ThemeProvider's tracker sets on keyboard focus
  // (focusVisible.ts). Rewritten in place, so the cascade order is Tecton's.
  for (const name of Object.keys(components)) {
    const entry = components[name];
    if (
      entry?.styleOverrides &&
      JSON.stringify(entry.styleOverrides).includes('Tecton-focusVisible')
    ) {
      components[name] = { ...entry, styleOverrides: withInputFocusVisible(entry.styleOverrides) };
    }
  }
  // The selected PickerDay state is intentionally NOT aliased: Tecton's `.MuiPickerDay-selected`
  // rule never matches MUI X 9 either, so the official Tecton Storybook shows MUI's own selected day
  // (`primary.main` fill) under Tecton's text color. We match that rendering; see
  // tests/e2e/storybook-parity/REPORT.md.
  return theme;
}
