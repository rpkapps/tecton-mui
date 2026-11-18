import * as React from 'react';
import Paper from '@tecton-mui/ui/Paper';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Collapse from '@tecton-mui/ui/Collapse';
import Divider from '@tecton-mui/ui/Divider';
import Icon from '@tecton-mui/ui/Icon';
import { CodeBlock, CopyButton } from './CodeBlock';

export interface LoadedDemo {
  Component: React.ComponentType;
  code: string;
}

/** Demos of the current page, loaded with the page (see `lib/content.ts`). */
export const DemosContext = React.createContext<Record<string, LoadedDemo>>({});

/**
 * Renders a live demo (the real @tecton-mui/ui components) with its copyable TSX source.
 * `name` is the demo file name in `src/demos/<page>/`.
 */
export function Demo({ name, showCode = false }: { name: string; showCode?: boolean }) {
  const demos = React.useContext(DemosContext);
  const demo = demos[name];
  const [open, setOpen] = React.useState(showCode);
  const codeId = React.useId();
  if (!demo) {
    throw new Error(`Demo "${name}" not found for this page`);
  }
  const { Component, code } = demo;
  return (
    <Paper variant="outlined" sx={{ my: 3, overflow: 'hidden' }}>
      <Box
        data-demo-preview=""
        sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
      >
        <Component />
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          px: 1,
          py: 0.5,
        }}
      >
        <Button
          size="small"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={codeId}
          startIcon={<Icon name="code" size="small" />}
        >
          {open ? 'Hide code' : 'Show code'}
        </Button>
        <CopyButton text={code} label="Copy demo source" />
      </Box>
      <Collapse in={open} id={codeId} data-pagefind-ignore="all">
        <Divider />
        <CodeBlock code={code} language="tsx" bare />
      </Collapse>
    </Paper>
  );
}
