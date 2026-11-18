import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Dialog from '@tecton-mui/ui/Dialog';
import DialogActions from '@tecton-mui/ui/DialogActions';
import DialogContent from '@tecton-mui/ui/DialogContent';
import DialogContentText from '@tecton-mui/ui/DialogContentText';
import DialogTitle from '@tecton-mui/ui/DialogTitle';

export default function ConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
        Delete survey
      </Button>
      <Dialog
        open={open}
        onClose={close}
        aria-labelledby="delete-title"
        aria-describedby="delete-text"
      >
        <DialogTitle id="delete-title">Delete survey “North 2025”?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-text">
            The survey and its 14 interpretations will be removed for all users. This cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} autoFocus>
            Cancel
          </Button>
          <Button onClick={close} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
