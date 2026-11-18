// Runtime compatibility corrections between the pinned Tecton theme and the pinned MUI release.
// Each entry documents the upstream assumption it corrects; remove entries once Tecton catches up.
import type { Theme, ThemeOptions } from '@mui/material/styles';
import { slotIcon } from './generated/mui/components/shared.js';
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
  // PickerDay states are intentionally NOT aliased. Tecton 0.11.2 styles `.MuiPickerDay-selected`
  // / `-disabled`, which MUI X 9 never renders (it renders `Mui-selected` / `Mui-disabled`), so the
  // official Tecton Storybook shows MUI's own selected day (`primary.main` fill) under Tecton's text
  // color. We match that rendering; see tests/e2e/storybook-parity/REPORT.md.
  return theme;
}
