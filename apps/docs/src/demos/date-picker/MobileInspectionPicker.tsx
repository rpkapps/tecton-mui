import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import MobileDatePicker from '@tecton-mui/ui/MobileDatePicker';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const firstSlot = new Date(2026, 10, 23);
const lastSlot = new Date(2027, 1, 26);
const isWeekend = (day: Date) => day.getDay() === 0 || day.getDay() === 6;

export default function MobileInspectionPicker() {
  // `onChange` follows every tap in the dialog; `onAccept` fires only when the user confirms.
  const [draft, setDraft] = React.useState<Date | null>(null);
  const [booked, setBooked] = React.useState<Date | null>(null);
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ width: 300 }}>
        <MobileDatePicker
          label="Vehicle inspection"
          minDate={firstSlot}
          maxDate={lastSlot}
          shouldDisableDate={isWeekend}
          onChange={setDraft}
          onAccept={setBooked}
          localeText={{ toolbarTitle: 'Inspection date' }}
          slotProps={{
            actionBar: { actions: ['clear', 'cancel', 'accept'] },
            textField: { helperText: 'Workshop is open Monday to Friday' },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Selected: {draft ? draft.toLocaleDateString('en-US') : '—'}
        </Typography>
        <Typography variant="body2">
          Booked: {booked ? booked.toLocaleDateString('en-US') : 'not confirmed yet'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
