import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import MultiSectionDigitalClock from '@tecton-mui/ui/MultiSectionDigitalClock';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

export default function MultiSectionClock() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 12, 18, 45));
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Paper variant="outlined" sx={{ width: 'fit-content' }}>
          <MultiSectionDigitalClock
            aria-label="Sample time, 24-hour"
            ampm={false}
            timeSteps={{ minutes: 5 }}
            value={value}
            onChange={setValue}
          />
        </Paper>
        <Paper variant="outlined" sx={{ width: 'fit-content' }}>
          <MultiSectionDigitalClock
            aria-label="Sample time with seconds"
            views={['hours', 'minutes', 'seconds']}
            value={value}
            onChange={setValue}
          />
        </Paper>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: '100%', textAlign: 'center' }}
      >
        Both clocks edit the same value:{' '}
        {value?.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </Typography>
    </LocalizationProvider>
  );
}
