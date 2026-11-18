import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Stack from '@tecton-mui/ui/Stack';
import Icon from '@tecton-mui/ui/Icon';
import DataGrid, { type GridColDef, useGridAdvancedApiRef } from '@tecton-mui/ui/DataGrid';

type Row = { id: number; parameter: string; value: number };

const rows: Row[] = [
  { id: 1, parameter: 'Choke size (mm)', value: 32 },
  { id: 2, parameter: 'Wellhead pressure (bar)', value: 145 },
  { id: 3, parameter: 'Gas lift rate (Mcf/d)', value: 900 },
  { id: 4, parameter: 'Water cut (%)', value: 18 },
];

const columns: GridColDef<Row>[] = [
  { field: 'parameter', headerName: 'Parameter', width: 240 },
  { field: 'value', headerName: 'Value', type: 'number', width: 140, editable: true },
];

export default function UndoRedo() {
  const apiRef = useGridAdvancedApiRef<Row>();
  const [history, setHistory] = React.useState({ canUndo: false, canRedo: false });
  // Read the history state after each change (edits, undo, redo) for the toolbar buttons.
  const sync = () =>
    setHistory({
      canUndo: apiRef.current?.canUndo() ?? false,
      canRedo: apiRef.current?.canRedo() ?? false,
    });
  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button
          size="small"
          startIcon={<Icon name="undo" size="small" />}
          disabled={!history.canUndo}
          onClick={() => void apiRef.current?.undo().then(sync)}
        >
          Undo
        </Button>
        <Button
          size="small"
          startIcon={<Icon name="redo" size="small" />}
          disabled={!history.canRedo}
          onClick={() => void apiRef.current?.redo().then(sync)}
        >
          Redo
        </Button>
      </Stack>
      <Box sx={{ height: 300 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          advancedApiRef={apiRef}
          historyStackSize={20}
          processRowUpdate={(newRow: Row) => {
            // The edit is recorded after this callback returns.
            window.setTimeout(sync);
            return newRow;
          }}
          hideFooter
        />
      </Box>
    </Box>
  );
}
