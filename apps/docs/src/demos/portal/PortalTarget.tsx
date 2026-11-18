import * as React from 'react';
import Alert from '@tecton-mui/ui/Alert';
import Box from '@tecton-mui/ui/Box';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Portal from '@tecton-mui/ui/Portal';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';
import Typography from '@tecton-mui/ui/Typography';

export default function PortalTarget() {
  const [usePortal, setUsePortal] = React.useState(true);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 480 }}>
      <FormControlLabel
        control={
          <Switch checked={usePortal} onChange={(event) => setUsePortal(event.target.checked)} />
        }
        label="Render the message through Portal"
      />
      <Box
        sx={{
          height: 72,
          overflow: 'hidden',
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Panel with a fixed height and overflow: hidden
        </Typography>
        {container && (
          <Portal container={container} disablePortal={!usePortal}>
            <Alert severity="info">
              This message is declared inside the clipped panel. With Portal it is mounted in the
              target below and is no longer cut off.
            </Alert>
          </Portal>
        )}
      </Box>
      <Box
        ref={setContainer}
        aria-label="Portal target"
        role="region"
        sx={{
          minHeight: 48,
          p: 1.5,
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      />
    </Stack>
  );
}
