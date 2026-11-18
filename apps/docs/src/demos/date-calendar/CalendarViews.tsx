import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';

export default function CalendarViews() {
  return (
    <LocalizationProvider>
      <DateCalendar
        aria-label="Commissioning date"
        views={['year', 'month', 'day']}
        openTo="year"
        defaultValue={new Date(2026, 4, 12)}
        minDate={new Date(2000, 0, 1)}
        maxDate={new Date(2035, 11, 31)}
      />
    </LocalizationProvider>
  );
}
