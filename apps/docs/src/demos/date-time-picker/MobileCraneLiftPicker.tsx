import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import MobileDateTimePicker from '@tecton-mui/ui/MobileDateTimePicker';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

// Lifts are planned in daylight hours only, at least one day ahead of the reference date.
const earliest = new Date(2026, 10, 19, 7, 0);
const isNight = (value: Date, view: string) =>
  view === 'hours' && (value.getHours() < 7 || value.getHours() > 17);

export default function MobileCraneLiftPicker() {
  const [lift, setLift] = React.useState<Date | null>(null);
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ width: 300 }}>
        <MobileDateTimePicker
          label="Crane lift"
          ampm={false}
          minutesStep={15}
          minDateTime={earliest}
          referenceDate={earliest}
          shouldDisableTime={isNight}
          onAccept={setLift}
          localeText={{ toolbarTitle: 'Schedule the lift' }}
          slotProps={{
            actionBar: { actions: ['clear', 'cancel', 'accept'] },
            textField: { helperText: 'Daylight slots from 07:00 to 17:45' },
          }}
        />
        <Typography variant="body2" role="status">
          {lift
            ? `Lift scheduled for ${lift.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
            : 'No lift scheduled'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
