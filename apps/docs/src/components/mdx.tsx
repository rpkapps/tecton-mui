import * as React from 'react';
import type { MDXComponents } from 'mdx/types';
import Typography from '@tecton-mui/ui/Typography';
import Link from '@tecton-mui/ui/Link';
import Table from '@tecton-mui/ui/Table';
import TableBody from '@tecton-mui/ui/TableBody';
import TableCell from '@tecton-mui/ui/TableCell';
import TableContainer from '@tecton-mui/ui/TableContainer';
import TableHead from '@tecton-mui/ui/TableHead';
import TableRow from '@tecton-mui/ui/TableRow';
import Divider from '@tecton-mui/ui/Divider';
import Alert from '@tecton-mui/ui/Alert';
import Box from '@tecton-mui/ui/Box';
import Icon from '@tecton-mui/ui/Icon';
import { CodeBlock } from './CodeBlock';
import { Demo } from './Demo';
import { RouterLink } from './links';
import { toAnchor } from '../lib/slug';

export function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return textOf(node.props.children);
  return '';
}

const HEADING_VARIANT = { 1: 'h3', 2: 'h4', 3: 'h5', 4: 'subtitle1' } as const;
const HEADING_SPACING = {
  1: { mt: 0, mb: 2 },
  2: { mt: 7, mb: 2 },
  3: { mt: 4.5, mb: 1.5 },
  4: { mt: 3, mb: 1 },
} as const;

/**
 * Section heading with a hover anchor link. Level 2 and 3 headings feed the "On this page" table
 * of contents (collected from the rendered `h2[id]`/`h3[id]` elements).
 */
export function SectionHeading({
  level,
  id,
  children,
  sx,
}: {
  level: 1 | 2 | 3 | 4;
  id?: string;
  children?: React.ReactNode;
  sx?: Record<string, unknown>;
}) {
  const anchor = level > 1 ? (id ?? toAnchor(textOf(children))) : undefined;
  return (
    <Typography
      variant={HEADING_VARIANT[level]}
      component={`h${level}`}
      id={anchor}
      className="docs-heading"
      sx={{
        ...HEADING_SPACING[level],
        scrollMarginTop: 88,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
    >
      <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {children}
      </Box>
      {anchor && (
        <Link
          href={`#${anchor}`}
          className="docs-anchor"
          aria-label={`Link to this section: ${textOf(children)}`}
          color="text.secondary"
          sx={{ display: 'inline-flex', lineHeight: 0 }}
          data-pagefind-ignore=""
        >
          <Icon name="link" size="small" />
        </Link>
      )}
    </Typography>
  );
}

function heading(level: 1 | 2 | 3 | 4) {
  const Heading = ({ children }: { children?: React.ReactNode }) => (
    <SectionHeading level={level}>{children}</SectionHeading>
  );
  return Heading;
}

/** Internal links use the router (base path aware); external links open as normal anchors. */
export function DocLink({ href = '', children }: { href?: string; children?: React.ReactNode }) {
  if (href.startsWith('/')) {
    const [path, hash] = href.split('#');
    return (
      <RouterLink to={path as '/'} hash={hash}>
        {children}
      </RouterLink>
    );
  }
  if (href.startsWith('#')) return <Link href={href}>{children}</Link>;
  return (
    <Link href={href} target="_blank" rel="noreferrer">
      {children}
    </Link>
  );
}

/** Inline `code` inside prose. */
export function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <Box
      component="code"
      sx={{
        fontFamily: 'var(--tecton-font-family-mono), monospace',
        fontSize: '0.85em',
        px: 0.625,
        py: 0.25,
        borderRadius: 0.75,
        bgcolor: 'var(--tecton-color-content-bg-hover)',
        border: '1px solid var(--tecton-color-divider-subtle)',
        // `break-word` (not `anywhere`) keeps tokens whole when table columns are sized.
        overflowWrap: 'break-word',
      }}
    >
      {children}
    </Box>
  );
}

/** Bordered table with a tinted header row and horizontal scrolling on narrow screens. */
export function DocsTable({
  children,
  label,
  size = 'small',
}: {
  children: React.ReactNode;
  label?: string;
  size?: 'small' | 'medium';
}) {
  return (
    <TableContainer
      className="docs-scroll"
      sx={{
        my: 2.5,
        border: '1px solid var(--tecton-color-divider-subtle)',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        '& th': {
          fontWeight: 600,
          bgcolor: 'var(--tecton-color-bg-default)',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        },
        '& td, & th': { verticalAlign: 'top', borderColor: 'var(--tecton-color-divider-subtle)' },
        // Tecton's table cells use the tabular data font; documentation tables hold prose.
        '& td': {
          fontFamily: 'var(--tecton-font-family-sans), sans-serif',
          fontSize: 14,
          lineHeight: 1.6,
        },
        '& tbody tr:last-of-type td': { borderBottom: 0 },
      }}
    >
      <Table size={size} aria-label={label}>
        {children}
      </Table>
    </TableContainer>
  );
}

const prose = { lineHeight: 1.7 } as const;

/** MDX element -> Tecton component mapping used by every content page. */
export const mdxComponents: MDXComponents = {
  Demo,
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: ({ children }) => (
    <Typography variant="body1" component="p" sx={{ mb: 2, ...prose }}>
      {children}
    </Typography>
  ),
  a: DocLink,
  ul: ({ children }) => (
    <Box component="ul" sx={{ pl: 3, mt: 0, mb: 2, typography: 'body1', ...prose }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ pl: 3, mt: 0, mb: 2, typography: 'body1', ...prose }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Box component="li" sx={{ mb: 0.75, '& > p': { mb: 0.5 } }}>
      {children}
    </Box>
  ),
  hr: () => <Divider sx={{ my: 5 }} />,
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 600 }}>
      {children}
    </Box>
  ),
  kbd: ({ children }) => (
    <Box
      component="kbd"
      sx={{
        fontFamily: 'var(--tecton-font-family-mono), monospace',
        fontSize: '0.8em',
        px: 0.75,
        py: 0.125,
        border: '1px solid var(--tecton-color-divider)',
        borderBottomWidth: 2,
        borderRadius: 0.75,
        bgcolor: 'background.paper',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  ),
  blockquote: ({ children }) => (
    <Alert
      severity="info"
      variant="outlined"
      sx={{ my: 2.5, width: 'auto', '& p': { lineHeight: 1.6 }, '& p:last-child': { mb: 0 } }}
    >
      {children}
    </Alert>
  ),
  table: ({ children }) => <DocsTable>{children}</DocsTable>,
  thead: ({ children }) => <TableHead>{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children, style }) => (
    <TableCell sx={{ textAlign: style?.textAlign }}>{children}</TableCell>
  ),
  td: ({ children, style }) => (
    <TableCell sx={{ textAlign: style?.textAlign, lineHeight: 1.6 }}>{children}</TableCell>
  ),
  pre: (props) => {
    const { children } = props;
    const data = props as Record<string, unknown>;
    const code = React.isValidElement<{ className?: string; children?: React.ReactNode }>(children)
      ? children
      : null;
    const language =
      (typeof data['data-language'] === 'string' && data['data-language']) ||
      /language-([\w-]+)/.exec(code?.props.className ?? '')?.[1] ||
      undefined;
    const html = typeof data['data-html'] === 'string' ? data['data-html'] : undefined;
    return (
      <CodeBlock
        code={textOf(code?.props.children ?? children)}
        language={language}
        html={html}
        maxLines={40}
      />
    );
  },
  code: InlineCode,
};
