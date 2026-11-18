import { nb } from 'date-fns/locale/nb';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';

export default function LocalizedCalendar() {
  return (
    <LocalizationProvider adapterLocale={nb}>
      <DateCalendar
        aria-label="Kalender"
        defaultValue={new Date(2026, 11, 7)}
        displayWeekNumber
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
      />
    </LocalizationProvider>
  );
}
