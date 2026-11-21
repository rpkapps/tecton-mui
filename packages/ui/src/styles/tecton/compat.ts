// Runtime compatibility corrections between the pinned Tecton theme and the pinned MUI release.
// Each entry documents the upstream assumption it corrects; remove entries once Tecton catches up.
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { focusRingShadow, slotIcon } from './generated/mui/components/shared.js';
import { cssVar } from './generated/core/index.js';

// Tecton sets `outline: none` on focused Data Grid cells and column headers and draws nothing
// instead, so keyboard focus is invisible while navigating with the arrow keys (WCAG 2.4.7).
// Draw Tecton's 2px focus-ring colour inside the cell (an outer ring would be clipped by the
// neighbouring cells), for keyboard focus only (`:focus-visible`, also when the focus is on a
// control inside the cell: checkbox, row reorder handle).
const gridFocusRing = {
  '&:focus-visible, &:has(:focus-visible)': {
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

export const muiCompatOverrides: ThemeOptions = {
  components: {
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
        },
      },
      styleOverrides: {
        root: {
          // Table dividers use Tecton's action/outlined/border token. MUI X otherwise derives a
          // neutral gray from palette.divider (it reads palette.TableCell.border only for
          // CSS-variables themes), which is what row lines, header and separators used.
          '&&': { '--DataGrid-t-color-border-base': cssVar('color-action-outlined-border') },
        },
        // Tecton puts a bottom border on the header container, but MUI X already draws one on every
        // header cell (in --DataGrid-t-color-border-base above); together they render 2px.
        columnHeaders: { borderBottom: 'none' },
        // Tecton draws the Figma 1px inside stroke of hovered/selected rows as a real border and
        // shrinks the cells to fit, which shifts every cell 1px right and down on hover. Draw the
        // stroke as an overlay instead (rows are position: relative in MUI X), above pinned cells
        // (z-index 30) and below the sticky header/footer containers (40).
        row: {
          '&:hover, &.Mui-selected': {
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
          borderTop: `${cssVar('border-width-100')} solid ${cssVar('color-action-outlined-border')}`,
        },
        // Header icons and title as in Tecton's table (the MUI Table drop-in in the Tecton
        // Storybook): Tecton's grid theme draws 24px sort icons in the action colour, leaves the
        // column menu button in MUI's default colour (black / white) and uses a regular-weight
        // title. The table uses 16px icons in the header text colour and a medium-weight title.
        sortIcon: {
          color: cssVar('color-text-secondary'),
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
        cell: gridFocusRing,
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
    },
    MuiTreeItem: {
      styleOverrides: {
        content: {
          // Tecton 0.11.2 draws the tree item focus ring on `.Mui-focusVisible` and hides
          // `[data-focused]`. MUI X 9 no longer sets `Mui-focusVisible` on tree items (focus moves
          // to the `treeitem` element and is marked with `data-focused`), so keyboard focus was
          // invisible (WCAG 2.4.7). Draw Tecton's ring when the item has keyboard focus.
          '.MuiTreeItem-root:focus-visible > &&': { boxShadow: focusRingShadow },
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
  // The selected PickerDay state is intentionally NOT aliased: Tecton's `.MuiPickerDay-selected`
  // rule never matches MUI X 9 either, so the official Tecton Storybook shows MUI's own selected day
  // (`primary.main` fill) under Tecton's text color. We match that rendering; see
  // tests/e2e/storybook-parity/REPORT.md.
  return theme;
}
