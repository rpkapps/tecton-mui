import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import FormControlLabel from '@tecton-mui/ui/FormControlLabel';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Switch from '@tecton-mui/ui/Switch';
import TrapFocus from '@tecton-mui/ui/Unstable_TrapFocus';
import Typography from '@tecton-mui/ui/Typography';

export default function ToggleTrapFocus() {
  const [locked, setLocked] = React.useState(false);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Button variant="text">Before the panel</Button>
      <TrapFocus open={locked} disableAutoFocus disableRestoreFocus>
        <Paper
          variant="outlined"
          role="group"
          aria-label="Focus-locked toolbar"
          tabIndex={-1}
          sx={{ p: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch checked={locked} onChange={(event) => setLocked(event.target.checked)} />
              }
              label="Keep focus in this panel"
            />
            <Button size="small">Zoom in</Button>
            <Button size="small">Zoom out</Button>
          </Stack>
        </Paper>
      </TrapFocus>
      <Button variant="text">After the panel</Button>
      <Typography variant="caption" color="text.secondary" aria-live="polite">
        {locked
          ? 'Focus is trapped: Tab cycles through the switch and the two buttons.'
          : 'Focus moves freely in and out of the panel.'}
      </Typography>
    </Stack>
  );
}
