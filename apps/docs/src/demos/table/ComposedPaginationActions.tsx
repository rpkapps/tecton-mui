import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Paper from '@tecton-mui/ui/Paper';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableFooter from '@tecton-mui/ui/TableFooter';
import TableHead from '@tecton-mui/ui/TableHead';
import TablePagination from '@tecton-mui/ui/TablePagination';
import TablePaginationActions, {
  type TablePaginationActionsProps,
} from '@tecton-mui/ui/TablePaginationActions';
import TableRow from '@tecton-mui/ui/TableRow';
import Typography from '@tecton-mui/ui/Typography';

const rows = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  well: `WELL-${String(i + 1).padStart(2, '0')}`,
  depth: 1800 + ((i * 137) % 900),
}));

// A module-level actions component: it keeps the built-in buttons, tooltips and focus handling of
// TablePaginationActions and adds a page indicator next to them.
function ActionsWithPageCount(props: TablePaginationActionsProps) {
  const { count, page, rowsPerPage } = props;
  const pages = rowsPerPage > 0 ? Math.max(1, Math.ceil(count / rowsPerPage)) : 1;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 2 }}>
      <Typography variant="body2" sx={{ mr: 1 }}>
        Page {page + 1} of {pages}
      </Typography>
      <TablePaginationActions {...props} />
    </Box>
  );
}

export default function ComposedPaginationActions() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const visible =
    rowsPerPage > 0 ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows;
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Wells with composed pagination actions">
        <TableHead>
          <TableRow>
            <TableCell>Well</TableCell>
            <TableCell align="right">Total depth (m)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.well}
              </TableCell>
              <TableCell align="right">{row.depth}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={rows.length}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, { value: -1, label: 'All' }]}
              onPageChange={(_, next) => setPage(next)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              showFirstButton
              showLastButton
              ActionsComponent={ActionsWithPageCount}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
