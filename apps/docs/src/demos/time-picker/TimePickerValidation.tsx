import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimePicker from '@tecton-mui/ui/TimePicker';
import type { TimePickerProps } from '@tecton-mui/ui/TimePicker';

// The reason passed to `onError` (`null` when the value is valid).
type TimeValidationError = Parameters<NonNullable<TimePickerProps['onError']>>[0];

const at = (hours: number, minutes = 0) => new Date(2026, 0, 12, hours, minutes);

function message(error: TimeValidationError | null): string {
  if (error === 'minTime') return 'Helicopter flights start at 07:00.';
  if (error === 'maxTime') return 'Last departure is 17:30.';
  // Reasons from `shouldDisableTime` name the view, e.g. `shouldDisableTime-hours`.
  if (error?.startsWith('shouldDisableTime')) return 'The 12:00 slot is reserved for refuelling.';
  if (error === 'invalidDate') return 'Enter a complete time.';
  return 'Between 07:00 and 17:30.';
}

export default function TimePickerValidation() {
  const [error, setError] = React.useState<TimeValidationError | null>(null);
  return (
    <LocalizationProvider>
      <TimePicker
        label="Helicopter departure"
        ampm={false}
        defaultValue={at(6, 30)}
        minTime={at(7)}
        maxTime={at(17, 30)}
        shouldDisableTime={(value, view) => view === 'hours' && value.getHours() === 12}
        onError={setError}
        sx={{ width: 280 }}
        slotProps={{
          textField: {
            helperText: message(error),
          },
        }}
      />
    </LocalizationProvider>
  );
}
