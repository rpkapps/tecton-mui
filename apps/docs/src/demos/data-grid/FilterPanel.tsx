import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, {
  GridLogicOperator,
  type GridColDef,
  type GridFilterModel,
} from '@tecton-mui/ui/DataGrid';

const fields = ['Heimdal', 'Brage', 'Gullfaks', 'Troll'];
const rows = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  field: fields[i % fields.length],
  depth: 2400 + ((i * 137) % 1800),
  spud: new Date(2018 + (i % 8), i % 12, 1 + (i % 27)),
  producing: i % 4 !== 0,
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 120 },
  {
    field: 'field',
    headerName: 'Field',
    width: 140,
    type: 'singleSelect',
    valueOptions: fields,
  },
  { field: 'depth', headerName: 'Depth (m)', type: 'number', width: 130 },
  { field: 'spud', headerName: 'Spud date', type: 'date', width: 140 },
  { field: 'producing', headerName: 'Producing', type: 'boolean', width: 120 },
];

export default function FilterPanel() {
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [
      { id: 1, field: 'field', operator: 'isAnyOf', value: ['Troll', 'Brage'] },
      { id: 2, field: 'depth', operator: '>', value: 3000 },
    ],
    logicOperator: GridLogicOperator.And,
  });
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 460 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          showToolbar
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
        />
      </Box>
      <Typography
        variant="body2"
        component="pre"
        color="text.secondary"
        sx={{ mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
      >
        {`${filterModel.items.length} condition(s), joined with ${filterModel.logicOperator ?? 'and'}: ${filterModel.items
          .map((item) => `${item.field} ${item.operator} ${JSON.stringify(item.value ?? '')}`)
          .join(' · ')}`}
      </Typography>
    </Box>
  );
}
