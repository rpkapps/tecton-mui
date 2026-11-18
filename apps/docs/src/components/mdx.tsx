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
import Paper from '@tecton-mui/ui/Paper';
import Divider from '@tecton-mui/ui/Divider';
import Alert from '@tecton-mui/ui/Alert';
import Box from '@tecton-mui/ui/Box';
import { CodeBlock } from './CodeBlock';
import { Demo } from './Demo';
import { RouterLink } from './links';
import { toAnchor } from '../lib/slug';

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return textOf(node.props.children);
  return '';
}

function heading(level: 1 | 2 | 3 | 4) {
  const variant = ({ 1: 'h3', 2: 'h5', 3: 'h6', 4: 'subtitle1' } as const)[level];
  const component = `h${level}` as const;
  const Heading = ({ children }: { children?: React.ReactNode }) => (
    <Typography
      variant={variant}
      component={component}
      id={level > 1 ? toAnchor(textOf(children)) : undefined}
      sx={{
        mt: level === 1 ? 0 : level === 2 ? 5 : 3,
        mb: level === 1 ? 2 : 1.5,
        scrollMarginTop: 80,
      }}
    >
      {children}
    </Typography>
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
  return <Link href={href}>{children}</Link>;
}

/** MDX element -> Tecton component mapping used by every content page. */
export const mdxComponents: MDXComponents = {
  Demo,
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: ({ children }) => (
    <Typography variant="body1" component="p" sx={{ mb: 2 }}>
      {children}
    </Typography>
  ),
  a: DocLink,
  ul: ({ children }) => (
    <Box component="ul" sx={{ pl: 3, mt: 0, mb: 2, typography: 'body1' }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ pl: 3, mt: 0, mb: 2, typography: 'body1' }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Box component="li" sx={{ mb: 0.5 }}>
      {children}
    </Box>
  ),
  hr: () => <Divider sx={{ my: 4 }} />,
  kbd: ({ children }) => (
    <Box
      component="kbd"
      sx={{
        typography: 'data',
        fontSize: '0.8em',
        px: 0.75,
        py: 0.125,
        border: 1,
        borderColor: 'divider',
        borderBottomWidth: 2,
        borderRadius: 0.5,
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
      sx={{ my: 2, width: 'auto', '& p:last-child': { mb: 0 } }}
    >
      {children}
    </Alert>
  ),
  table: ({ children }) => (
    <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
      <Table size="small">{children}</Table>
    </TableContainer>
  ),
  thead: ({ children }) => <TableHead>{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children, style }) => (
    <TableCell sx={{ fontWeight: 600, textAlign: style?.textAlign }}>{children}</TableCell>
  ),
  td: ({ children, style }) => (
    <TableCell sx={{ textAlign: style?.textAlign }}>{children}</TableCell>
  ),
  pre: ({ children }) => {
    const code = React.isValidElement<{ className?: string; children?: React.ReactNode }>(children)
      ? children
      : null;
    const language = /language-(\w+)/.exec(code?.props.className ?? '')?.[1];
    return <CodeBlock code={textOf(code?.props.children ?? children)} language={language} />;
  },
  code: ({ children }) => (
    <Box
      component="code"
      sx={{
        typography: 'data',
        fontSize: '0.875em',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        bgcolor: 'action.hover',
      }}
    >
      {children}
    </Box>
  ),
};
