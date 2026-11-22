import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import Paper from '@tecton-mui/ui/Paper';
import { pickersLayoutClasses } from '@tecton-mui/ui/PickersLayout';

// `slotProps.layout` reaches the PickersLayout root. Its parts carry `pickersLayoutClasses`, so
// they can be restyled without replacing any component.
const layoutStyles = {
  [`& .${pickersLayoutClasses.toolbar}`]: {
    bgcolor: 'action.selected',
    borderRight: 1,
    borderColor: 'divider',
  },
  [`& .${pickersLayoutClasses.actionBar}`]: {
    borderTop: 1,
    borderColor: 'divider',
  },
};

export default function LayoutStyling() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <StaticDatePicker
          orientation="landscape"
          defaultValue={new Date(2027, 0, 11)}
          localeText={{ toolbarTitle: 'Course start' }}
          slotProps={{
            layout: { sx: layoutStyles },
            actionBar: { actions: ['clear', 'accept'] },
          }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
