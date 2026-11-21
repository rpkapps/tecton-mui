import Box from '@tecton-mui/ui/Box';
import DataGrid, {
  type GridColDef,
  type GridDataSource,
  type GridGetRowsParams,
} from '@tecton-mui/ui/DataGrid';

type Sample = { id: number; sample: string; basin: string; porosity: number };

const basins = ['Permian', 'Campos', 'Viking Graben', 'Santos'];
const database: Sample[] = Array.from({ length: 600 }, (_, i) => ({
  id: i + 1,
  sample: `S-${String(i + 1).padStart(4, '0')}`,
  basin: basins[(i * 3) % basins.length],
  porosity: Math.round((0.05 + ((i * 13) % 25) / 100) * 1000) / 1000,
}));

// The server does not report a total: the response has no `rowCount`. The grid loads the next
// chunk when the last row comes into view and stops when a chunk comes back short.
const dataSource: GridDataSource<Sample> = {
  getRows: (params: GridGetRowsParams) =>
    new Promise((resolve) =>
      window.setTimeout(
        () => resolve({ rows: database.slice(params.start, Number(params.end) + 1) }),
        400,
      ),
    ),
};

const columns: GridColDef<Sample>[] = [
  { field: 'sample', headerName: 'Sample', width: 130 },
  { field: 'basin', headerName: 'Basin', width: 160 },
  { field: 'porosity', headerName: 'Porosity', type: 'number', width: 130 },
];

export default function InfiniteLoading() {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        columns={columns}
        dataSource={dataSource}
        lazyLoading
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 50 } } }}
      />
    </Box>
  );
}
