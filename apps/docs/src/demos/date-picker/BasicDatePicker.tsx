import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import { DatePicker } from '@tecton-mui/ui/DatePicker';

export default function BasicDatePicker() {
  return (
    <LocalizationProvider>
      <DatePicker label="Start date" />
    </LocalizationProvider>
  );
}
