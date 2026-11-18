import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';

// Planned shutdown: 14–18 September 2026. Weekends are not bookable either.
const isUnavailable = (date: Date) =>
  date.getDay() === 0 ||
  date.getDay() === 6 ||
  (date.getFullYear() === 2026 &&
    date.getMonth() === 8 &&
    date.getDate() >= 14 &&
    date.getDate() <= 18);

export default function CalendarValidation() {
  return (
    <LocalizationProvider>
      <DateCalendar
        aria-label="Bookable vessel days"
        defaultValue={new Date(2026, 8, 9)}
        minDate={new Date(2026, 8, 1)}
        maxDate={new Date(2026, 10, 30)}
        shouldDisableDate={isUnavailable}
      />
    </LocalizationProvider>
  );
}
