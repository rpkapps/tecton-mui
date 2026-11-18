import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DesktopTimeRangePicker from '@tecton-mui/ui/DesktopTimeRangePicker';
import MobileTimeRangePicker from '@tecton-mui/ui/MobileTimeRangePicker';
import Stack from '@tecton-mui/ui/Stack';
import type { DateRange } from '@tecton-mui/ui/TimeRangePicker';

const earlyShift: DateRange<Date> = [new Date(2026, 10, 23, 6, 0), new Date(2026, 10, 23, 14, 0)];

export default function TimeRangeVariants() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 320 }}>
        <DesktopTimeRangePicker
          label="Early shift (desktop)"
          defaultValue={earlyShift}
          ampm={false}
          timeSteps={{ minutes: 15 }}
          slotProps={{ textField: { helperText: 'Digital lists for start and end' } }}
        />
        <MobileTimeRangePicker
          label="Early shift (mobile)"
          defaultValue={earlyShift}
          ampm={false}
          minutesStep={15}
          slotProps={{ textField: { helperText: 'Clock in a dialog, one endpoint per tab' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
