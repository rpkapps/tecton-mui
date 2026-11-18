import Box from '@tecton-mui/ui/Box';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

const rows = [
  { id: 1, path: ['Assets'], wells: 0 },
  { id: 2, path: ['Assets', 'North Sea'], wells: 0 },
  { id: 3, path: ['Assets', 'North Sea', 'Heimdal'], wells: 14 },
  { id: 4, path: ['Assets', 'North Sea', 'Brage'], wells: 22 },
  { id: 5, path: ['Assets', 'Gulf of Mexico', 'Delta'], wells: 9 },
  { id: 6, path: ['Exploration', 'Barents Sea'], wells: 3 },
];

const columns: GridColDef[] = [{ field: 'wells', headerName: 'Wells', type: 'number', width: 120 }];

export default function TreeData() {
  return (
    <Box sx={{ height: 360, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        treeData
        getTreeDataPath={(row) => row.path}
        groupingColDef={{ headerName: 'Hierarchy', width: 260 }}
        defaultGroupingExpansionDepth={-1}
        aggregationModel={{ wells: 'sum' }}
      />
    </Box>
  );
}
