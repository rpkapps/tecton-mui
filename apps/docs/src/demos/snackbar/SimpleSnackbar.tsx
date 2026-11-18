import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Snackbar from '@tecton-mui/ui/Snackbar';
import IconButton from '@tecton-mui/ui/IconButton';
import Icon from '@tecton-mui/ui/Icon';

export default function SimpleSnackbar() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Archive project
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setOpen(false);
        }}
        message="Project archived"
        action={
          <>
            <Button color="inherit" size="small" onClick={() => setOpen(false)}>
              Undo
            </Button>
            <IconButton
              color="inherit"
              size="small"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" size="small" />
            </IconButton>
          </>
        }
      />
    </div>
  );
}
