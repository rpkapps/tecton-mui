import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const tasks = [
  'Review survey',
  'Pick horizons',
  'Build velocity model',
  'Depth conversion',
  'Map faults',
  'Publish report',
].map((title, i) => ({ id: i + 1, title, owner: ['Ana', 'Ben', 'Chi'][i % 3] }));

const columns: GridColDef[] = [
  { field: 'title', headerName: 'Task', width: 220 },
  { field: 'owner', headerName: 'Owner', width: 120 },
];

export default function RowReordering() {
  const [message, setMessage] = React.useState('');
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 360 }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          rowReordering
          onRowOrderChange={({ row, oldIndex, targetIndex }) =>
            setMessage(`“${row.title}” moved from ${oldIndex + 1} to ${targetIndex + 1}`)
          }
          hideFooter
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} aria-live="polite">
        {message || 'Drag a row by its handle, or focus the handle and press Alt+Arrow keys.'}
      </Typography>
    </Box>
  );
}
