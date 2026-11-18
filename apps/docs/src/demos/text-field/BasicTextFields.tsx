import Stack from '@tecton-mui/ui/Stack';
import TextField from '@tecton-mui/ui/TextField';

export default function BasicTextFields() {
  return (
    <Stack spacing={2} sx={{ width: 320 }}>
      <TextField label="Project name" defaultValue="Northern field study" />
      <TextField label="Owner" required helperText="Shown on reports." />
      <TextField label="Description" multiline minRows={3} />
    </Stack>
  );
}
