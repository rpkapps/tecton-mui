import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import MobileTimePicker from '@tecton-mui/ui/MobileTimePicker';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const format = (date: Date | null) =>
  date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';

export default function MobileHandoverPicker() {
  const [handover, setHandover] = React.useState<Date | null>(new Date(2026, 10, 23, 14, 0));
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ width: 280 }}>
        <MobileTimePicker
          label="Shift handover"
          ampm={false}
          minutesStep={15}
          value={handover}
          onAccept={setHandover}
          localeText={{ toolbarTitle: 'Handover time' }}
          slotProps={{ textField: { helperText: 'Quarter-hour steps, 24-hour clock' } }}
        />
        <Typography variant="body2" role="status">
          Confirmed handover: {format(handover)}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
