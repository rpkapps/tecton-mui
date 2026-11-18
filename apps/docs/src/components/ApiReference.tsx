import * as React from 'react';
import Typography from '@tecton-mui/ui/Typography';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Chip from '@tecton-mui/ui/Chip';
import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Collapse from '@tecton-mui/ui/Collapse';
import Icon from '@tecton-mui/ui/Icon';
import type { ApiDoc, ApiProp } from '../lib/content';
import { getApiEntry } from '../data/catalog';
import { toAnchor, toSlug } from '../lib/slug';
import { CodeBlock } from './CodeBlock';
import { RouterLink } from './links';
import { DocsTable, InlineCode, SectionHeading } from './mdx';

const mono = {
  fontFamily: 'var(--tecton-font-family-mono), monospace',
  fontSize: 13,
  lineHeight: 1.6,
} as const;

/** Prose from the type docs: soft line breaks joined, `code` spans rendered as inline code. */
function RichText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim());
  return (
    <>
      {paragraphs.map((p, i) => (
        <Typography
          key={i}
          variant="body2"
          component="p"
          sx={{ lineHeight: 1.6, mb: i < paragraphs.length - 1 ? 1 : 0 }}
        >
          {p
            .split(/`([^`]+)`/g)
            .map((part, j) => (j % 2 === 1 ? <InlineCode key={j}>{part}</InlineCode> : part))}
        </Typography>
      ))}
    </>
  );
}

/** Type expression with wrapping opportunities between union members. */
function TypeText({ type }: { type: string }) {
  const parts = type.length > 32 ? type.split(' | ') : [type];
  return (
    <Box component="span" sx={{ ...mono, color: 'var(--docs-code-type)' }}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <Box component="span" sx={{ color: 'var(--docs-code-punctuation)' }}>
              {' | '}
            </Box>
          )}
          <Box component="span" sx={{ whiteSpace: parts.length > 1 ? 'nowrap' : 'normal' }}>
            {p}
          </Box>
          <wbr />
        </React.Fragment>
      ))}
    </Box>
  );
}

function PropsTable({ props, caption }: { props: ApiProp[]; caption: string }) {
  return (
    <DocsTable label={caption}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Default</TableCell>
          <TableCell sx={{ minWidth: 260 }}>Description</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.map((p) => (
          <TableRow key={p.name} hover>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              <Box component="span" sx={{ ...mono, fontWeight: 600, color: 'var(--docs-accent)' }}>
                {p.name}
              </Box>
              {p.required && (
                <Box
                  component="abbr"
                  title="required"
                  sx={{ color: 'error.main', textDecoration: 'none', ml: 0.25 }}
                >
                  *
                </Box>
              )}
              {p.deprecated && (
                <Chip
                  size="small"
                  label="Deprecated"
                  color="warning"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </TableCell>
            <TableCell sx={{ minWidth: 220, maxWidth: 340, overflowWrap: 'break-word' }}>
              <TypeText type={p.type} />
            </TableCell>
            <TableCell sx={{ maxWidth: 200 }}>
              <Box
                component="span"
                sx={{
                  ...mono,
                  display: 'block',
                  whiteSpace: (p.defaultValue?.length ?? 0) <= 18 ? 'nowrap' : 'normal',
                  overflowWrap: 'anywhere',
                }}
              >
                {p.defaultValue ?? (
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    —
                  </Box>
                )}
              </Box>
            </TableCell>
            <TableCell>
              {p.description ? (
                <RichText text={p.description} />
              ) : (
                <Typography variant="body2" color="text.disabled">
                  —
                </Typography>
              )}
              {typeof p.deprecated === 'string' && (
                <Typography variant="caption" color="warning.main" component="p" sx={{ mt: 0.5 }}>
                  Deprecated: {p.deprecated}
                </Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DocsTable>
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
      <CodeBlock code={importLines(docs)} language="tsx" title="Import" />
    </div>
  );
}

/** Component the prop is declared by when it comes from another documented component. */
function inheritedOwner(prop: ApiProp, docName: string): string | null {
  const declared = prop.declaredBy?.replace(/(OwnProps|Props|TypeMap)$/, '');
  if (!declared || declared === docName) return null;
  return getApiEntry(declared) ? declared : null;
}

function InheritedProps({
  owner,
  props,
  docName,
}: {
  owner: string;
  props: ApiProp[];
  docName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  return (
    <Box sx={{ my: 2 }}>
      <Button
        size="small"
        color="inherit"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        startIcon={<Icon name={open ? 'chevron-down' : 'chevron-right'} size="small" />}
        sx={{
          color: 'text.secondary',
          '[dir=rtl] & .MuiButton-startIcon': { transform: open ? 'none' : 'scaleX(-1)' },
        }}
      >
        {props.length} props inherited from {owner}
      </Button>
      <Collapse in={open} id={id}>
        <PropsTable props={props} caption={`${docName} props inherited from ${owner}`} />
      </Collapse>
    </Box>
  );
}

/** Generated API tables for one component (props, events, slots). */
export function ApiReference({ doc, level = 3 }: { doc: ApiDoc; level?: 2 | 3 }) {
  const ownProps: ApiProp[] = [];
  const inherited = new Map<string, ApiProp[]>();
  for (const p of doc.props) {
    const owner = inheritedOwner(p, doc.name);
    if (owner) inherited.set(owner, [...(inherited.get(owner) ?? []), p]);
    else ownProps.push(p);
  }
  const props = ownProps.filter((p) => p.kind === 'prop');
  const events = ownProps.filter((p) => p.kind === 'event');
  const slots = ownProps.filter((p) => p.kind === 'slot');
  const sub = (level + 1) as 3 | 4;
  const inherits = doc.inherits ? getApiEntry(doc.inherits) : undefined;
  return (
    <Box component="section" sx={{ mt: 4 }} data-pagefind-weight="0.5">
      <SectionHeading
        level={level}
        id={toAnchor(`${doc.name} api`)}
        sx={{ mt: level === 2 ? 5 : 5, mb: 1 }}
      >
        <Box component="span" sx={{ fontFamily: 'var(--tecton-font-family-mono), monospace' }}>
          {doc.name}
        </Box>
      </SectionHeading>
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1.5 }}
        data-pagefind-ignore=""
      >
        <Chip size="small" variant="outlined" label={doc.package} />
        <Chip size="small" variant="outlined" label={doc.subpath} />
        {doc.rootExport && <Chip size="small" variant="outlined" label="root export" />}
        {level === 3 && (
          <RouterLink to={`/api/${toSlug(doc.name)}` as '/'} variant="body2" sx={{ ml: 0.5 }}>
            Full API page
          </RouterLink>
        )}
      </Box>
      {doc.summary && (
        <Box sx={{ mb: 1 }}>
          <RichText text={doc.summary} />
        </Box>
      )}
      {props.length > 0 ? (
        <>
          <SectionHeading level={sub} id={toAnchor(`${doc.name} props`)} sx={{ mt: 3, mb: 0 }}>
            Props
          </SectionHeading>
          <PropsTable props={props} caption={`${doc.name} props`} />
        </>
      ) : (
        <Typography variant="body2" sx={{ my: 2 }}>
          This component declares no props of its own.
        </Typography>
      )}
      {[...inherited].map(([owner, list]) => (
        <InheritedProps key={owner} owner={owner} props={list} docName={doc.name} />
      ))}
      {events.length > 0 && (
        <>
          <SectionHeading level={sub} id={toAnchor(`${doc.name} events`)} sx={{ mt: 3, mb: 0 }}>
            Events
          </SectionHeading>
          <PropsTable props={events} caption={`${doc.name} events`} />
        </>
      )}
      {slots.length > 0 && (
        <>
          <SectionHeading level={sub} id={toAnchor(`${doc.name} slots`)} sx={{ mt: 3, mb: 0 }}>
            Slots
          </SectionHeading>
          <PropsTable props={slots} caption={`${doc.name} slots`} />
        </>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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
