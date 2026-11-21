import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

const row = { flexWrap: 'wrap', alignItems: 'flex-start' } as const;

export default function NumberFieldStates() {
  return (
    <Stack spacing={2}>
      {(['outlined', 'filled'] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} useFlexGap sx={row}>
          <NumberField variant={variant} label="Disabled" defaultValue={10} disabled />
          <NumberField variant={variant} label="Read only" defaultValue={10} readOnly />
          <NumberField
            variant={variant}
            label="Max pressure"
            defaultValue={520}
            error
            helperText="Must not exceed 500 bar."
            required
          />
        </Stack>
      ))}
      {(['outlined', 'filled'] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} useFlexGap sx={row}>
          <NumberSpinner variant={variant} label="Disabled" defaultValue={2} disabled />
          <NumberSpinner
            variant={variant}
            label="Error"
            defaultValue={0}
            min={0}
            error
            helperText="At least 1."
          />
        </Stack>
      ))}
    </Stack>
  );
}
