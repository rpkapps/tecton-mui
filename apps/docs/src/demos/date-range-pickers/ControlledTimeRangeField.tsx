import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import SingleInputTimeRangeField from '@tecton-mui/ui/SingleInputTimeRangeField';
import Stack from '@tecton-mui/ui/Stack';
import Button from '@tecton-mui/ui/Button';
import Typography from '@tecton-mui/ui/Typography';
import type { DateRange } from '@tecton-mui/ui/SingleInputTimeRangeField';

const at = (hours: number, minutes = 0) => new Date(2026, 0, 5, hours, minutes);
const isValid = (date: Date | null): date is Date => date != null && !isNaN(date.getTime());

const PRESETS: { label: string; value: DateRange<Date> }[] = [
  { label: 'Morning', value: [at(6), at(14)] },
  { label: 'Day', value: [at(9), at(17, 30)] },
  { label: 'Evening', value: [at(14), at(22)] },
];

export default function ControlledTimeRangeField() {
  const [value, setValue] = React.useState<DateRange<Date>>(PRESETS[1].value);
  const [start, end] = value;
  const hours =
    isValid(start) && isValid(end) ? (end.getTime() - start.getTime()) / 3_600_000 : null;
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ width: 340 }}>
        <Stack direction="row" spacing={1}>
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              size="small"
              variant="outlined"
              onClick={() => setValue(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </Stack>
        <SingleInputTimeRangeField
          label="Cover period"
          format="HH:mm"
          value={value}
          onChange={(next) => setValue(next)}
        />
        <Typography variant="body2" color="text.secondary" role="status">
          {hours != null && hours > 0 ? `${hours} hours of cover` : 'Enter a valid period'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
