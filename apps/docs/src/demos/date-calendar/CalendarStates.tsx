import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const value = new Date(2026, 1, 11);

export default function CalendarStates() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            readOnly
          </Typography>
          <DateCalendar aria-label="Read-only calendar" defaultValue={value} readOnly />
        </Stack>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            disabled
          </Typography>
          <DateCalendar aria-label="Disabled calendar" defaultValue={value} disabled />
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
}
