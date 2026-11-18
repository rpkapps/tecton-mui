import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';
import DesktopDateTimePicker from '@tecton-mui/ui/DesktopDateTimePicker';
import MobileDateTimePicker from '@tecton-mui/ui/MobileDateTimePicker';
import Stack from '@tecton-mui/ui/Stack';

const departure = new Date(2026, 11, 14, 7, 45);

export default function DateTimePickerVariants() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <DesktopDateTimePicker
          label="Departure (desktop)"
          defaultValue={departure}
          slotProps={{ textField: { helperText: 'Calendar and lists side by side' } }}
        />
        <MobileDateTimePicker
          label="Departure (mobile)"
          defaultValue={departure}
          slotProps={{ textField: { helperText: 'One view after the other' } }}
        />
        <DateTimePicker
          label="Departure (responsive)"
          defaultValue={departure}
          slotProps={{ textField: { helperText: 'Chosen from the pointer type' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
