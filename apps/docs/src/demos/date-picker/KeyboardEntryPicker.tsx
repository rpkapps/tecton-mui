import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import Stack from '@tecton-mui/ui/Stack';

export default function KeyboardEntryPicker() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        <DatePicker
          label="Log run date (ISO)"
          format="yyyy-MM-dd"
          formatDensity="spacious"
          defaultValue={new Date(2026, 1, 20)}
          slotProps={{ textField: { helperText: 'Type digits or use the arrow keys' } }}
        />
        <DatePicker
          label="Opens on the year view"
          openTo="year"
          defaultValue={new Date(2026, 1, 20)}
          reduceAnimations
        />
      </Stack>
    </LocalizationProvider>
  );
}
