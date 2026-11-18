import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import Stack from '@tecton-mui/ui/Stack';

export default function ReportingMonthPicker() {
  return (
    <LocalizationProvider>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <DatePicker
          label="Reporting month"
          views={['year', 'month']}
          openTo="month"
          defaultValue={new Date(2026, 5, 1)}
          minDate={new Date(2020, 0, 1)}
          maxDate={new Date(2026, 11, 31)}
        />
        <DatePicker
          label="Fiscal year"
          views={['year']}
          defaultValue={new Date(2026, 0, 1)}
          minDate={new Date(2015, 0, 1)}
          maxDate={new Date(2030, 11, 31)}
        />
      </Stack>
    </LocalizationProvider>
  );
}
