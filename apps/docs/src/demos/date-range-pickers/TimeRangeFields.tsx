import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import SingleInputTimeRangeField from '@tecton-mui/ui/SingleInputTimeRangeField';
import SingleInputDateTimeRangeField from '@tecton-mui/ui/SingleInputDateTimeRangeField';
import Stack from '@tecton-mui/ui/Stack';
import type { RangeFieldValidationError } from '@tecton-mui/ui/SingleInputTimeRangeField';

const day = (hours: number, minutes = 0) => new Date(2026, 0, 5, hours, minutes);

const MESSAGES: Record<string, string> = {
  minTime: 'The depot opens at 06:00',
  maxTime: 'The depot closes at 22:00',
  invalidRange: 'Closing time must be after opening time',
  invalidDate: 'Use the format 08:00 – 18:00',
};

export default function TimeRangeFields() {
  const [error, setError] = React.useState<RangeFieldValidationError>([null, null]);
  const message = error[0] ?? error[1];
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 380 }}>
        <SingleInputTimeRangeField
          label="Depot opening hours"
          ampm={false}
          defaultValue={[day(8), day(18)]}
          minTime={day(6)}
          maxTime={day(22)}
          onError={setError}
          helperText={message ? (MESSAGES[message] ?? message) : 'Between 06:00 and 22:00'}
        />
        <SingleInputDateTimeRangeField
          label="Planned network outage"
          ampm={false}
          defaultValue={[new Date(2026, 11, 12, 1, 0), new Date(2026, 11, 12, 4, 30)]}
          helperText="Start and end in one input"
        />
      </Stack>
    </LocalizationProvider>
  );
}
