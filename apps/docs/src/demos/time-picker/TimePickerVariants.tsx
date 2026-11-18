import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimePicker from '@tecton-mui/ui/TimePicker';
import DesktopTimePicker from '@tecton-mui/ui/DesktopTimePicker';
import MobileTimePicker from '@tecton-mui/ui/MobileTimePicker';
import Stack from '@tecton-mui/ui/Stack';

const shiftStart = new Date(2026, 10, 23, 6, 30);

export default function TimePickerVariants() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <DesktopTimePicker
          label="Shift start (desktop)"
          defaultValue={shiftStart}
          slotProps={{ textField: { helperText: 'Digital lists in a popover' } }}
        />
        <MobileTimePicker
          label="Shift start (mobile)"
          defaultValue={shiftStart}
          slotProps={{ textField: { helperText: 'Analog clock in a dialog' } }}
        />
        <TimePicker
          label="Shift start (responsive)"
          defaultValue={shiftStart}
          slotProps={{ textField: { helperText: 'Chosen from the pointer type' } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
