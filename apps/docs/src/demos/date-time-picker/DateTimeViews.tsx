import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';
import Stack from '@tecton-mui/ui/Stack';

const value = new Date(2026, 6, 4, 13, 0);

export default function DateTimeViews() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        <DateTimePicker
          label="Hourly reading"
          views={['year', 'month', 'day', 'hours']}
          defaultValue={value}
        />
        <DateTimePicker
          label="Seismic shot time"
          views={['day', 'hours', 'minutes', 'seconds']}
          ampm={false}
          format="dd MMM yyyy HH:mm:ss"
          defaultValue={value}
        />
      </Stack>
    </LocalizationProvider>
  );
}
