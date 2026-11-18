import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';

export default function MinMaxStep() {
  return (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
      <NumberField
        label="Choke size"
        defaultValue={32}
        min={8}
        max={64}
        step={4}
        helperText="8 to 64, in steps of 4."
      />
      <NumberField
        label="Water cut"
        defaultValue={0.35}
        min={0}
        max={1}
        step={0.05}
        smallStep={0.01}
        largeStep={0.25}
        format={{ style: 'percent', maximumFractionDigits: 1 }}
        helperText="Alt: 1 %, Shift: 25 %."
      />
    </Stack>
  );
}
