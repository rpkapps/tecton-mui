// Runtime compatibility corrections between the pinned Tecton theme and the pinned MUI release.
// Each entry documents the upstream assumption it corrects; remove entries once Tecton catches up.
import type { ThemeOptions } from '@mui/material/styles';
import { slotIcon } from './generated/mui/components/shared.js';

export const muiCompatOverrides: ThemeOptions = {
  components: {
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
