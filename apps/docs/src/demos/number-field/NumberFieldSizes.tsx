import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSlider from '@tecton-mui/ui/NumberSlider';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

export default function NumberFieldSizes() {
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-end' }}
      >
        <NumberField label="Medium" defaultValue={40} />
        <NumberField label="Small" size="small" defaultValue={40} />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-end' }}
      >
        <NumberSpinner label="Medium" defaultValue={4} min={0} />
        <NumberSpinner label="Small" size="small" defaultValue={4} min={0} />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-end' }}
      >
        <NumberSlider label="Medium" defaultValue={35} />
        <NumberSlider label="Small" size="small" defaultValue={35} />
      </Stack>
    </Stack>
  );
}
