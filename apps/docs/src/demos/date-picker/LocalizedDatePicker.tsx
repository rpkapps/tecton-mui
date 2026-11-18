import { de } from 'date-fns/locale/de';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';

export default function LocalizedDatePicker() {
  return (
    <LocalizationProvider adapterLocale={de}>
      <DatePicker label="Datum" defaultValue={new Date(2026, 4, 4)} />
    </LocalizationProvider>
  );
}
