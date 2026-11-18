import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';

// The permit is valid from 1 June 08:00 until 30 June 20:00.
const permitStart = new Date(2026, 5, 1, 8, 0);
const permitEnd = new Date(2026, 5, 30, 20, 0);

export default function DateTimeValidation() {
  return (
    <LocalizationProvider>
      <DateTimePicker
        label="Hot work start"
        ampm={false}
        minDateTime={permitStart}
        maxDateTime={permitEnd}
        defaultValue={new Date(2026, 5, 1, 9, 0)}
        sx={{ width: 300 }}
        slotProps={{ textField: { helperText: 'Within the permit window (1–30 June)' } }}
      />
    </LocalizationProvider>
  );
}
