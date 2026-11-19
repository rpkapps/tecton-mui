import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const steps = ['Spud', 'Surface casing', 'Intermediate casing', 'Production casing', 'Completion'];
const rows = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(4, '0')}`,
  step: steps[i % steps.length],
  rig: `Rig ${1 + (i % 7)}`,
  days: 2 + ((i * 7) % 19),
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 120 },
  { field: 'step', headerName: 'Next step', width: 200 },
  { field: 'rig', headerName: 'Rig', width: 110 },
  { field: 'days', headerName: 'Days', type: 'number', width: 100 },
];

export default function RowReorderingVirtualized() {
  const [message, setMessage] = React.useState('');
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowReordering
          pagination={false}
          onRowOrderChange={({ row, oldIndex, targetIndex }) =>
            setMessage(`${row.well} moved from row ${oldIndex + 1} to row ${targetIndex + 1}`)
          }
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} aria-live="polite">
        {message ||
          '2,000 virtualized rows. Drag a handle towards the top or bottom edge to scroll while dragging.'}
      </Typography>
    </Box>
  );
}
