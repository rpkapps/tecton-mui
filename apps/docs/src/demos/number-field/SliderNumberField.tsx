import InputAdornment from '@tecton-mui/ui/InputAdornment';
import Stack from '@tecton-mui/ui/Stack';
import NumberRangeSlider from '@tecton-mui/ui/NumberRangeSlider';
import NumberSlider from '@tecton-mui/ui/NumberSlider';

const unit = (text: string) => ({
  input: { endAdornment: <InputAdornment position="end">{text}</InputAdornment> },
});

export default function SliderNumberField() {
  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 300 }}>
      <NumberRangeSlider
        label="Frequency"
        defaultValue={[10, 50]}
        min={0}
        max={80}
        slotProps={unit('Hz')}
        fullWidth
      />
      <NumberSlider
        label="Step"
        defaultValue={5}
        min={1}
        max={16}
        slotProps={unit('Hz')}
        fullWidth
      />
      <NumberSlider
        label="Window length"
        defaultValue={16}
        min={1}
        max={28}
        slotProps={unit('ms')}
        fullWidth
      />
      <NumberSlider
        label="Window offset"
        defaultValue={0}
        min={0}
        max={10}
        slotProps={unit('ms')}
        fullWidth
      />
    </Stack>
  );
}
