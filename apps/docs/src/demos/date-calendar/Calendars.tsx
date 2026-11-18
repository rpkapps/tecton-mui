import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import MonthCalendar from '@tecton-mui/ui/MonthCalendar';
import YearCalendar from '@tecton-mui/ui/YearCalendar';
import Stack from '@tecton-mui/ui/Stack';

export default function Calendars() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 8, 18));
  return (
    <LocalizationProvider>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
        <DateCalendar value={value} onChange={setValue} />
        <Stack spacing={2}>
          <MonthCalendar value={value} onChange={setValue} />
          <YearCalendar
            value={value}
            onChange={setValue}
            minDate={new Date(2020, 0, 1)}
            maxDate={new Date(2030, 0, 1)}
          />
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
}
