import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const spudDate = new Date(2026, 3, 14);

export default function ControlledDatePicker() {
  const [value, setValue] = React.useState<Date | null>(spudDate);
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        <DatePicker label="Spud date" value={value} onChange={setValue} />
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {value ? `Stored value: ${value.toDateString()}` : 'No date selected'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => setValue(spudDate)}>
            Reset to plan
          </Button>
          <Button size="small" onClick={() => setValue(null)}>
            Clear
          </Button>
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
}
