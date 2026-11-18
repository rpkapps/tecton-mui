import * as React from 'react';
import Alert from '@tecton-mui/ui/Alert';
import AlertTitle from '@tecton-mui/ui/AlertTitle';
import Button from '@tecton-mui/ui/Button';
import Collapse from '@tecton-mui/ui/Collapse';

export default function AlertWithAction() {
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <Collapse in={open}>
        <Alert
          severity="warning"
          variant="outlined"
          onClose={() => setOpen(false)}
          action={
            <Button color="inherit" size="small">
              Review
            </Button>
          }
        >
          <AlertTitle>Unsaved changes</AlertTitle>
          You edited 3 horizons since the last save.
        </Alert>
      </Collapse>
      {!open && (
        <Button size="small" onClick={() => setOpen(true)}>
          Show alert again
        </Button>
      )}
    </div>
  );
}
