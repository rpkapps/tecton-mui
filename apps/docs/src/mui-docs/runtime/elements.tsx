// Building blocks of the synced MUI documentation pages (src/mui-docs/generated/pages/*). Prose
// elements resolve through the portal's MDX component mapping, so synced text is styled exactly
// like the authored pages.
import * as React from 'react';
import { useMDXComponents } from '@mdx-js/react';
import Alert from '@tecton-mui/ui/Alert';
import Box from '@tecton-mui/ui/Box';
import Divider from '@tecton-mui/ui/Divider';
import Link from '@tecton-mui/ui/Link';
import Typography from '@tecton-mui/ui/Typography';
import { SectionHeading } from '../../components/mdx';
import { DemosContext, type LoadedDemo } from '../../components/Demo';

export { Demo } from '../../components/Demo';
export { CodeBlock } from '../../components/CodeBlock';

type ElementProps = { children?: React.ReactNode } & Record<string, unknown>;

const FALLBACK: Partial<Record<string, React.ComponentType<ElementProps>>> = {
  img: ({ src, alt }) => (
    <Box
      component="img"
      src={src as string}
      alt={(alt as string) ?? ''}
      loading="lazy"
      sx={{ display: 'block', maxWidth: '100%', height: 'auto', my: 2 }}
    />
  ),
  video: ({ children, width, height }) => (
    <Box
      component="video"
      autoPlay
      muted
      loop
      playsInline
      width={width as string}
      height={height as string}
      sx={{ display: 'block', maxWidth: '100%', height: 'auto', my: 2 }}
    >
      {children}
    </Box>
  ),
};

function element(tag: string) {
  function MdxElement(props: ElementProps) {
    const components = useMDXComponents() as Record<string, React.ElementType | undefined>;
    const Component = components[tag] ?? FALLBACK[tag] ?? (tag as React.ElementType);
    return <Component {...props} />;
  }
  MdxElement.displayName = `MuiDocs.${tag}`;
  return MdxElement;
}

const TAGS = [
  'p',
  'a',
  'ul',
  'ol',
  'li',
  'code',
  'kbd',
  'hr',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
  'video',
] as const;

/** Prose elements (`<M.p>`, `<M.a>`, ...) mapped through the portal's MDX components. */
export const M = Object.fromEntries(TAGS.map((t) => [t, element(t)])) as Record<
  (typeof TAGS)[number],
  React.ComponentType<ElementProps>
>;

/**
 * Section heading of a synced page. Upstream h2 sections render as h3 (they sit under the
 * template's "Examples" h2), so h3 entries feed the page table of contents.
 */
export function Heading({
  level,
  id,
  children,
}: {
  level: 3 | 4;
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <SectionHeading level={level} id={id}>
      {children}
    </SectionHeading>
  );
}

const SEVERITY = { info: 'info', warning: 'warning', success: 'success', error: 'error' } as const;

/** MUI `:::info` / `:::warning` / ... callouts. */
export function Callout({
  severity,
  children,
}: {
  severity: keyof typeof SEVERITY | string;
  children?: React.ReactNode;
}) {
  return (
    <Alert
      severity={SEVERITY[severity as keyof typeof SEVERITY] ?? 'info'}
      variant="outlined"
      sx={{ my: 2, width: 'auto', '& p:last-child': { mb: 0 } }}
    >
      {children}
    </Alert>
  );
}

/** Placeholder for an upstream example that is not shown in the portal (reason in the manifest). */
export function ExcludedDemo({ name, reason }: { name: string; reason: string }) {
  return (
    <Box
      data-mui-demo-excluded={name}
      sx={{
        my: 3,
        px: 2,
        py: 1.5,
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        The upstream example <strong>{name}</strong> is not shown here: {reason}.
      </Typography>
    </Box>
  );
}

/** Wraps a synced page: provides its demos to `<Demo>` and marks the content for tests. */
export function MuiDocsContent({
  demos,
  children,
}: {
  demos: Record<string, LoadedDemo>;
  children?: React.ReactNode;
}) {
  return (
    <DemosContext.Provider value={demos}>
      <div data-mui-docs="">{children}</div>
    </DemosContext.Provider>
  );
}

/** Required attribution of the MIT-licensed upstream documentation. */
export function Attribution({
  version,
  sources,
}: {
  version: string;
  sources: { label: string; href: string }[];
}) {
  return (
    <Box component="footer" data-mui-docs-attribution="" sx={{ mt: 5 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="caption" component="p" color="text.secondary">
        Examples and text adapted from the MIT-licensed Material UI documentation (v{version}), ©
        Call-Em-All / Material-UI SAS and contributors. Source:{' '}
        {sources.map((s, i) => (
          <React.Fragment key={s.href}>
            {i > 0 && ', '}
            <Link href={s.href} color="inherit">
              {s.label}
            </Link>
          </React.Fragment>
        ))}
        .
      </Typography>
    </Box>
  );
}
