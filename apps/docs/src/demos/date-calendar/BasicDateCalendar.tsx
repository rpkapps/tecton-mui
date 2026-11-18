import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DateCalendar from '@tecton-mui/ui/DateCalendar';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

export default function BasicDateCalendar() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 8, 18));
  return (
    <LocalizationProvider>
      <Paper variant="outlined" component="section" aria-labelledby="inspection-calendar">
        <Typography
          variant="subtitle2"
          component="h3"
          id="inspection-calendar"
          sx={{ px: 3, pt: 2 }}
        >
          Inspection date: {value?.toLocaleDateString('en-US', { dateStyle: 'medium' }) ?? '—'}
        </Typography>
        <DateCalendar value={value} onChange={setValue} />
      </Paper>
    </LocalizationProvider>
  );
}
