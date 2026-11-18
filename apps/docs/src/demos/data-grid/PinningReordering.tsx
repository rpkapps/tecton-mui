import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const rows = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  operator: ['Northwind', 'Fjord Energy', 'Delta Ops'][i % 3],
  oil: 400 + ((i * 53) % 900),
  gas: 1200 + ((i * 97) % 2500),
  water: 100 + ((i * 31) % 600),
  pressure: 180 + ((i * 11) % 120),
  temperature: 60 + ((i * 7) % 50),
  status: i % 5 === 0 ? 'Shut in' : 'Producing',
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 110 },
  { field: 'operator', headerName: 'Operator', width: 150 },
  { field: 'oil', headerName: 'Oil (bbl/d)', type: 'number', width: 130 },
  { field: 'gas', headerName: 'Gas (Mcf/d)', type: 'number', width: 130 },
  { field: 'water', headerName: 'Water (bbl/d)', type: 'number', width: 140 },
  { field: 'pressure', headerName: 'Pressure (bar)', type: 'number', width: 140 },
  { field: 'temperature', headerName: 'Temp. (°C)', type: 'number', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
];

export default function PinningReordering() {
  const [lastMove, setLastMove] = React.useState<string | null>(null);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pinnedColumns: { left: ['well'], right: ['status'] } }}
          onColumnOrderChange={({ field, oldIndex, targetIndex }) =>
            setLastMove(`${field}: position ${oldIndex + 1} → ${targetIndex + 1}`)
          }
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} aria-live="polite">
        {lastMove ? `Moved ${lastMove}` : 'Drag a header to reorder; use the column menu to pin.'}
      </Typography>
    </Box>
  );
}
