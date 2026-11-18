import DateField from '@tecton-mui/ui/DateField';
import DateTimeField from '@tecton-mui/ui/DateTimeField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Stack from '@tecton-mui/ui/Stack';

const value = new Date(2026, 6, 23, 16, 40);

export default function FieldFormats() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ width: 320 }}>
        <DateField label="ISO date" format="yyyy-MM-dd" defaultValue={value} />
        <DateField label="Day and month name" format="EEE, d MMM yyyy" defaultValue={value} />
        <DateTimeField
          label="Log timestamp"
          format="dd.MM.yyyy HH:mm"
          formatDensity="spacious"
          defaultValue={value}
        />
      </Stack>
    </LocalizationProvider>
  );
}
