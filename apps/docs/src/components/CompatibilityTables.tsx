import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import { DocsTable } from './mdx';
import inventory from '../../../../tooling/compatibility/export-inventory.json';

// `& td` in DocsTable sets the prose font; module names keep the monospace font.
const cell = {
  '&&': { fontFamily: 'var(--tecton-font-family-mono), monospace', fontSize: 13 },
} as const;

/** Upstream modules intentionally not exported, from the version-audited export inventory. */
export function ExcludedModules() {
  return (
    <DocsTable label="Modules not exported">
      <TableHead>
        <TableRow>
          <TableCell>Upstream module</TableCell>
          <TableCell>Reason</TableCell>
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
    </DocsTable>
  );
}

/** Names exported by more than one upstream module; the root barrel keeps one of them. */
export function RootCollisions() {
  return (
    <DocsTable label="Root export collisions">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Root export comes from</TableCell>
          <TableCell>Also available from</TableCell>
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
    </DocsTable>
  );
}

export const pinnedVersions = inventory.versions as Record<string, string>;

export function PinnedVersions() {
  return (
    <DocsTable label="Upstream versions">
      <TableHead>
        <TableRow>
          <TableCell>Upstream package</TableCell>
          <TableCell>Pinned version</TableCell>
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
    </DocsTable>
  );
}
