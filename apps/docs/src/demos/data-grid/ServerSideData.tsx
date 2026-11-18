import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import ToggleButton from '@tecton-mui/ui/ToggleButton';
import ToggleButtonGroup from '@tecton-mui/ui/ToggleButtonGroup';
import DataGrid, {
  type GridColDef,
  type GridDataSource,
  type GridGetRowsParams,
} from '@tecton-mui/ui/DataGrid';

type Sample = { id: number; sample: string; basin: string; porosity: number };

// A fake server: 1,000 rows held in memory, answered after a short delay.
const basins = ['Permian', 'Campos', 'Viking Graben', 'Santos'];
const database: Sample[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  sample: `S-${String(i + 1).padStart(4, '0')}`,
  basin: basins[(i * 3) % basins.length],
  porosity: Math.round((0.05 + ((i * 13) % 25) / 100) * 1000) / 1000,
}));

function query(params: GridGetRowsParams) {
  let result = database;
  for (const item of params.filterModel.items) {
    if (item.value == null || item.value === '') continue;
    const needle = String(item.value).toLowerCase();
    result = result.filter((row) =>
      String(row[item.field as keyof Sample])
        .toLowerCase()
        .includes(needle),
    );
  }
  for (const { field, sort } of [...params.sortModel].reverse()) {
    const dir = sort === 'desc' ? -1 : 1;
    const key = field as keyof Sample;
    result = [...result].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  }
  return { rows: result.slice(params.start, params.end + 1), rowCount: result.length };
}

const dataSource: GridDataSource<Sample> = {
  getRows: (params) =>
    new Promise((resolve) => window.setTimeout(() => resolve(query(params)), 400)),
};

const columns: GridColDef<Sample>[] = [
  { field: 'sample', headerName: 'Sample', width: 130 },
  { field: 'basin', headerName: 'Basin', width: 160 },
  { field: 'porosity', headerName: 'Porosity', type: 'number', width: 130 },
];

export default function ServerSideData() {
  const [mode, setMode] = React.useState<'pages' | 'lazy'>('pages');
  return (
    <Box sx={{ width: '100%' }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, value: 'pages' | 'lazy' | null) => value && setMode(value)}
        aria-label="Loading mode"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="pages">Server pagination</ToggleButton>
        <ToggleButton value="lazy">Lazy loading</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ height: 420 }}>
        <DataGrid
          key={mode}
          columns={columns}
          dataSource={dataSource}
          lazyLoading={mode === 'lazy'}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
          pageSizeOptions={[25, 50]}
        />
      </Box>
    </Box>
  );
}
