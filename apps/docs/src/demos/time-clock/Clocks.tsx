import * as React from 'react';
import DigitalClock from '@tecton-mui/ui/DigitalClock';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import MultiSectionDigitalClock from '@tecton-mui/ui/MultiSectionDigitalClock';
import Stack from '@tecton-mui/ui/Stack';
import TimeClock from '@tecton-mui/ui/TimeClock';

export default function Clocks() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 1, 10, 15));
  return (
    <LocalizationProvider>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
        <TimeClock value={value} onChange={setValue} />
        <DigitalClock value={value} onChange={setValue} timeStep={30} sx={{ maxHeight: 280 }} />
        <MultiSectionDigitalClock value={value} onChange={setValue} />
      </Stack>
    </LocalizationProvider>
  );
}
