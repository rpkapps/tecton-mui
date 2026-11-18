import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDatePicker from '@tecton-mui/ui/StaticDatePicker';
import Paper from '@tecton-mui/ui/Paper';

export default function StaticCalendarPicker() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 8, 7));
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <StaticDatePicker
          value={value}
          onChange={setValue}
          displayWeekNumber
          slotProps={{ actionBar: { actions: ['today', 'clear'] } }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
