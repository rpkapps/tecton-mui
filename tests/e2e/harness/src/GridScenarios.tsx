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

const wells = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  well: `W-${String(i + 1).padStart(3, '0')}`,
  field: ['Heimdal', 'Brage', 'Gullfaks', 'Troll'][i % 4],
  operator: ['Equinor', 'Aker BP', 'Vår Energi'][i % 3],
  depth: 2400 + i * 137,
  spud: new Date(2018 + (i % 7), i % 12, 1 + (i % 27)),
  producing: i % 4 !== 0,
  oil: 1200 + ((i * 523) % 4000),
  gas: 300 + ((i * 197) % 2000),
  water: 50 + ((i * 89) % 900),
  pressure: 180 + ((i * 31) % 120),
  temperature: 60 + ((i * 7) % 60),
}));
const wellColumns: GridColDef[] = [
  { field: 'well', headerName: 'Well', width: 120 },
  { field: 'field', headerName: 'Field', width: 140 },
  { field: 'operator', headerName: 'Operator', width: 150 },
  { field: 'depth', headerName: 'Depth (m)', type: 'number', width: 130 },
  { field: 'spud', headerName: 'Spud date', type: 'date', width: 140 },
  { field: 'oil', headerName: 'Oil (bbl/d)', type: 'number', width: 140 },
  { field: 'gas', headerName: 'Gas (Mscf/d)', type: 'number', width: 150 },
  { field: 'water', headerName: 'Water (bbl/d)', type: 'number', width: 150 },
  { field: 'pressure', headerName: 'Pressure (bar)', type: 'number', width: 150 },
  { field: 'temperature', headerName: 'Temp (°C)', type: 'number', width: 130 },
  { field: 'producing', headerName: 'Producing', type: 'boolean', width: 120 },
];
const wellPinned = { left: ['well'], right: ['producing'] };
const wellPinnedRows = { top: [wells[0]], bottom: [] };
const wellAggregation = { oil: 'sum', gas: 'sum', water: 'sum' };
const wellInitial = { pagination: { paginationModel: { page: 0, pageSize: 25 } } };

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
      {show('pinning') && (
        <Paper variant="outlined" sx={{ p: 2 }} data-testid="grid-pinning">
          <Typography variant="h5" gutterBottom>
            Checkbox selection + pinned columns + pinned rows + header filters
          </Typography>
          <Box sx={{ height: 520 }}>
            <DataGrid
              rows={wells}
              columns={wellColumns}
              checkboxSelection
              pinnedColumns={wellPinned}
              pinnedRows={wellPinnedRows}
              aggregationModel={wellAggregation}
              headerFilters
              initialState={wellInitial}
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
