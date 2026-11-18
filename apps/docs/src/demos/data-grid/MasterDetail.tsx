import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

type Order = {
  id: number;
  order: string;
  supplier: string;
  total: number;
  lines: { item: string; quantity: number }[];
};

const orders: Order[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  order: `PO-${4100 + i}`,
  supplier: ['Acme Valves', 'North Tubulars', 'Subsea Parts'][i % 3],
  total: 1500 + ((i * 733) % 9000),
  lines: [
    { item: 'Gate valve 4"', quantity: 2 + (i % 3) },
    { item: 'Gasket set', quantity: 10 + i },
  ],
}));

const columns: GridColDef<Order>[] = [
  { field: 'order', headerName: 'Order', width: 130 },
  { field: 'supplier', headerName: 'Supplier', width: 180 },
  { field: 'total', headerName: 'Total ($)', type: 'number', width: 130 },
];

export default function MasterDetail() {
  return (
    <Box sx={{ height: 420, width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        initialState={{ detailPanel: { expandedRowIds: [1] } }}
        getDetailPanelHeight={() => 'auto'}
        getDetailPanelContent={({ row }: { row: Order }) => (
          <Box sx={{ px: 6, py: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {row.order} · {row.supplier}
            </Typography>
            {row.lines.map((line) => (
              <Typography key={line.item} variant="body2">
                {line.quantity} × {line.item}
              </Typography>
            ))}
          </Box>
        )}
      />
    </Box>
  );
}
