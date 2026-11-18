import * as React from 'react';
import DatePicker from '@tecton-mui/ui/DatePicker';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Stack from '@tecton-mui/ui/Stack';

const minDate = new Date(2026, 0, 1);
const maxDate = new Date(2026, 11, 31);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export default function ValidatedDatePicker() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 2, 16));
  const [error, setError] = React.useState<string | null>(null);
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        <DatePicker
          label="Inspection date"
          value={value}
          onChange={setValue}
          minDate={minDate}
          maxDate={maxDate}
          shouldDisableDate={isWeekend}
          onError={(reason) => setError(reason)}
          slotProps={{
            textField: {
              helperText: error ? 'Choose a weekday in 2026.' : 'Weekdays in 2026 only.',
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
