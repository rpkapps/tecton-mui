import Alert from '@tecton-mui/ui/Alert';
import Stack from '@tecton-mui/ui/Stack';

export default function SeverityAlerts() {
  return (
    <Stack spacing={2}>
      <Alert severity="success">The model was published.</Alert>
      <Alert severity="info">A new Tecton release is available.</Alert>
      <Alert severity="warning">Two wells have no deviation survey.</Alert>
      <Alert severity="error">The import failed. Check the file format.</Alert>
    </Stack>
  );
}
