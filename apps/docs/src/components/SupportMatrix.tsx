import type { ComponentType } from 'react';
import type { MDXComponents, MDXProps } from 'mdx/types';
import Box from '@tecton-mui/ui/Box';
import Typography from '@tecton-mui/ui/Typography';
import { toAnchor } from '../lib/slug';

function textOf(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: unknown } }).props.children);
  }
  return '';
}

/**
 * Renders a component's SUPPORT.md (the feature matrix maintained next to the implementation in
 * packages/ui) inside a portal page: its title is dropped and its headings are nested one level
 * below the page section that embeds it. Tables use the portal's MDX table mapping.
 */
export function SupportMatrix({
  Doc,
  idPrefix,
}: {
  Doc: ComponentType<MDXProps>;
  idPrefix: string;
}) {
  const components: MDXComponents = {
    h1: () => null,
    h2: ({ children }) => (
      <Typography
        variant="h6"
        component="h3"
        id={`${idPrefix}-${toAnchor(textOf(children))}`}
        sx={{ mt: 4, mb: 1.5, scrollMarginTop: 80 }}
      >
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="subtitle1" component="h4" sx={{ mt: 3, mb: 1 }}>
        {children}
      </Typography>
    ),
  };
  return (
    <Box sx={{ '& td, & th': { verticalAlign: 'top' } }}>
      <Doc components={components} />
    </Box>
  );
}
