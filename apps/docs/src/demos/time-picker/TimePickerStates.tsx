import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimePicker from '@tecton-mui/ui/TimePicker';
import Box from '@tecton-mui/ui/Box';

const value = new Date(2026, 0, 12, 19, 0);

export default function TimePickerStates() {
  return (
    <LocalizationProvider>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 240px))' },
          gap: 2,
        }}
      >
        <TimePicker
          label="Helper text"
          defaultValue={value}
          slotProps={{ textField: { helperText: 'Local time of the platform' } }}
        />
        <TimePicker
          label="Clearable"
          defaultValue={value}
          slotProps={{ field: { clearable: true } }}
        />
        <TimePicker label="Read-only" defaultValue={value} readOnly />
        <TimePicker label="Disabled" defaultValue={value} disabled />
      </Box>
    </LocalizationProvider>
  );
}
