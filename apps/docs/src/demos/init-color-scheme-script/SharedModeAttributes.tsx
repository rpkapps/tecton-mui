import * as React from 'react';
import Button from '@tecton-mui/ui/Button';
import Paper from '@tecton-mui/ui/Paper';
import Stack from '@tecton-mui/ui/Stack';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableRow from '@tecton-mui/ui/TableRow';
import { useTectonMode } from '@tecton-mui/ui/styles';

const LABELS = [
  '<html data-theme> (Tecton)',
  'localStorage tecton-theme-mode',
  '<html data-mui-color-scheme> (MUI)',
  'localStorage mui-mode',
];

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? '(not set)';
  } catch {
    return '(unavailable)';
  }
}

// An external store over the document: a MutationObserver reports attribute changes on <html>.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true });
  window.addEventListener('storage', onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener('storage', onChange);
  };
}

// The snapshot is a primitive string, so React re-renders only when a value changes.
function getSnapshot(): string {
  const html = document.documentElement;
  return [
    html.getAttribute('data-theme') ?? '(not set)',
    read('tecton-theme-mode'),
    html.getAttribute('data-mui-color-scheme') ?? '(not set)',
    read('mui-mode'),
  ].join('\n');
}

// Nothing is known on the server; the client fills the table after hydration.
const getServerSnapshot = () => LABELS.map(() => '…').join('\n');

export default function SharedModeAttributes() {
  const { mode, toggleMode } = useTectonMode();
  const values = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).split('\n');
  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 520, alignItems: 'flex-start' }}>
      <Paper variant="outlined" sx={{ width: '100%' }}>
        <Table size="small" aria-label="Color mode state of this page">
          <TableBody>
            {LABELS.map((label, index) => (
              <TableRow key={label}>
                <TableCell component="th" scope="row">
                  {label}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{values[index]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Button variant="outlined" onClick={toggleMode}>
        Switch to {mode === 'dark' ? 'light' : 'dark'} mode
      </Button>
    </Stack>
  );
}
