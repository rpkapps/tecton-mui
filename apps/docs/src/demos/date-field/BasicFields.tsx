import DateField from '@tecton-mui/ui/DateField';
import DateTimeField from '@tecton-mui/ui/DateTimeField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Stack from '@tecton-mui/ui/Stack';
import TimeField from '@tecton-mui/ui/TimeField';

export default function BasicFields() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 300 }}>
        <DateField label="Survey date" />
        <TimeField label="Shift start" defaultValue={new Date(2026, 0, 1, 6, 45)} />
        <DateTimeField label="Recorded at" defaultValue={new Date(2026, 0, 1, 14, 5)} />
      </Stack>
    </LocalizationProvider>
  );
}
