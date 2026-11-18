import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticTimePicker from '@tecton-mui/ui/StaticTimePicker';
import { renderDigitalClockTimeView } from '@tecton-mui/ui';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const day = (hours: number, minutes = 0) => new Date(2026, 10, 24, hours, minutes);

export default function StaticPickupSlots() {
  const [slot, setSlot] = React.useState<Date | null>(day(10, 30));
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <StaticTimePicker
            displayStaticWrapperAs="desktop"
            // One scrollable list of slots (every 30 minutes) instead of the clock face.
            views={['hours']}
            viewRenderers={{ hours: renderDigitalClockTimeView }}
            value={slot}
            onChange={setSlot}
            minTime={day(8)}
            maxTime={day(16, 30)}
            slotProps={{ actionBar: { actions: [] } }}
          />
        </Paper>
        <Typography variant="body2" role="status">
          Pick-up at the warehouse gate:{' '}
          {slot ? slot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
