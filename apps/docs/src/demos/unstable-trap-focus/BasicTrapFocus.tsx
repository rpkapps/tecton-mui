import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import TextField from '@tecton-mui/ui/TextField';
import TrapFocus from '@tecton-mui/ui/Unstable_TrapFocus';
import Typography from '@tecton-mui/ui/Typography';

export default function BasicTrapFocus() {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start', width: 360 }}>
      <Button variant="outlined" onClick={() => setOpen(true)} aria-expanded={open}>
        Edit well name
      </Button>
      {open && (
        <TrapFocus open>
          <Paper
            variant="outlined"
            role="group"
            aria-labelledby="trap-focus-title"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false);
            }}
            sx={{ p: 2, width: '100%' }}
          >
            <Stack spacing={2}>
              <Typography id="trap-focus-title" variant="subtitle1" component="h3">
                Rename well
              </Typography>
              <TextField label="Well name" defaultValue="WELL-17" />
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => setOpen(false)}>
                  Save
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </TrapFocus>
      )}
      <Typography variant="caption" color="text.secondary">
        While the editor is open, Tab and Shift+Tab stay inside it. Escape, Cancel or Save close it
        and focus returns to the button that opened it.
      </Typography>
    </Stack>
  );
}
