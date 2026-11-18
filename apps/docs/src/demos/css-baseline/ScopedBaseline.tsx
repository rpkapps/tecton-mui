import Paper from '@tecton-mui/ui/Paper';
import ScopedCssBaseline from '@tecton-mui/ui/ScopedCssBaseline';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

function HostedContent() {
  return (
    <>
      <p style={{ margin: 0 }}>
        Plain HTML from a hosted feature, with <b>bold</b> text and a native control:
      </p>
      <p style={{ marginBottom: 0 }}>
        <label>
          Filter <input type="search" placeholder="Well name" />
        </label>
      </p>
    </>
  );
}

export default function ScopedBaseline() {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
      <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
        <Typography variant="overline" component="h3">
          Without a scoped baseline
        </Typography>
        <HostedContent />
      </Paper>
      <Paper variant="outlined" sx={{ flex: 1, overflow: 'hidden' }}>
        <ScopedCssBaseline sx={{ p: 2, height: '100%' }}>
          <Typography variant="overline" component="h3">
            Inside ScopedCssBaseline
          </Typography>
          <HostedContent />
        </ScopedCssBaseline>
      </Paper>
    </Stack>
  );
}
