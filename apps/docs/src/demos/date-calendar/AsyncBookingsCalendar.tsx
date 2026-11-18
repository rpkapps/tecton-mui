import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import DayCalendarSkeleton from '@tecton-mui/ui/DayCalendarSkeleton';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import type { PickerDayOwnerState } from '@tecton-mui/ui/PickerDay';

// Stands in for a request to a booking service: resolves with the booked days of a month.
function fetchBookedDays(month: Date, signal: AbortSignal): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const seed = month.getFullYear() * 12 + month.getMonth();
      resolve([3, 7, 11, 12, 18, 24, 25].map((d) => ((d + seed) % 27) + 1));
    }, 900);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

const renderLoading = () => <DayCalendarSkeleton />;
const bookedStyle = { fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 };

export default function AsyncBookingsCalendar() {
  const [month, setMonth] = React.useState(() => new Date(2026, 11, 1));
  const [booked, setBooked] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();
    fetchBookedDays(month, controller.signal)
      .then((days) => {
        setBooked(days);
        setLoading(false);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [month]);

  const handleMonthChange = React.useCallback((next: Date) => {
    setLoading(true);
    setMonth(next);
  }, []);

  // Memoized so the calendar does not receive a new slotProps object on every render.
  const slotProps = React.useMemo(() => {
    const days = new Set(booked);
    return {
      day: (ownerState: PickerDayOwnerState) =>
        !ownerState.isDayOutsideMonth && days.has(ownerState.day.getDate())
          ? { sx: bookedStyle, title: 'Booked' }
          : {},
    };
  }, [booked]);

  return (
    <LocalizationProvider>
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <DateCalendar
          aria-label="Meeting room bookings"
          referenceDate={month}
          onMonthChange={handleMonthChange}
          loading={loading}
          renderLoading={renderLoading}
          slotProps={slotProps}
        />
        <Typography variant="body2" color="text.secondary" role="status">
          {loading ? 'Loading bookings…' : `${booked.length} booked days (underlined)`}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
