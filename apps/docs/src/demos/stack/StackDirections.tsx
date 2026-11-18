import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Divider from '@tecton-mui/ui/Divider';

function Item({ children }: { children: string }) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
      {children}
    </Paper>
  );
}

export default function StackDirections() {
  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
        <Item>Wells</Item>
        <Item>Faults</Item>
        <Item>Horizons</Item>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
        <Item>Responsive</Item>
        <Item>column on phones</Item>
        <Item>row from sm</Item>
      </Stack>
    </Stack>
  );
}
