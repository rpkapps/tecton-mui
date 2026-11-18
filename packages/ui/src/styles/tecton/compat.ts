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
        columnHeaders: {
          borderBottom: `${cssVar('border-width-100')} solid ${cssVar('color-action-outlined-border')}`,
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

/**
 * MUI X 9 renders PickerDay `selected`/`disabled` as the global state classes `Mui-selected` /
 * `Mui-disabled`, while Tecton 0.11.2 styles `.MuiPickerDay-selected` / `.MuiPickerDay-disabled`,
 * which never match. Alias the Tecton rules onto the classes MUI actually renders (values are
 * copied from the generated theme, never re-declared here).
 */
const PICKER_DAY_STATE_ALIASES: Record<string, string> = {
  '&.MuiPickerDay-selected': '&.Mui-selected',
  '&.MuiPickerDay-disabled': '&.Mui-disabled',
  '&.MuiPickerDay-today:not(.MuiPickerDay-selected)': '&.MuiPickerDay-today:not(.Mui-selected)',
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
  const root = (
    theme.components as Record<string, { styleOverrides?: { root?: unknown } }> | undefined
  )?.MuiPickerDay?.styleOverrides?.root;
  if (root && typeof root === 'object') {
    const rules = root as Record<string, unknown>;
    for (const [from, to] of Object.entries(PICKER_DAY_STATE_ALIASES)) {
      if (rules[from] !== undefined && rules[to] === undefined) rules[to] = rules[from];
    }
  }
  return theme;
}
