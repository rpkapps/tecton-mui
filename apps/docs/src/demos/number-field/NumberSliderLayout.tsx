import Stack from '@tecton-mui/ui/Stack';
import NumberSlider from '@tecton-mui/ui/NumberSlider';

export default function NumberSliderLayout() {
  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 360 }}>
      <NumberSlider label="Even split (default)" defaultValue={35} fullWidth />
      <NumberSlider
        label="Wide bar"
        defaultValue={35}
        fullWidth
        slotProps={{ rail: { sx: { flexBasis: '75%' } }, input: { sx: { flexBasis: '25%' } } }}
      />
      <NumberSlider
        label="Fixed input width"
        defaultValue={35}
        fullWidth
        slotProps={{ input: { sx: { flex: '0 0 96px' } } }}
      />
    </Stack>
  );
}
