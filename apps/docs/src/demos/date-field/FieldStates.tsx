import DateField from '@tecton-mui/ui/DateField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Box from '@tecton-mui/ui/Box';

const value = new Date(2026, 0, 30);

export default function FieldStates() {
  return (
    <LocalizationProvider>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 240px))' },
          gap: 2,
        }}
      >
        <DateField
          label="Helper text"
          helperText="Local date of the platform"
          defaultValue={value}
        />
        <DateField label="Clearable" clearable defaultValue={value} />
        <DateField label="Read-only" readOnly defaultValue={value} />
        <DateField label="Disabled" disabled defaultValue={value} />
        <DateField label="Required" required />
        <DateField label="Full width" fullWidth defaultValue={value} />
      </Box>
    </LocalizationProvider>
  );
}
