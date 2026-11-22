import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import ColorSwatchControl from '@tecton-mui/ui/ColorSwatchControl';

const states = [
  { label: 'Default', props: {} },
  { label: 'Inherited', props: { inherited: true } },
  { label: 'Disabled', props: { disabled: true } },
];

export default function ColorSwatchStates() {
  return (
    <Stack direction="row" spacing={4} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {states.map(({ label, props }) => (
        <Stack key={label} spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Typography id={`swatch-state-${label}`} variant="caption" color="text.secondary">
            {label}
          </Typography>
          <ColorSwatchControl
            defaultValue="#218585"
            aria-labelledby={`swatch-state-${label}`}
            {...props}
          />
        </Stack>
      ))}
    </Stack>
  );
}
