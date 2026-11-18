// Runtime compatibility corrections between the pinned Tecton theme and the pinned MUI release.
// Each entry documents the upstream assumption it corrects; remove entries once Tecton catches up.
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { focusRingShadow, slotIcon } from './generated/mui/components/shared.js';
import { cssVar } from './generated/core/index.js';

export const muiCompatOverrides: ThemeOptions = {
  components: {
    MuiDataGrid: {
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
        columnHeader: {
          // Tecton zeroes the padding of body checkbox cells ("Figma DataGrid Checkbox cell has no
          // padding") but not of the header checkbox cell, which shifts the select-all checkbox
          // 10px off the row checkboxes. Mirror the body rule on the header cell.
          '&.MuiDataGrid-columnHeaderCheckbox': { padding: 0 },
        },
      },
    } as NonNullable<ThemeOptions['components']>['MuiDataGrid'],
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
