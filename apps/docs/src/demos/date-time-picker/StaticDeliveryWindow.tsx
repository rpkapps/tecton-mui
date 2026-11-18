import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDateTimePicker from '@tecton-mui/ui/StaticDateTimePicker';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const opens = new Date(2026, 11, 1, 6, 0);
const closes = new Date(2026, 11, 1, 18, 0);
const isSunday = (day: Date) => day.getDay() === 0;

export default function StaticDeliveryWindow() {
  const [slot, setSlot] = React.useState<Date | null>(new Date(2026, 11, 2, 9, 0));
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ alignItems: 'center', maxWidth: '100%' }}>
        <Paper variant="outlined" sx={{ overflow: 'auto', maxWidth: '100%' }}>
          {/* Landscape puts the toolbar beside the views, which suits wide kiosk screens. */}
          <StaticDateTimePicker
            orientation="landscape"
            ampm={false}
            value={slot}
            onChange={setSlot}
            referenceDate={opens}
            minDate={opens}
            shouldDisableDate={isSunday}
            minTime={opens}
            maxTime={closes}
            minutesStep={30}
            localeText={{ toolbarTitle: 'Delivery slot' }}
            slotProps={{ actionBar: { actions: ['cancel', 'accept'] } }}
          />
        </Paper>
        <Typography variant="body2" role="status">
          {slot ? slot.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }) : '—'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
