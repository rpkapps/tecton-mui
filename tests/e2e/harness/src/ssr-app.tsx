import * as React from 'react';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { Button, CssBaseline, Paper, TextField, Typography } from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';
import NumberField from '@tecton-mui/ui/NumberField';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import DataGrid from '@tecton-mui/ui/DataGrid';

const items = [{ id: 'a', label: 'Assets', children: [{ id: 'a1', label: 'Alpha-7' }] }];
const rows = [
  { id: 1, name: 'Alpha-7', site: 'North' },
  { id: 2, name: 'Bravo-2', site: 'South' },
];
const columns = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'site', headerName: 'Site', width: 200 },
];
// Pinning and cell selection attach to the grid root, which mounts one render after hydration.
const pinnedColumns = { left: ['name'] };

export function SsrApp() {
  const [count, setCount] = React.useState(0);
  return (
    <ThemeProvider>
      <CssBaseline />
      <Paper sx={{ m: 2, p: 2 }} data-testid="ssr-root">
        <Typography variant="h4">Server rendered</Typography>
        <Button
          variant="contained"
          startIcon={<Icon name="add" />}
          onClick={() => setCount((c) => c + 1)}
        >
          {`Clicked ${count}`}
        </Button>
        <TextField label="Name" defaultValue="Alpha-7" sx={{ ml: 2 }} />
        <NumberField label="Depth" defaultValue={1200} locale="en-US" sx={{ ml: 2 }} />
        <RichTreeView items={items} defaultExpandedItems={['a']} />
        <div style={{ height: 240 }}>
          <DataGrid rows={rows} columns={columns} pinnedColumns={pinnedColumns} cellSelection />
        </div>
      </Paper>
    </ThemeProvider>
  );
}
