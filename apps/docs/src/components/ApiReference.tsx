import Typography from '@tecton-mui/ui/Typography';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Paper from '@tecton-mui/ui/Paper';
import Chip from '@tecton-mui/ui/Chip';
import Box from '@tecton-mui/ui/Box';
import type { ApiDoc, ApiProp } from '../lib/content';
import { getApiEntry } from '../data/catalog';
import { toAnchor, toSlug } from '../lib/slug';
import { CodeBlock } from './CodeBlock';
import { RouterLink } from './links';

const mono = { typography: 'data', fontSize: 13 } as const;

function PropsTable({ props, caption }: { props: ApiProp[]; caption: string }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
      <Table size="small" aria-label={caption}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Default</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 220 }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((p) => (
            <TableRow key={p.name} sx={{ verticalAlign: 'top' }}>
              <TableCell sx={{ ...mono, whiteSpace: 'nowrap' }}>
                {p.name}
                {p.required && (
                  <Box
                    component="span"
                    aria-label="required"
                    title="required"
                    sx={{ color: 'error.main' }}
                  >
                    *
                  </Box>
                )}
                {p.deprecated && (
                  <Chip size="small" label="Deprecated" color="warning" sx={{ ml: 1 }} />
                )}
              </TableCell>
              <TableCell sx={{ ...mono, wordBreak: 'break-word', maxWidth: 280 }}>
                {p.type}
              </TableCell>
              <TableCell sx={{ ...mono, wordBreak: 'break-word' }}>
                {p.defaultValue ?? '—'}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {p.description || '—'}
                </Typography>
                {typeof p.deprecated === 'string' && (
                  <Typography variant="caption" color="text.secondary">
                    {p.deprecated}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Import lines for the supported styles, derived from the generated export metadata. */
export function importLines(
  docs: Pick<ApiDoc, 'exportName' | 'hasDefault' | 'rootExport' | 'subpath'>[],
) {
  const root = docs.filter((d) => d.rootExport).map((d) => d.exportName);
  const lines: string[] = [];
  if (root.length) {
    lines.push('// Root named import', `import { ${root.join(', ')} } from '@tecton-mui/ui';`, '');
  }
  lines.push('// Per-component import (smallest bundles)');
  for (const d of docs) {
    lines.push(
      d.hasDefault
        ? `import ${d.exportName} from '${d.subpath}';`
        : `import { ${d.exportName} } from '${d.subpath}';`,
    );
  }
  return lines.join('\n');
}

export function ImportSnippet({ docs }: { docs: ApiDoc[] }) {
  if (!docs.length) return null;
  // Low search weight: import lines repeat component names on many pages.
  return (
    <div data-pagefind-weight="0.3">
      <CodeBlock code={importLines(docs)} language="tsx" />
    </div>
  );
}

/** Generated API tables for one component (props, events, slots). */
export function ApiReference({ doc, level = 3 }: { doc: ApiDoc; level?: 2 | 3 }) {
  const props = doc.props.filter((p) => p.kind === 'prop');
  const events = doc.props.filter((p) => p.kind === 'event');
  const slots = doc.props.filter((p) => p.kind === 'slot');
  const headingVariant = level === 2 ? 'h5' : 'h6';
  const subVariant = level === 2 ? 'h6' : 'subtitle1';
  const inherits = doc.inherits ? getApiEntry(doc.inherits) : undefined;
  return (
    <Box component="section" sx={{ mt: 4 }} data-pagefind-weight="0.5">
      <Typography
        variant={headingVariant}
        component={`h${level}`}
        id={toAnchor(`${doc.name} api`)}
        sx={{ scrollMarginTop: 80 }}
      >
        {doc.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Exported from <code>{doc.subpath}</code>
        {doc.rootExport ? ' and the package root' : ''}; source: {doc.package}.{' '}
        {level === 3 && (
          <RouterLink to={`/api/${toSlug(doc.name)}` as '/'}>Full API page</RouterLink>
        )}
      </Typography>
      {doc.summary && (
        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
          {doc.summary}
        </Typography>
      )}
      {props.length > 0 ? (
        <>
          <Typography variant={subVariant} component={level === 2 ? 'h3' : 'h4'} sx={{ mt: 2 }}>
            Props
          </Typography>
          <PropsTable props={props} caption={`${doc.name} props`} />
        </>
      ) : (
        <Typography variant="body2">This component declares no props of its own.</Typography>
      )}
      {events.length > 0 && (
        <>
          <Typography variant={subVariant} component={level === 2 ? 'h3' : 'h4'} sx={{ mt: 2 }}>
            Events
          </Typography>
          <PropsTable props={events} caption={`${doc.name} events`} />
        </>
      )}
      {slots.length > 0 && (
        <>
          <Typography variant={subVariant} component={level === 2 ? 'h3' : 'h4'} sx={{ mt: 2 }}>
            Slots
          </Typography>
          <PropsTable props={slots} caption={`${doc.name} slots`} />
        </>
      )}
      <Typography variant="body2" color="text.secondary">
        {doc.inheritedCount > 0 &&
          `Also accepts ${doc.inheritedCount} standard React/DOM props (${doc.inheritedFrom.join(', ') || 'HTML attributes'}), such as aria-*, data-*, className, style and DOM event handlers, forwarded to the root element. `}
        {inherits && (
          <>
            Props of{' '}
            <RouterLink to={`/api/${toSlug(inherits.name)}` as '/'}>{inherits.name}</RouterLink> are
            also available.
          </>
        )}
      </Typography>
    </Box>
  );
}
