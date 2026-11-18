import * as React from 'react';
import Alert from '@tecton-mui/ui/Alert';
import Button from '@tecton-mui/ui/Button';
import Snackbar from '@tecton-mui/ui/Snackbar';

export default function AlertSnackbar() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Save settings
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setOpen(false)}>
          Settings saved
        </Alert>
      </Snackbar>
    </div>
  );
}
