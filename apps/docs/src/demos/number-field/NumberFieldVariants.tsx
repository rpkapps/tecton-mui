import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

export default function NumberFieldVariants() {
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <NumberField label="Outlined" defaultValue={25} />
        <NumberField variant="filled" label="Filled" defaultValue={25} />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <NumberSpinner label="Outlined" defaultValue={4} min={0} />
        <NumberSpinner variant="filled" label="Filled" defaultValue={4} min={0} />
      </Stack>
    </Stack>
  );
}
