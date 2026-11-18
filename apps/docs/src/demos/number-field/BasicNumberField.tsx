import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';

export default function BasicNumberField() {
  return (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
      <NumberField label="Wells in scope" defaultValue={12} />
      <NumberField label="Survey stations" placeholder="Enter a count" helperText="Optional." />
    </Stack>
  );
}
