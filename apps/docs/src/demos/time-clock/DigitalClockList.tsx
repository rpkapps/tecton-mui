import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DigitalClock from '@tecton-mui/ui/DigitalClock';
import Paper from '@tecton-mui/ui/Paper';
import Typography from '@tecton-mui/ui/Typography';

export default function DigitalClockList() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 12, 9, 30));
  return (
    <LocalizationProvider>
      <Paper variant="outlined" sx={{ width: 200, overflow: 'hidden' }}>
        <Typography variant="subtitle2" component="h3" id="crew-change" sx={{ px: 2, pt: 1.5 }}>
          Crew change slot
        </Typography>
        <DigitalClock
          aria-labelledby="crew-change"
          value={value}
          onChange={setValue}
          timeStep={30}
          sx={{ maxHeight: 260 }}
        />
      </Paper>
    </LocalizationProvider>
  );
}
