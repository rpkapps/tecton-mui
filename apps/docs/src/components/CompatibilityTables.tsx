import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Paper from '@tecton-mui/ui/Paper';
import inventory from '../../../../tooling/compatibility/export-inventory.json';

const cell = { typography: 'data', fontSize: 13 } as const;

/** Upstream modules intentionally not exported, from the version-audited export inventory. */
export function ExcludedModules() {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
      <Table size="small" aria-label="Modules not exported">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Upstream module</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.excluded.map((e) => (
            <TableRow key={`${e.package}/${e.module}`}>
              <TableCell sx={cell}>
                {e.package}/{e.module}
              </TableCell>
              <TableCell>{e.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Names exported by more than one upstream module; the root barrel keeps one of them. */
export function RootCollisions() {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
      <Table size="small" aria-label="Root export collisions">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Root export comes from</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Also available from</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.rootCollisions
            .filter((c) => !c.kept.startsWith('internal/'))
            .map((c) => (
              <TableRow key={c.name}>
                <TableCell sx={cell}>{c.name}</TableCell>
                <TableCell sx={cell}>@tecton-mui/ui/{c.kept}</TableCell>
                <TableCell sx={cell}>@tecton-mui/ui/{c.dropped}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export const pinnedVersions = inventory.versions as Record<string, string>;

export function PinnedVersions() {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
      <Table size="small" aria-label="Upstream versions">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Upstream package</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Pinned version</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(pinnedVersions).map(([name, version]) => (
            <TableRow key={name}>
              <TableCell sx={cell}>{name}</TableCell>
              <TableCell sx={cell}>{version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
