import Stack from '@tecton-mui/ui/Stack';
import NumberField from '@tecton-mui/ui/NumberField';

export default function FormattedNumberFields() {
  return (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
      <NumberField
        label="Budget"
        defaultValue={250000}
        step={1000}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      />
      <NumberField label="Porosity" defaultValue={0.18} step={0.01} format={{ style: 'percent' }} />
      <NumberField
        label="Measured depth"
        defaultValue={3250}
        step={10}
        format={{ style: 'unit', unit: 'meter' }}
      />
      <NumberField
        label="Tiefe (de-DE)"
        locale="de-DE"
        defaultValue={1234.5}
        step={0.5}
        format={{ minimumFractionDigits: 1 }}
      />
    </Stack>
  );
}
