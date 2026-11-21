import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import DataGrid, { type GridColDef, type GridDensity } from '@tecton-mui/ui/DataGrid';

const fields = ['Heimdal', 'Brage', 'Gullfaks', 'Troll'];
const rows = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  field: fields[i % fields.length],
  depth: 2400 + i * 137,
  oil: 400 + ((i * 53) % 900),
  producing: i % 6 !== 0,
}));

const columns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 110 },
  { field: 'field', headerName: 'Field', width: 140 },
  { field: 'depth', headerName: 'Depth (m)', type: 'number', width: 130 },
  { field: 'oil', headerName: 'Oil (bbl/d)', type: 'number', width: 130 },
  { field: 'producing', headerName: 'Producing', type: 'boolean', width: 120 },
];

const initialState = {
  pinnedColumns: { left: ['well'] },
  aggregation: { model: { oil: 'sum' } },
  pagination: { paginationModel: { page: 0, pageSize: 25 } },
};

export default function Density() {
  const [density, setDensity] = React.useState<GridDensity>('compact');
  return (
    <Box sx={{ width: '100%' }}>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={density}
        onChange={(_, value: GridDensity | null) => value && setDensity(value)}
        aria-label="Density"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="compact">Compact</ToggleButton>
        <ToggleButton value="standard">Standard</ToggleButton>
        <ToggleButton value="comfortable">Comfortable</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ height: 420 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density={density}
          checkboxSelection
          headerFilters
          initialState={initialState}
          pageSizeOptions={[25, 50]}
        />
      </Box>
    </Box>
  );
}
