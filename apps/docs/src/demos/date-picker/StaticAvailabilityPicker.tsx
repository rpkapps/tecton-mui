import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

// Days of December 2026 on which the training room is fully booked.
const FULLY_BOOKED = new Set([2, 3, 9, 10, 11, 16]);

const isUnavailable = (day: Date) =>
  day.getDay() === 0 ||
  day.getDay() === 6 ||
  (day.getFullYear() === 2026 && day.getMonth() === 11 && FULLY_BOOKED.has(day.getDate()));

export default function StaticAvailabilityPicker() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 11, 4));
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {/* `displayStaticWrapperAs="desktop"` drops the toolbar; an empty action bar hides the buttons. */}
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={value}
            onChange={setValue}
            referenceDate={new Date(2026, 11, 1)}
            minDate={new Date(2026, 11, 1)}
            maxDate={new Date(2027, 0, 31)}
            shouldDisableDate={isUnavailable}
            slotProps={{ actionBar: { actions: [] } }}
          />
        </Paper>
        <Typography variant="body2" role="status">
          {value
            ? `Training room held for ${value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
            : 'Choose a free day'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
