import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import {
  PickersLayoutContentWrapper,
  PickersLayoutRoot,
  pickersLayoutClasses,
  usePickerLayout,
  type PickersLayoutProps,
} from '@tecton-mui/ui/PickersLayout';
import Box from '@tecton-mui/ui/Box';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';
import { usePickerContext } from '@tecton-mui/ui';

const today = new Date(2026, 10, 18);
const DAY = 24 * 60 * 60 * 1000;

function TripSummary() {
  const { value } = usePickerContext<Date | null>();
  const days = value ? Math.round((value.getTime() - today.getTime()) / DAY) : null;
  return (
    <Box
      sx={{ gridColumn: '1 / 4', gridRow: 4, px: 3, py: 1.5, borderTop: 1, borderColor: 'divider' }}
    >
      <Typography variant="subtitle2">Trip summary</Typography>
      <Typography variant="body2" color="text.secondary" role="status">
        {value && days != null
          ? `Departs ${value.toLocaleDateString('en-US', { weekday: 'long' })}, in ${days} days. Book rail travel at least 3 days ahead.`
          : 'Choose a departure date.'}
      </Typography>
    </Box>
  );
}

// A custom layout gets the rendered parts from `usePickerLayout` and arranges them itself. Here the
// action bar moves to the top-right corner and a summary row is added below the calendar.
function TripLayout(props: PickersLayoutProps<Date | null>) {
  const { toolbar, tabs, content, actionBar, shortcuts, ownerState } = usePickerLayout(props);
  return (
    <PickersLayoutRoot
      ownerState={ownerState}
      className={pickersLayoutClasses.root}
      sx={{
        [`& .${pickersLayoutClasses.toolbar}`]: { gridColumn: 2, gridRow: 1 },
        [`& .${pickersLayoutClasses.actionBar}`]: { gridColumn: 3, gridRow: 1, alignSelf: 'start' },
      }}
    >
      {toolbar}
      {actionBar}
      {shortcuts}
      <PickersLayoutContentWrapper
        ownerState={ownerState}
        className={pickersLayoutClasses.contentWrapper}
        sx={{ gridColumn: '2 / 4' }}
      >
        {tabs}
        {content}
      </PickersLayoutContentWrapper>
      <TripSummary />
    </PickersLayoutRoot>
  );
}

const slots = { layout: TripLayout };

export default function SummaryLayout() {
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <StaticDatePicker
          defaultValue={new Date(2026, 10, 30)}
          referenceDate={today}
          minDate={today}
          localeText={{ toolbarTitle: 'Departure' }}
          slots={slots}
          slotProps={{ actionBar: { actions: ['clear'] } }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
