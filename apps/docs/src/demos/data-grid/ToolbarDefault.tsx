import Box from '@tecton-mui/ui/Box';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const fields = ['Heimdal', 'Brage', 'Gullfaks', 'Troll'];
const operators = ['Northwind', 'Fjord Energy', 'Delta Ops'];
const rows = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  field: fields[i % fields.length],
  operator: operators[(i * 5) % operators.length],
  depth: 2400 + ((i * 137) % 1800),
  producing: i % 4 !== 0,
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 120 },
  { field: 'field', headerName: 'Field', width: 140 },
  { field: 'operator', headerName: 'Operator', width: 160 },
  { field: 'depth', headerName: 'Depth (m)', type: 'number', width: 130 },
  { field: 'producing', headerName: 'Producing', type: 'boolean', width: 120 },
];

export default function ToolbarDefault() {
  return (
    <Box sx={{ height: 460, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        showToolbar
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
      />
    </Box>
  );
}
