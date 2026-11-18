import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import { TimePicker } from '@tecton-mui/ui/TimePicker';
import Stack from '@tecton-mui/ui/Stack';

export default function BasicTimePicker() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 1, 7, 30));
  return (
    <LocalizationProvider>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TimePicker label="Shift start" value={value} onChange={setValue} />
        <TimePicker label="24-hour clock" ampm={false} minutesStep={15} defaultValue={value} />
      </Stack>
    </LocalizationProvider>
  );
}
