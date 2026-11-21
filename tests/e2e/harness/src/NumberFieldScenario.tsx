import { Box, Stack, TextField } from '@tecton-mui/ui';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

/** Both variants of the number fields in their error state, next to an outlined TextField. */
export function NumberFieldScenario() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <NumberField label="Outlined error" defaultValue={520} error helperText="Too high." />
        <NumberField
          variant="filled"
          label="Filled error"
          defaultValue={520}
          error
          helperText="Too high."
        />
        <TextField variant="outlined" label="Text error" defaultValue="x" error />
        <NumberSpinner label="Outlined spinner" defaultValue={0} min={0} error />
        <NumberSpinner variant="filled" label="Filled spinner" defaultValue={4} min={0} />
      </Stack>
    </Box>
  );
}
