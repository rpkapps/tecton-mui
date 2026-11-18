import Stack from '@tecton-mui/ui/Stack';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

export default function SpinnerNumberField() {
  return (
    <Stack
      direction="row"
      spacing={3}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
      <NumberSpinner label="Crew on site" defaultValue={6} min={1} max={20} />
      <NumberSpinner
        label="Sample bottles"
        defaultValue={24}
        min={0}
        step={6}
        helperText="Packed in cases of 6."
      />
    </Stack>
  );
}
