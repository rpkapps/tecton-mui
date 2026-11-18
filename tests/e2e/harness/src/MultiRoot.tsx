import * as React from 'react';
import { ThemeProvider, useTectonMode, useTheme } from '@tecton-mui/ui/styles';
import { Button, CssBaseline, Menu, MenuItem, Paper, Typography } from '@tecton-mui/ui';

function Panel({ name }: { name: string }) {
  const { mode, toggleMode } = useTectonMode();
  const theme = useTheme();
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  return (
    <Paper
      variant="outlined"
      sx={{ m: 2, p: 2 }}
      data-testid={`panel-${name}`}
      data-theme-mode={theme.palette.mode}
    >
      <Typography variant="h6">{`${name} root — ${mode}`}</Typography>
      {name === 'shell' ? (
        <Button variant="contained" onClick={toggleMode}>
          Toggle mode
        </Button>
      ) : (
        <>
          <Button variant="outlined" onClick={(e) => setAnchor(e.currentTarget)}>
            Open menu
          </Button>
          <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => setAnchor(null)}>Portal item</MenuItem>
          </Menu>
        </>
      )}
    </Paper>
  );
}

export function MultiRootPanel({ name }: { name: 'shell' | 'mfe' }) {
  return (
    <ThemeProvider>
      {/* Only the shell owns the page-wide reset; the hosted MFE never applies CssBaseline. */}
      {name === 'shell' ? <CssBaseline /> : null}
      <Panel name={name} />
    </ThemeProvider>
  );
}
