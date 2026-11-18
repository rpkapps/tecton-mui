import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import TimeClock from '@tecton-mui/ui/TimeClock';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

const value = new Date(2026, 0, 12, 4, 40);

export default function ClockStates() {
  return (
    <LocalizationProvider>
      <Stack
        direction="row"
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            readOnly
          </Typography>
          <TimeClock defaultValue={value} readOnly />
        </Stack>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            disabled
          </Typography>
          <TimeClock defaultValue={value} disabled />
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
}
