import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

type Row = { id: number; month: string; plan: number; actual: number; comment: string };

const initialRows: Row[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
  id: i + 1,
  month,
  plan: 1000 + i * 50,
  actual: 980 + ((i * 37) % 120),
  comment: '',
}));

const columns: GridColDef<Row>[] = [
  { field: 'month', headerName: 'Month', width: 100 },
  { field: 'plan', headerName: 'Plan', type: 'number', width: 120, editable: true },
  { field: 'actual', headerName: 'Actual', type: 'number', width: 120, editable: true },
  { field: 'comment', headerName: 'Comment', width: 220, editable: true },
];

export default function CellSelectionClipboard() {
  const [pasted, setPasted] = React.useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 360 }}>
        <DataGrid
          rows={initialRows}
          columns={columns}
          cellSelection
          processRowUpdate={(newRow: Row) => newRow}
          onClipboardPasteEnd={({ updates }) => setPasted(updates.length)}
          hideFooter
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} aria-live="polite">
        Drag across cells (or Shift+click) to select a range, then press Ctrl/Cmd+C. Paste copied
        values from a spreadsheet with Ctrl/Cmd+V.
        {pasted ? ` Last paste updated ${pasted} rows.` : ''}
      </Typography>
    </Box>
  );
}
