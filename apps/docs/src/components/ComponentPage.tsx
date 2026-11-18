import * as React from 'react';
import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';
import Typography from '@tecton-mui/ui/Typography';
import Alert from '@tecton-mui/ui/Alert';
import Chip from '@tecton-mui/ui/Chip';
import Box from '@tecton-mui/ui/Box';
import Skeleton from '@tecton-mui/ui/Skeleton';
import { categories, pageForComponent, type ComponentPageRef } from '../data/catalog';
import type { ApiDoc } from '../lib/content';
import { hasMuiDocs, MuiDocsSection } from '../mui-docs';
import { PageHeader } from './PageHeader';
import { ApiReference, ImportSnippet } from './ApiReference';
import { DemosContext, type LoadedDemo } from './Demo';
import { SectionHeading } from './mdx';
import { RouterLink } from './links';

const PACKAGE_LABEL: Record<string, string> = {
  '@mui/material': 'Material UI',
  '@mui/lab': 'MUI Lab',
  '@mui/x-date-pickers': 'MUI X Community',
  '@mui/x-tree-view': 'MUI X Community',
  '@mui/x-data-grid': 'MUI X Community',
  '@tecton-mui/ui': 'Tecton MUI',
};

function ExamplesFallback() {
  return (
    <Box aria-busy="true" aria-label="Loading examples" sx={{ my: 3 }}>
      <Skeleton variant="rounded" height={200} />
    </Box>
  );
}

/**
 * Component page template (portal §8.3): title and summary, import lines, the Tecton-specific
 * guide (MDX with live demos), upstream Material UI examples when available, generated API.
 */
export function ComponentPage({
  page,
  Content,
  demos,
  api,
}: {
  page: ComponentPageRef;
  Content: ComponentType<MDXProps> | null;
  demos: Record<string, LoadedDemo>;
  api: ApiDoc[];
}) {
  const category = categories.find((c) => c.id === page.category)!;
  const sources = [...new Set(api.map((d) => d.package))];
  const auto = page.kind === 'auto';
  const doc = api[0];
  const related = auto && doc?.inherits ? pageForComponent(doc.inherits) : undefined;
  const examples = hasMuiDocs(page.slug);
  return (
    <article>
      <PageHeader
        title={page.title}
        description={
          auto
            ? `${page.title} is part of the ${category.title} family. ${category.description}`
            : page.summary
        }
        searchWeight={auto ? 4 : 10}
        crumbs={[{ title: 'Components', to: '/components' }, { title: category.title }]}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5 }} data-pagefind-ignore="all">
          {sources.map((s) => (
            <Chip
              key={s}
              size="small"
              variant="outlined"
              label={`${PACKAGE_LABEL[s] ?? s} · ${s}`}
            />
          ))}
          {page.category === 'lab' && (
            <Chip size="small" color="warning" variant="outlined" label="Upstream Lab API" />
          )}
          {page.status === 'integration-pending' && (
            <Chip size="small" color="info" label="Integration in progress" />
          )}
          {api.length > 0 && (
            <Chip
              size="small"
              variant="outlined"
              label="API reference"
              component="a"
              href="#api"
              clickable
            />
          )}
        </Box>
      </PageHeader>

      {auto && (
        <div data-pagefind-weight="0.5">
          <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
            {doc?.package === '@tecton-mui/ui'
              ? `${page.title} is implemented by this library.`
              : `${page.title} is exported unchanged from ${doc?.package} and styled by the Tecton theme, so upstream behaviour, props and accessibility semantics apply.`}
            {related && related.slug !== page.slug && (
              <>
                {' '}
                It builds on{' '}
                <RouterLink to={`/components/${related.slug}` as '/'}>{related.title}</RouterLink>;
                see that page for usage guidance and demos.
              </>
            )}
          </Typography>
        </div>
      )}

      {api.length > 0 && <ImportSnippet docs={api} />}

      {Content && (
        <DemosContext.Provider value={demos}>
          <Content />
        </DemosContext.Provider>
      )}

      {examples && (
        <section>
          <SectionHeading level={2} id="examples">
            Examples
          </SectionHeading>
          <React.Suspense fallback={<ExamplesFallback />}>
            <MuiDocsSection slug={page.slug} />
          </React.Suspense>
        </section>
      )}

      {auto && !examples && (
        <Alert severity="info" variant="outlined" sx={{ my: 3, width: 'auto' }}>
          This page is generated from the package exports. A hand-written guide with live demos has
          not been published for this component yet.
        </Alert>
      )}

      {api.length > 0 && (
        <section>
          <SectionHeading level={2} id="api">
            API
          </SectionHeading>
          {api.map((d) => (
            <ApiReference key={d.name} doc={d} />
          ))}
        </section>
      )}
    </article>
  );
}
