import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';

export default function BasicButtons() {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </Stack>
  );
}
