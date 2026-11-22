import { Box, MenuItem, Stack, TextField } from '@tecton-mui/ui';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

/**
 * Both variants of the number fields in their error state, next to an outlined TextField and a
 * Select of each variant in error (the stepper arrows match the Select chevron).
 */
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
        {(['outlined', 'filled'] as const).map((variant) => (
          <TextField
            key={variant}
            select
            variant={variant}
            label={`${variant === 'outlined' ? 'Outlined' : 'Filled'} select error`}
            defaultValue="m"
            error
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="m">Meters</MenuItem>
            <MenuItem value="ft">Feet</MenuItem>
          </TextField>
        ))}
        <NumberSpinner label="Outlined spinner" defaultValue={0} min={0} error />
        <NumberSpinner variant="filled" label="Filled spinner" defaultValue={4} min={0} />
      </Stack>
    </Box>
  );
}
