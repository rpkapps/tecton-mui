import CircularProgress from '@tecton-mui/ui/CircularProgress';
import Stack from '@tecton-mui/ui/Stack';

export default function CircularIndicators() {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <CircularProgress aria-label="Loading wells" />
      <CircularProgress color="secondary" aria-label="Loading" />
      <CircularProgress variant="determinate" value={72} aria-label="Upload progress" />
      <CircularProgress size={24} aria-label="Loading" />
    </Stack>
  );
}
