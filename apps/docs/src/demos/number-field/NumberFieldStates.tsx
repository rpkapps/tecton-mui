import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

export default function NumberFieldStates() {
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <NumberField label="Disabled" defaultValue={10} disabled />
        <NumberField label="Read only" defaultValue={10} readOnly />
        <NumberField
          label="Max pressure"
          defaultValue={520}
          error
          helperText="Must not exceed 500 bar."
          required
        />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <NumberSpinner label="Disabled" defaultValue={2} disabled />
        <NumberSpinner label="Error" defaultValue={0} min={0} error helperText="At least 1." />
      </Stack>
    </Stack>
  );
}
