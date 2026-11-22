import { Box, MenuItem, Stack, TextField } from '@tecton-mui/ui';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

/** One input of each kind and variant, in tab order, for the keyboard focus ring. */
export function InputFocusScenario() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <button type="button">Start</button>
        <TextField variant="outlined" label="Outlined text" />
        <TextField variant="filled" label="Filled text" />
        <TextField select variant="outlined" label="Outlined select" defaultValue="m">
          <MenuItem value="m">Meters</MenuItem>
          <MenuItem value="ft">Feet</MenuItem>
        </TextField>
        <TextField select variant="filled" label="Filled select" defaultValue="m">
          <MenuItem value="m">Meters</MenuItem>
          <MenuItem value="ft">Feet</MenuItem>
        </TextField>
        <NumberField label="Outlined number" defaultValue={1} />
        <NumberField variant="filled" label="Filled number" defaultValue={1} />
        <NumberSpinner label="Spinner" defaultValue={1} />
        <TextField variant="outlined" label="Invalid text" defaultValue="x" error />
      </Stack>
    </Box>
  );
}
