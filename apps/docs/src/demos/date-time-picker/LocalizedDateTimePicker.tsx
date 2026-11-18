import { nb } from 'date-fns/locale/nb';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateTimePicker from '@tecton-mui/ui/DateTimePicker';

export default function LocalizedDateTimePicker() {
  return (
    <LocalizationProvider adapterLocale={nb}>
      <DateTimePicker
        label="Mannskapsbytte"
        defaultValue={new Date(2026, 9, 14, 18, 30)}
        sx={{ width: 300 }}
      />
    </LocalizationProvider>
  );
}
