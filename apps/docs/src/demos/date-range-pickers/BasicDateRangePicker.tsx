import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateRangePicker, { type DateRange } from '@tecton-mui/ui/DateRangePicker';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const format = (date: Date | null) => (date ? date.toLocaleDateString('en-US') : '—');

export default function BasicDateRangePicker() {
  const [value, setValue] = React.useState<DateRange<Date>>([
    new Date(2026, 10, 9),
    new Date(2026, 10, 18),
  ]);
  return (
    <LocalizationProvider>
      <Stack spacing={1} sx={{ minWidth: 320 }}>
        <DateRangePicker
          label="Campaign"
          value={value}
          onChange={(next) => setValue(next)}
          localeText={{ start: 'Start', end: 'End' }}
        />
        <Typography variant="body2" color="text.secondary">
          {format(value[0])} to {format(value[1])}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
