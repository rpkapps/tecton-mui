import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DesktopDateTimeRangePicker from '@tecton-mui/ui/DesktopDateTimeRangePicker';
import MobileDateTimeRangePicker from '@tecton-mui/ui/MobileDateTimeRangePicker';
import Stack from '@tecton-mui/ui/Stack';
import type { DateRange } from '@tecton-mui/ui/DateTimeRangePicker';

const changeWindow: DateRange<Date> = [new Date(2026, 11, 5, 22, 0), new Date(2026, 11, 6, 2, 30)];

export default function DateTimeRangeVariants() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 360 }}>
        <DesktopDateTimeRangePicker
          label="Change window (desktop)"
          defaultValue={changeWindow}
          ampm={false}
          slotProps={{ textField: { helperText: 'Calendar and time lists in a popover' } }}
        />
        <MobileDateTimeRangePicker
          label="Change window (mobile)"
          defaultValue={changeWindow}
          ampm={false}
          slotProps={{ textField: { helperText: 'Date and time tabs in a dialog' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
