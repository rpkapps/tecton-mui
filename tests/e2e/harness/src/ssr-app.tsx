import * as React from 'react';
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { Button, CssBaseline, Paper, TextField, Typography } from '@tecton-mui/ui';
import Icon from '@tecton-mui/ui/Icon';
import NumberField from '@tecton-mui/ui/NumberField';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import DataGrid from '@tecton-mui/ui/DataGrid';

const items = [{ id: 'a', label: 'Assets', children: [{ id: 'a1', label: 'Alpha-7' }] }];
const rows = [{ id: 1, name: 'Alpha-7' }];
const columns = [{ field: 'name', headerName: 'Name', width: 200 }];

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
        <div style={{ height: 200 }}>
          <DataGrid rows={rows} columns={columns} />
        </div>
      </Paper>
    </ThemeProvider>
  );
}
