import * as React from 'react';
import TextField from '@tecton-mui/ui/TextField';
import InputAdornment from '@tecton-mui/ui/InputAdornment';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';

export default function ValidationTextField() {
  const [depth, setDepth] = React.useState('12000');
  const invalid = Number.isNaN(Number(depth)) || Number(depth) > 10000;
  return (
    <Stack spacing={2} sx={{ width: 320 }}>
      <TextField
        label="Target depth"
        value={depth}
        onChange={(event) => setDepth(event.target.value)}
        error={invalid}
        helperText={invalid ? 'Enter a number up to 10,000.' : 'Maximum 10,000 m.'}
        slotProps={{
          input: { endAdornment: <InputAdornment position="end">m</InputAdornment> },
          htmlInput: { inputMode: 'numeric' },
        }}
      />
      <TextField
        label="Search wells"
        type="search"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="search" size="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField label="Read only" defaultValue="WELL-0042" disabled />
    </Stack>
  );
}
