import * as React from 'react';
import DateTimeField from '@tecton-mui/ui/DateTimeField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const describe = (value: Date | null) => {
  if (value == null) return 'empty';
  if (Number.isNaN(value.getTime())) return 'incomplete';
  return value.toISOString();
};

export default function ControlledFields() {
  const [value, setValue] = React.useState<Date | null>(new Date(Date.UTC(2026, 3, 2, 9, 30)));
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ width: 320 }}>
        <DateTimeField label="Sample taken" value={value} onChange={setValue} ampm={false} />
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          Sent to the API as{' '}
          <Typography
            component="span"
            variant="body2"
            sx={{ fontFamily: 'var(--tecton-font-family-mono)' }}
          >
            {describe(value)}
          </Typography>
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
