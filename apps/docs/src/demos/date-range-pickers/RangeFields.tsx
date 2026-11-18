import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import SingleInputDateRangeField from '@tecton-mui/ui/SingleInputDateRangeField';
import MultiInputDateRangeField from '@tecton-mui/ui/MultiInputDateRangeField';
import Stack from '@tecton-mui/ui/Stack';

export default function RangeFields() {
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ minWidth: 340 }}>
        <SingleInputDateRangeField
          label="Reporting period"
          defaultValue={[new Date(2026, 0, 1), new Date(2026, 2, 31)]}
        />
        <MultiInputDateRangeField
          defaultValue={[new Date(2026, 3, 1), new Date(2026, 5, 30)]}
          localeText={{ start: 'From', end: 'To' }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
