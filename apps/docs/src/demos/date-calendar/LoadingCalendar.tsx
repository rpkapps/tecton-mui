import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import DayCalendarSkeleton from '@tecton-mui/ui/DayCalendarSkeleton';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Switch from '@tecton-mui/ui/Switch';
import Stack from '@tecton-mui/ui/Stack';

const renderLoading = () => <DayCalendarSkeleton />;

export default function LoadingCalendar() {
  const [loading, setLoading] = React.useState(true);
  return (
    <LocalizationProvider>
      <Stack sx={{ alignItems: 'center' }}>
        <FormControlLabel
          control={<Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} />}
          label="Loading shift roster"
        />
        <DateCalendar
          aria-label="Shift roster"
          defaultValue={new Date(2026, 10, 2)}
          loading={loading}
          renderLoading={renderLoading}
        />
      </Stack>
    </LocalizationProvider>
  );
}
