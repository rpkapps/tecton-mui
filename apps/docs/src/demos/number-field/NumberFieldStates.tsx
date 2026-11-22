import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';
import NumberSlider from '@tecton-mui/ui/NumberSlider';
import NumberSpinner from '@tecton-mui/ui/NumberSpinner';

const row = { flexWrap: 'wrap', alignItems: 'flex-start' } as const;

export default function NumberFieldStates() {
  return (
    <Stack spacing={2}>
      {(['outlined', 'filled'] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} useFlexGap sx={row}>
          <NumberField variant={variant} label="Disabled" defaultValue={10} disabled />
          <NumberField variant={variant} label="Read only" defaultValue={10} readOnly />
          <NumberField
            variant={variant}
            label="Max pressure"
            defaultValue={520}
            error
            helperText="Must not exceed 500 bar."
            required
          />
        </Stack>
      ))}
      {(['outlined', 'filled'] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} useFlexGap sx={row}>
          <NumberSpinner variant={variant} label="Disabled" defaultValue={2} disabled />
          <NumberSpinner
            variant={variant}
            label="Error"
            defaultValue={0}
            min={0}
            error
            helperText="At least 1."
          />
        </Stack>
      ))}
      <Stack direction="row" spacing={2} useFlexGap sx={row}>
        <NumberSlider label="Disabled" defaultValue={35} disabled />
        <NumberSlider label="Read only" defaultValue={35} readOnly />
        <NumberSlider
          label="Fill level"
          defaultValue={96}
          error
          helperText="Above the 90% limit."
        />
      </Stack>
    </Stack>
  );
}
