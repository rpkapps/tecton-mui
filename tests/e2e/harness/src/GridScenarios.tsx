import * as React from 'react';
import { Box, Typography, Paper } from '@tecton-mui/ui';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const departments = ['Engineering', 'Research', 'Operations', 'Finance'];
const sites = ['Houston', 'Aberdeen', 'Stavanger'];
export const employees = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  department: departments[i % departments.length],
  site: sites[(i * 7) % sites.length],
  salary: 60000 + ((i * 7919) % 90000),
  hired: new Date(2015 + (i % 10), i % 12, 1 + (i % 27)),
  active: i % 5 !== 0,
}));

export const employeeColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'name', headerName: 'Name', width: 180, editable: true },
  { field: 'department', headerName: 'Department', width: 160 },
  { field: 'site', headerName: 'Site', width: 140 },
  {
    field: 'salary',
    headerName: 'Salary',
    type: 'number',
    width: 140,
    editable: true,
    valueFormatter: (v: number | null) =>
      v == null ? '' : `$${Math.round(v).toLocaleString('en-US')}`,
  },
  { field: 'hired', headerName: 'Hired', type: 'date', width: 140 },
  { field: 'active', headerName: 'Active', type: 'boolean', width: 110 },
];

const files = [
  { id: 1, path: ['src'], size: 0 },
  { id: 2, path: ['src', 'components'], size: 0 },
  { id: 3, path: ['src', 'components', 'Button.tsx'], size: 4200 },
  { id: 4, path: ['src', 'components', 'Grid.tsx'], size: 18300 },
  { id: 5, path: ['src', 'index.ts'], size: 900 },
  { id: 6, path: ['docs', 'README.md'], size: 2400 },
  { id: 7, path: ['package.json'], size: 1200 },
];
const treeColumns: GridColDef[] = [
  { field: 'size', headerName: 'Size (bytes)', type: 'number', width: 160 },
];
const getTreeDataPath = (row: (typeof files)[number]) => row.path;

const groupingModel = ['department', 'site'];
const aggregationModel = { salary: 'sum', id: 'size' };
const treeAggregation = { size: 'sum' };
const pinned = { left: ['name'], right: ['active'] };
const initialSort = {
  detailPanel: { expandedRowIds: [1] },
  pagination: { paginationModel: { page: 0, pageSize: 25 } },
  sorting: {
    sortModel: [
      { field: 'department', sort: 'asc' as const },
      { field: 'salary', sort: 'desc' as const },
    ],
  },
};
const pageSizes = [25, 50, 250];
const detailContent = ({ row }: { row: (typeof employees)[number] }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="subtitle2">{row.name}</Typography>
    <Typography variant="body2">{`${row.department} · ${row.site}`}</Typography>
  </Box>
);
const detailHeight = () => 90;

export function GridScenarios({ which }: { which: string }) {
  const show = (name: string) => which === 'all' || which === name;
  return (
    <Box sx={{ p: 3, display: 'grid', gap: 3 }}>
      {show('grouping') && (
        <Paper variant="outlined" sx={{ p: 2 }} data-testid="grid-grouping">
          <Typography variant="h5" gutterBottom>
            Row grouping + aggregation + pinned columns
          </Typography>
          <Box sx={{ height: 460 }}>
            <DataGrid
              rows={employees}
              columns={employeeColumns}
              rowGroupingModel={groupingModel}
              aggregationModel={aggregationModel}
              pinnedColumns={pinned}
              defaultGroupingExpansionDepth={1}
            />
          </Box>
        </Paper>
      )}
      {show('sorting') && (
        <Paper variant="outlined" sx={{ p: 2 }} data-testid="grid-sorting">
          <Typography variant="h5" gutterBottom>
            Multi-sort + header filters + detail panel
          </Typography>
          <Box sx={{ height: 460 }}>
            <DataGrid
              rows={employees}
              columns={employeeColumns}
              headerFilters
              initialState={initialSort}
              getDetailPanelContent={detailContent}
              getDetailPanelHeight={detailHeight}
              pageSizeOptions={pageSizes}
            />
          </Box>
        </Paper>
      )}
      {show('tree') && (
        <Paper variant="outlined" sx={{ p: 2 }} data-testid="grid-tree">
          <Typography variant="h5" gutterBottom>
            Tree data
          </Typography>
          <Box sx={{ height: 360 }}>
            <DataGrid
              rows={files}
              columns={treeColumns}
              treeData
              getTreeDataPath={getTreeDataPath}
              defaultGroupingExpansionDepth={-1}
              aggregationModel={treeAggregation}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}
