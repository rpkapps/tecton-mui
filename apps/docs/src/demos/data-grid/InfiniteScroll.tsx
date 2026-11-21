import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import DataGrid, { type GridColDef } from '@tecton-mui/ui/DataGrid';

type Reading = { id: number; well: string; time: string; pressure: number };

// Fetches the next 25 readings after a short delay (a stand-in for a paged API).
const fetchReadings = (from: number) =>
  new Promise<Reading[]>((resolve) =>
    window.setTimeout(
      () =>
        resolve(
          Array.from({ length: 25 }, (_, i) => {
            const n = from + i;
            return {
              id: n + 1,
              well: `W-${String((n % 40) + 1).padStart(3, '0')}`,
              time: new Date(Date.UTC(2026, 0, 1, 0, n * 15)).toISOString().slice(0, 16),
              pressure: 140 + ((n * 37) % 60),
            };
          }),
        ),
      500,
    ),
  );

const columns: GridColDef<Reading>[] = [
  { field: 'well', headerName: 'Well', width: 110 },
  { field: 'time', headerName: 'Time (UTC)', width: 170 },
  { field: 'pressure', headerName: 'Pressure (bar)', type: 'number', width: 150 },
];

const MAX_ROWS = 200;

export default function InfiniteScroll() {
  const [rows, setRows] = React.useState<Reading[]>([]);
  const [loading, setLoading] = React.useState(false);
  const loadingRef = React.useRef(false);
  const rowsCount = React.useRef(0);
  const loadMore = React.useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const next = await fetchReadings(rowsCount.current);
    rowsCount.current += next.length;
    setRows((prev) => [...prev, ...next].slice(0, MAX_ROWS));
    loadingRef.current = false;
    setLoading(false);
  }, []);
  const done = rows.length >= MAX_ROWS;
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 360 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          onRowsScrollEnd={done ? undefined : loadMore}
          pagination={false}
          hideFooterRowCount
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {done ? `All ${MAX_ROWS} readings loaded.` : `${rows.length} readings loaded.`}
      </Typography>
    </Box>
  );
}
