import Box from '@tecton-mui/ui/Box';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const fields = ['Heimdal', 'Brage', 'Gullfaks', 'Troll'];
const rows = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  field: fields[i % fields.length],
  depth: 2400 + ((i * 137) % 1800),
  spud: new Date(2018 + (i % 8), i % 12, 1 + (i % 27)),
  producing: i % 4 !== 0,
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 120 },
  { field: 'field', headerName: 'Field', width: 140 },
  { field: 'depth', headerName: 'Depth (m)', type: 'number', width: 130 },
  { field: 'spud', headerName: 'Spud date', type: 'date', width: 140 },
  { field: 'producing', headerName: 'Producing', type: 'boolean', width: 120 },
];

export default function BasicGrid() {
  return (
    <Box sx={{ height: 420, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
        pageSizeOptions={[10, 25, 50]}
      />
    </Box>
  );
}
