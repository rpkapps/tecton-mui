import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticTimeRangePicker from '@tecton-mui/ui/StaticTimeRangePicker';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import type { DateRange } from '@tecton-mui/ui/TimeRangePicker';

const at = (hours: number, minutes = 0) => new Date(2026, 10, 23, hours, minutes);

function describe([start, end]: DateRange<Date>) {
  if (!start || !end) return 'Choose the start and the end of the shift';
  let minutes = (end.getTime() - start.getTime()) / 60000;
  if (minutes <= 0) minutes += 24 * 60; // A night shift ends on the next day.
  return `Shift length: ${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export default function StaticShiftPattern() {
  const [shift, setShift] = React.useState<DateRange<Date>>([at(14), at(22)]);
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <StaticTimeRangePicker
            displayStaticWrapperAs="desktop"
            value={shift}
            onChange={(next) => setShift(next)}
            ampm={false}
            timeSteps={{ minutes: 30 }}
            localeText={{ start: 'Clock in', end: 'Clock out' }}
          />
        </Paper>
        <Typography variant="body2" role="status">
          {describe(shift)}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
