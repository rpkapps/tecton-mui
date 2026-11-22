import { Box, InputAdornment, Stack } from '@tecton-mui/ui';
import NumberRangeSlider from '@tecton-mui/ui/NumberRangeSlider';
import NumberSlider from '@tecton-mui/ui/NumberSlider';

const unit = (text: string) => ({
  input: { endAdornment: <InputAdornment position="end">{text}</InputAdornment> },
});

/** A settings panel of slider fields, 300px wide (the layout of the design reference). */
export function NumberSliderScenario() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3} sx={{ width: 300 }}>
        <NumberRangeSlider
          label="Frequency"
          defaultValue={[10, 50]}
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
        <NumberSlider label="Opacity" defaultValue={35} fullWidth />
        <NumberSlider
          label="Wide bar"
          defaultValue={35}
          fullWidth
          slotProps={{ rail: { sx: { flexBasis: '75%' } }, input: { sx: { flexBasis: '25%' } } }}
        />
      </Stack>
    </Box>
  );
}
