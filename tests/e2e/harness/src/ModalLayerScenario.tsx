import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { Button, Dialog, DialogContent, DialogTitle, Menu, MenuItem } from '@tecton-mui/ui';
import {
  SecondButton,
  SecondDialog,
  SecondThemeProvider,
  createSecondTheme,
} from './secondMuiCopy.js';

// Two copies of MUI on one page, each with its own modal manager: the shell renders
// @tecton-mui/ui, the micro-frontend mounted into a slot of the shell renders the second copy.
// Nothing here sets up the modal layer: the shell's ThemeProvider installs it.

const emit = (name: string) => window.dispatchEvent(new Event(name));
function useEvent(name: string, handler: () => void) {
  const latest = React.useRef(handler);
  React.useEffect(() => {
    latest.current = handler;
  });
  React.useEffect(() => {
    const listener = () => latest.current();
    window.addEventListener(name, listener);
    return () => window.removeEventListener(name, listener);
  }, [name]);
}

const secondTheme = createSecondTheme();

function MicroFrontend() {
  const [open, setOpen] = React.useState(false);
  useEvent('modal-layer:open-mfe', () => setOpen(true));
  return (
    <SecondThemeProvider theme={secondTheme}>
      <p>Micro-frontend (second MUI copy)</p>
      <SecondDialog open={open} onClose={() => setOpen(false)} data-testid="mfe-dialog">
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Micro-frontend dialog</strong>
          <SecondButton data-testid="mfe-action">Action</SecondButton>
          <SecondButton
            data-testid="close-shell-now"
            onClick={() => emit('modal-layer:close-shell')}
          >
            Close shell dialog
          </SecondButton>
          <SecondButton data-testid="close-mfe" onClick={() => setOpen(false)}>
            Close
          </SecondButton>
        </div>
      </SecondDialog>
    </SecondThemeProvider>
  );
}

function Shell() {
  const [open, setOpen] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const slot = React.useRef<HTMLDivElement>(null);
  useEvent('modal-layer:close-shell', () => setOpen(false));
  React.useEffect(() => {
    const root = createRoot(slot.current!, { identifierPrefix: 'mfe-' });
    root.render(<MicroFrontend />);
    return () => queueMicrotask(() => root.unmount());
  }, []);
  return (
    <ThemeProvider>
      <div style={{ padding: 16 }}>
        <Button data-testid="open-shell" variant="contained" onClick={() => setOpen(true)}>
          Open shell dialog
        </Button>
        <div ref={slot} data-testid="mfe-slot" />
        {/* A page taller than the viewport, so the scroll lock matters. */}
        <div style={{ height: 2000 }} />
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} data-testid="shell-dialog">
        <DialogTitle>Shell dialog</DialogTitle>
        <DialogContent sx={{ display: 'flex', gap: 1 }}>
          <Button data-testid="open-mfe" onClick={() => emit('modal-layer:open-mfe')}>
            Open micro-frontend dialog
          </Button>
          <Button data-testid="open-menu" onClick={(e) => setMenuAnchor(e.currentTarget)}>
            Open menu
          </Button>
          <Button data-testid="close-shell" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem data-testid="menu-item" onClick={() => setMenuAnchor(null)}>
          Menu item
        </MenuItem>
      </Menu>
    </ThemeProvider>
  );
}

export function mountModalLayerScenario(container: HTMLElement) {
  createRoot(container).render(<Shell />);
}
