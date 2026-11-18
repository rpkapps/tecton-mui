import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimeClock from '@tecton-mui/ui/TimeClock';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const formatTime = (date: Date | null) =>
  date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'not set';

export default function AnalogClock() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 12, 10, 15));
  return (
    <LocalizationProvider>
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <TimeClock value={value} onChange={setValue} ampmInClock />
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          Pump restart scheduled at {formatTime(value)}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
