import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Paper from '@tecton-mui/ui/Paper';

const rows = [
  { well: 'A-12', field: 'Heimdal', depth: 3120, status: 'Producing' },
  { well: 'B-07', field: 'Heimdal', depth: 2875, status: 'Shut in' },
  { well: 'C-21', field: 'Brage', depth: 3412, status: 'Producing' },
  { well: 'D-03', field: 'Brage', depth: 2990, status: 'Planned' },
];

export default function BasicTable() {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ width: '100%' }}>
      <Table size="small" aria-label="Wells">
        <TableHead>
          <TableRow>
            <TableCell>Well</TableCell>
            <TableCell>Field</TableCell>
            <TableCell align="right">Depth (m)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.well} hover>
              <TableCell component="th" scope="row">
                {row.well}
              </TableCell>
              <TableCell>{row.field}</TableCell>
              <TableCell align="right">{row.depth.toLocaleString('en-US')}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
