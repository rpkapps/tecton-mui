import * as React from 'react';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimeClock from '@tecton-mui/ui/TimeClock';
import Stack from '@tecton-mui/ui/Stack';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';

type ClockView = 'hours' | 'minutes' | 'seconds';

export default function ClockViews() {
  const [view, setView] = React.useState<ClockView>('minutes');
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 12, 14, 20, 45));
  return (
    <LocalizationProvider>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, next: ClockView | null) => next && setView(next)}
          aria-label="Clock view"
        >
          <ToggleButton value="hours">Hours</ToggleButton>
          <ToggleButton value="minutes">Minutes</ToggleButton>
          <ToggleButton value="seconds">Seconds</ToggleButton>
        </ToggleButtonGroup>
        <TimeClock
          ampm={false}
          views={['hours', 'minutes', 'seconds']}
          view={view}
          onViewChange={setView}
          value={value}
          onChange={setValue}
        />
      </Stack>
    </LocalizationProvider>
  );
}
