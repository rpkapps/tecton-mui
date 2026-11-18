import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import Box from '@tecton-mui/ui/Box';

const completion = new Date(2025, 10, 3);

export default function DatePickerStates() {
  return (
    <LocalizationProvider>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 260px))' },
          gap: 2,
        }}
      >
        <DatePicker
          label="Helper text"
          defaultValue={completion}
          slotProps={{ textField: { helperText: 'Local date of first oil' } }}
        />
        <DatePicker
          label="Clearable"
          defaultValue={completion}
          slotProps={{ field: { clearable: true } }}
        />
        <DatePicker label="Read-only" defaultValue={completion} readOnly />
        <DatePicker label="Disabled" defaultValue={completion} disabled />
        <DatePicker
          label="Required"
          slotProps={{ textField: { required: true, helperText: 'Completion date is required' } }}
        />
        <DatePicker
          label="With error"
          defaultValue={completion}
          slotProps={{ textField: { error: true, helperText: 'Conflicts with rig schedule' } }}
        />
      </Box>
    </LocalizationProvider>
  );
}
