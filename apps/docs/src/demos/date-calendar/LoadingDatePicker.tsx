import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DatePicker from '@tecton-mui/ui/DatePicker';
import DayCalendarSkeleton from '@tecton-mui/ui/DayCalendarSkeleton';

const renderLoading = () => <DayCalendarSkeleton />;

export default function LoadingDatePicker() {
  // Each month switch simulates a 600 ms request for the rig's available inspection days.
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const handleMonthChange = React.useCallback(() => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), 600);
  }, []);

  return (
    <LocalizationProvider>
      <DatePicker
        label="Rig inspection"
        defaultValue={new Date(2026, 11, 9)}
        loading={loading}
        renderLoading={renderLoading}
        onMonthChange={handleMonthChange}
        slotProps={{ textField: { helperText: 'Change the month to load its availability' } }}
      />
    </LocalizationProvider>
  );
}
