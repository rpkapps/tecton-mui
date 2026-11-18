import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateRangeCalendar from '@tecton-mui/ui/DateRangeCalendar';
import type { DateRange } from '@tecton-mui/ui/DateRangePicker';

export default function RangeCalendar() {
  const [value, setValue] = React.useState<DateRange<Date>>([null, null]);
  return (
    <LocalizationProvider>
      <DateRangeCalendar
        value={value}
        onChange={(next) => setValue(next)}
        calendars={2}
        referenceDate={new Date(2026, 10, 1)}
      />
    </LocalizationProvider>
  );
}
