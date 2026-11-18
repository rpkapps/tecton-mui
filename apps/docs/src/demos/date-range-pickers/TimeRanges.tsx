import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimeRangePicker from '@tecton-mui/ui/TimeRangePicker';
import DateTimeRangePicker from '@tecton-mui/ui/DateTimeRangePicker';
import Stack from '@tecton-mui/ui/Stack';

export default function TimeRanges() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ minWidth: 340 }}>
        <TimeRangePicker
          label="Shift"
          defaultValue={[new Date(2026, 0, 1, 7, 0), new Date(2026, 0, 1, 19, 0)]}
          minutesStep={15}
        />
        <DateTimeRangePicker
          label="Maintenance window"
          defaultValue={[new Date(2026, 10, 20, 22, 0), new Date(2026, 10, 21, 4, 0)]}
          ampm={false}
        />
      </Stack>
    </LocalizationProvider>
  );
}
