import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import MonthCalendar from '@tecton-mui/ui/MonthCalendar';
import YearCalendar from '@tecton-mui/ui/YearCalendar';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

export default function MonthAndYearCalendars() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 2, 1));
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Paper variant="outlined" sx={{ py: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ px: 2 }}
            id="prod-year"
          >
            Production year
          </Typography>
          <YearCalendar
            aria-labelledby="prod-year"
            value={value}
            onChange={setValue}
            minDate={new Date(2018, 0, 1)}
            maxDate={new Date(2029, 11, 31)}
          />
        </Paper>
        <Paper variant="outlined" sx={{ py: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ px: 2 }}
            id="prod-month"
          >
            Month
          </Typography>
          <MonthCalendar aria-labelledby="prod-month" value={value} onChange={setValue} />
        </Paper>
      </Stack>
    </LocalizationProvider>
  );
}
