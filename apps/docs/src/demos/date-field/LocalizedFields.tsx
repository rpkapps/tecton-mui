import { ar } from 'date-fns/locale/ar';
import { fr } from 'date-fns/locale/fr';
import DateField from '@tecton-mui/ui/DateField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import Stack from '@tecton-mui/ui/Stack';
import TimeField from '@tecton-mui/ui/TimeField';

const value = new Date(2026, 10, 5, 8, 15);

export default function LocalizedFields() {
  return (
    <Stack spacing={2} sx={{ width: 300 }}>
      <LocalizationProvider adapterLocale={fr}>
        <DateField label="Date (fr)" defaultValue={value} />
      </LocalizationProvider>
      <LocalizationProvider adapterLocale={ar}>
        <TimeField label="الوقت (ar)" defaultValue={value} />
      </LocalizationProvider>
    </Stack>
  );
}
