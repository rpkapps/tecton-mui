import type { ComponentType } from 'react';
import type { MDXComponents, MDXProps } from 'mdx/types';
import Box from '@tecton-mui/ui/Box';
import { toAnchor } from '../lib/slug';
import { SectionHeading } from './mdx';

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
      <SectionHeading level={3} id={`${idPrefix}-${toAnchor(textOf(children))}`}>
        {children}
      </SectionHeading>
    ),
    h3: ({ children }) => (
      <SectionHeading level={4} id={`${idPrefix}-${toAnchor(textOf(children))}`}>
        {children}
      </SectionHeading>
    ),
  };
  return (
    <Box sx={{ '& td, & th': { verticalAlign: 'top' } }}>
      <Doc components={components} />
    </Box>
  );
}
