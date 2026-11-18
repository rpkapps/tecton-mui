import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import DigitalClock from '@tecton-mui/ui/DigitalClock';
import MultiSectionDigitalClock from '@tecton-mui/ui/MultiSectionDigitalClock';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const day = (hours: number, minutes = 0) => new Date(2026, 0, 12, hours, minutes);
// Lift operations pause between 12:00 and 13:00.
const isBreak = (time: Date, view: string) => view === 'hours' && time.getHours() === 12;

export default function ClockValidation() {
  const [value, setValue] = React.useState<Date | null>(day(8));
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" id="lift-window">
            06:00 – 18:00, lunch break skipped
          </Typography>
          <Paper variant="outlined" sx={{ width: 180 }}>
            <DigitalClock
              aria-labelledby="lift-window"
              ampm={false}
              timeStep={60}
              minTime={day(6)}
              maxTime={day(18)}
              shouldDisableTime={isBreak}
              skipDisabled
              value={value}
              onChange={setValue}
              sx={{ maxHeight: 240 }}
            />
          </Paper>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" id="lift-window-sections">
            Same rules, disabled options shown
          </Typography>
          <Paper variant="outlined" sx={{ width: 'fit-content' }}>
            <MultiSectionDigitalClock
              aria-labelledby="lift-window-sections"
              ampm={false}
              timeSteps={{ minutes: 15 }}
              minTime={day(6)}
              maxTime={day(18)}
              shouldDisableTime={isBreak}
              value={value}
              onChange={setValue}
            />
          </Paper>
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
}
