import * as React from 'react';
import Backdrop from '@tecton-mui/ui/Backdrop';
import Button from '@tecton-mui/ui/Button';
import CircularProgress from '@tecton-mui/ui/CircularProgress';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Typography from '@tecton-mui/ui/Typography';

export default function LocalBackdrop() {
  const [loading, setLoading] = React.useState(false);
  const [refreshed, setRefreshed] = React.useState(0);

  React.useEffect(() => {
    if (!loading) return undefined;
    const timer = setTimeout(() => {
      setLoading(false);
      setRefreshed((n) => n + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Paper
      variant="outlined"
      aria-busy={loading}
      sx={{ position: 'relative', overflow: 'hidden', width: 360, p: 3 }}
    >
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6" component="h3">
          Production summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {refreshed === 0 ? 'Not refreshed yet.' : `Refreshed ${refreshed} time(s).`}
        </Typography>
        <Button variant="contained" onClick={() => setLoading(true)} disabled={loading}>
          Refresh
        </Button>
      </Stack>
      <Backdrop
        open={loading}
        sx={(theme) => ({ position: 'absolute', zIndex: 1, color: theme.palette.common.white })}
      >
        <CircularProgress color="inherit" aria-label="Refreshing the summary" />
      </Backdrop>
    </Paper>
  );
}
