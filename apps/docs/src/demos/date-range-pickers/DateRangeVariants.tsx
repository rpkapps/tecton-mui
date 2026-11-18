import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DesktopDateRangePicker from '@tecton-mui/ui/DesktopDateRangePicker';
import MobileDateRangePicker from '@tecton-mui/ui/MobileDateRangePicker';
import Stack from '@tecton-mui/ui/Stack';
import type { DateRange } from '@tecton-mui/ui/DateRangePicker';

const stay: DateRange<Date> = [new Date(2026, 11, 18), new Date(2026, 11, 22)];
const nights = { start: 'Check-in', end: 'Check-out' };

export default function DateRangeVariants() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 320 }}>
        <DesktopDateRangePicker
          label="Hotel stay (desktop)"
          defaultValue={stay}
          localeText={nights}
          slotProps={{ textField: { helperText: 'Two months in a popover' } }}
        />
        <MobileDateRangePicker
          label="Hotel stay (mobile)"
          defaultValue={stay}
          localeText={nights}
          slotProps={{ textField: { helperText: 'One month in a dialog with Cancel / OK' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
