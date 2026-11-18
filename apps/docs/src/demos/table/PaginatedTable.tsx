import * as React from 'react';
import Paper from '@tecton-mui/ui/Paper';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TablePagination from '@tecton-mui/ui/TablePagination';
import TableRow from '@tecton-mui/ui/TableRow';

const rows = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  sample: `S-${String(i + 1).padStart(3, '0')}`,
  porosity: (0.08 + ((i * 7) % 15) / 100).toFixed(2),
}));

export default function PaginatedTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const visible = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <Paper variant="outlined" sx={{ width: '100%' }}>
      <TableContainer>
        <Table size="small" aria-label="Core samples">
          <TableHead>
            <TableRow>
              <TableCell>Sample</TableCell>
              <TableCell align="right">Porosity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.sample}</TableCell>
                <TableCell align="right">{row.porosity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10]}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
}
