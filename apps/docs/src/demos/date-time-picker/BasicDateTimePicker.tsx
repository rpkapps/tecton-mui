import * as React from 'react';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Typography from '@tecton-mui/ui/Typography';
import Stack from '@tecton-mui/ui/Stack';

export default function BasicDateTimePicker() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 5, 12, 14, 0));
  return (
    <LocalizationProvider>
      <Stack spacing={1}>
        <DateTimePicker
          label="Maintenance window"
          value={value}
          onChange={setValue}
          disablePast={false}
          minutesStep={5}
        />
        <Typography variant="body2" color="text.secondary">
          {value
            ? value.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
            : 'No date selected'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
