import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';

export default function ButtonColors() {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button variant="contained" color="primary">
        Primary
      </Button>
      <Button variant="contained" color="secondary">
        Secondary
      </Button>
      <Button variant="text" color="tertiary">
        Tertiary
      </Button>
      <Button variant="text" color="textOnly">
        Text only
      </Button>
      <Button variant="contained" color="error">
        Delete
      </Button>
    </Stack>
  );
}
