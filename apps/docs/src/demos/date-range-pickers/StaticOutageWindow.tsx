import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import StaticDateTimeRangePicker from '@tecton-mui/ui/StaticDateTimeRangePicker';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';
import type { DateRange } from '@tecton-mui/ui/DateTimeRangePicker';

const format = (date: Date | null) =>
  date ? date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '…';

export default function StaticOutageWindow() {
  // `onChange` previews the window; `onAccept` (OK) publishes it to the status page.
  const [draft, setDraft] = React.useState<DateRange<Date>>([null, null]);
  const [published, setPublished] = React.useState<DateRange<Date> | null>(null);
  return (
    <LocalizationProvider>
      <Stack spacing={1.5} sx={{ alignItems: 'center', maxWidth: '100%' }}>
        <Paper variant="outlined" sx={{ overflow: 'auto', maxWidth: '100%' }}>
          <StaticDateTimeRangePicker
            value={draft}
            onChange={(next) => setDraft(next)}
            onAccept={(next) => setPublished(next)}
            referenceDate={new Date(2026, 11, 12, 1, 0)}
            minDate={new Date(2026, 11, 1)}
            ampm={false}
            minutesStep={30}
            localeText={{
              start: 'Outage starts',
              end: 'Service restored',
              toolbarTitle: 'Planned outage',
            }}
          />
        </Paper>
        <Typography variant="body2" role="status">
          {published
            ? `Published: ${format(published[0])} to ${format(published[1])}`
            : 'Pick both endpoints and press OK to publish'}
        </Typography>
      </Stack>
    </LocalizationProvider>
  );
}
