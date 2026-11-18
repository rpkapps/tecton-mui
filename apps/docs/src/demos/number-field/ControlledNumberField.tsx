import * as React from 'react';
import Stack from '@tecton-mui/ui/Stack';
import Button from '@tecton-mui/ui/Button';
import Typography from '@tecton-mui/ui/Typography';
import NumberField from '@tecton-mui/ui/NumberField';

export default function ControlledNumberField() {
  const [value, setValue] = React.useState<number | null>(1500);
  const [committed, setCommitted] = React.useState<number | null>(1500);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <NumberField
        label="Target rate"
        value={value}
        onValueChange={setValue}
        onValueCommitted={setCommitted}
        min={0}
        step={100}
        format={{ style: 'unit', unit: 'liter-per-minute' }}
      />
      <Typography variant="body2" color="text.secondary">
        Value: {value ?? 'empty'} · Committed: {committed ?? 'empty'}
      </Typography>
      <Button variant="outlined" size="small" onClick={() => setValue(null)}>
        Clear
      </Button>
    </Stack>
  );
}
