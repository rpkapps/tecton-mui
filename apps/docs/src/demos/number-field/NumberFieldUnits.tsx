import InputAdornment from '@tecton-mui/ui/InputAdornment';
import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

const unit = (text: string) => ({
  input: { endAdornment: <InputAdornment position="end">{text}</InputAdornment> },
});

const row = { flexWrap: 'wrap', alignItems: 'flex-start' } as const;

export default function NumberFieldUnits() {
  return (
    <Stack spacing={2}>
      {(['outlined', 'filled'] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} useFlexGap sx={row}>
          <NumberField
            variant={variant}
            label="Sample rate"
            defaultValue={48}
            min={8}
            max={192}
            slotProps={unit('kHz')}
          />
          <NumberField
            variant={variant}
            label="Window length"
            defaultValue={16}
            min={1}
            slotProps={unit('ms')}
          />
          <NumberSpinner
            variant={variant}
            label="Step"
            defaultValue={5}
            min={1}
            max={16}
            slotProps={unit('Hz')}
          />
          <NumberSpinner
            variant={variant}
            label="Overlap"
            defaultValue={50}
            min={0}
            max={95}
            step={5}
            slotProps={unit('%')}
          />
        </Stack>
      ))}
    </Stack>
  );
}
