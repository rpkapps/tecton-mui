import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimePicker from '@tecton-mui/ui/TimePicker';
import Stack from '@tecton-mui/ui/Stack';

const start = new Date(2026, 0, 12, 6, 0, 0);

export default function TimePickerSteps() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 280 }}>
        <TimePicker label="Tour start (hours only)" views={['hours']} defaultValue={start} />
        <TimePicker
          label="Sampling time (15 min steps)"
          timeSteps={{ minutes: 15 }}
          defaultValue={start}
        />
        <TimePicker
          label="Event timestamp (seconds)"
          views={['hours', 'minutes', 'seconds']}
          ampm={false}
          defaultValue={start}
        />
      </Stack>
    </LocalizationProvider>
  );
}
