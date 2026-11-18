import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Dialog from '@tecton-mui/ui/Dialog';
import DialogActions from '@tecton-mui/ui/DialogActions';
import DialogContent from '@tecton-mui/ui/DialogContent';
import DialogTitle from '@tecton-mui/ui/DialogTitle';
import Stack from '@tecton-mui/ui/Stack';
import TextField from '@tecton-mui/ui/TextField';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        New folder
      </Button>
      <Dialog
        open={open}
        onClose={close}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent) => {
              event.preventDefault();
              close();
            },
          },
        }}
      >
        <DialogTitle>New folder</DialogTitle>
        <DialogContent>
          <Stack sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
