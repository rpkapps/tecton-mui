import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateField from '@tecton-mui/ui/DateField';
import TimeField from '@tecton-mui/ui/TimeField';
import Box from '@tecton-mui/ui/Box';

const sampled = new Date(2026, 10, 12, 9, 40);
const VARIANTS = ['outlined', 'filled', 'standard'] as const;

export default function FieldInputVariants() {
  return (
    <LocalizationProvider>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 180px))' },
          gap: 2,
        }}
      >
        {VARIANTS.map((variant) => (
          <DateField
            key={variant}
            label={`Sampled (${variant})`}
            variant={variant}
            defaultValue={sampled}
          />
        ))}
        {VARIANTS.map((variant) => (
          <TimeField
            key={variant}
            label={`At (${variant})`}
            variant={variant}
            size="small"
            defaultValue={sampled}
          />
        ))}
      </Box>
    </LocalizationProvider>
  );
}
