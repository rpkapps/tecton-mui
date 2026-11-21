import Box from '@tecton-mui/ui/Box';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const departments = ['Engineering', 'Research', 'Operations', 'Finance'];
const sites = ['Houston', 'Aberdeen', 'Stavanger'];
const rows = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  department: departments[i % departments.length],
  site: sites[(i * 7) % sites.length],
  salary: 60000 + ((i * 7919) % 90000),
  active: i % 5 !== 0,
}));

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 160 },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'site', headerName: 'Site', width: 130 },
  {
    field: 'salary',
    headerName: 'Salary',
    type: 'number',
    width: 130,
    valueFormatter: (value: number | null) =>
      value == null ? '' : `$${Math.round(value).toLocaleString('en-US')}`,
  },
  { field: 'active', headerName: 'Active', type: 'boolean', width: 100 },
];

export default function GroupingAggregation() {
  return (
    <Box sx={{ height: 460, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        defaultGroupingExpansionDepth={1}
        // Initial models (not controlled props), so the column menu can change the grouping and
        // the aggregation functions. The Group column shows the grouping values; the columns they
        // come from are hidden.
        initialState={{
          rowGrouping: { model: ['department', 'site'] },
          aggregation: { model: { salary: 'sum', name: 'size' } },
          columns: { columnVisibilityModel: { department: false, site: false } },
        }}
      />
    </Box>
  );
}
