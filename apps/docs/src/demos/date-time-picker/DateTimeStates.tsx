import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';
import Box from '@tecton-mui/ui/Box';

const value = new Date(2026, 2, 9, 7, 45);

export default function DateTimeStates() {
  return (
    <LocalizationProvider>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 280px))' },
          gap: 2,
        }}
      >
        <DateTimePicker
          label="Helper text"
          defaultValue={value}
          slotProps={{ textField: { helperText: 'Local time of the platform' } }}
        />
        <DateTimePicker
          label="Clearable"
          defaultValue={value}
          slotProps={{ field: { clearable: true } }}
        />
        <DateTimePicker label="Read-only" defaultValue={value} readOnly />
        <DateTimePicker label="Disabled" defaultValue={value} disabled />
      </Box>
    </LocalizationProvider>
  );
}
