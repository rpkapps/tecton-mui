import Stack from '@tecton-mui/ui/Stack';
import TextField from '@tecton-mui/ui/TextField';
import ColorSwatchControl from '@tecton-mui/ui/ColorSwatchControl';

export default function ColorSwatchSizes() {
  return (
    <Stack spacing={2}>
      {(['small', 'medium'] as const).map((size) => (
        <Stack key={size} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            variant="filled"
            size={size}
            defaultValue={`Fault (${size})`}
            slotProps={{ htmlInput: { 'aria-label': `Layer name, ${size}` } }}
          />
          <ColorSwatchControl
            size={size}
            defaultValue="#C2410C"
            aria-label={`Layer color, ${size}`}
          />
        </Stack>
      ))}
    </Stack>
  );
}
