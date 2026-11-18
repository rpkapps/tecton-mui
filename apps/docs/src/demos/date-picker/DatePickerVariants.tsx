import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import DesktopDatePicker from '@tecton-mui/ui/DesktopDatePicker';
import MobileDatePicker from '@tecton-mui/ui/MobileDatePicker';
import Stack from '@tecton-mui/ui/Stack';

const siteVisit = new Date(2026, 11, 3);

export default function DatePickerVariants() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <DesktopDatePicker
          label="Site visit (desktop)"
          defaultValue={siteVisit}
          slotProps={{ textField: { helperText: 'Always opens a popover' } }}
        />
        <MobileDatePicker
          label="Site visit (mobile)"
          defaultValue={siteVisit}
          slotProps={{ textField: { helperText: 'Always opens a dialog' } }}
        />
        <DatePicker
          label="Site visit (responsive)"
          defaultValue={siteVisit}
          slotProps={{ textField: { helperText: 'Popover with a mouse, dialog on touch' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
