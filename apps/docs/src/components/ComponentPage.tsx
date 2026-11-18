import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';
import Typography from '@tecton-mui/ui/Typography';
import Alert from '@tecton-mui/ui/Alert';
import Chip from '@tecton-mui/ui/Chip';
import Stack from '@tecton-mui/ui/Stack';
import { categories, pageForComponent, type ComponentPageRef } from '../data/catalog';
import type { ApiDoc } from '../lib/content';
import { PageHeader } from './PageHeader';
import { ApiReference, ImportSnippet } from './ApiReference';
import { DemosContext, type LoadedDemo } from './Demo';
import { RouterLink } from './links';

const PACKAGE_LABEL: Record<string, string> = {
  '@mui/material': 'MUI Core',
  '@mui/lab': 'MUI Lab',
  '@mui/x-date-pickers': 'MUI X Community',
  '@mui/x-tree-view': 'MUI X Community',
  '@tecton-mui/ui': 'Tecton component',
};

/** Component page template (portal §8.3): summary, import, authored content, generated API. */
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
  return (
    <article>
      <PageHeader
        title={page.title}
        description={auto ? undefined : page.summary}
        searchWeight={auto ? 4 : 10}
        crumbs={[{ title: 'Components', to: '/components' }, { title: category.title }]}
      >
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: 'wrap' }}>
          {sources.map((s) => (
            <Chip
              key={s}
              size="small"
              variant="outlined"
              label={`${PACKAGE_LABEL[s] ?? s} · ${s}`}
            />
          ))}
          {page.category === 'lab' && (
            <Chip size="small" color="warning" label="Upstream Lab API" />
          )}
          {page.status === 'integration-pending' && (
            <Chip size="small" color="info" label="Integration in progress" />
          )}
        </Stack>
      </PageHeader>

      {auto && (
        <div data-pagefind-weight="0.5">
          <Typography sx={{ mb: 2 }}>
            {page.title} belongs to the {category.title} family.{' '}
            {doc?.package === '@tecton-mui/ui'
              ? 'It is implemented by this library.'
              : `It is exported unchanged from ${doc?.package} and styled by the Tecton theme, so upstream behaviour, props and accessibility semantics apply.`}
          </Typography>
          {related && related.slug !== page.slug && (
            <Typography sx={{ mb: 2 }}>
              It builds on{' '}
              <RouterLink to={`/components/${related.slug}` as '/'}>{related.title}</RouterLink>;
              see that page for usage guidance and demos.
            </Typography>
          )}
        </div>
      )}

      {api.length > 0 && (
        <>
          <Typography variant="h5" component="h2" id="import" sx={{ mt: 4, mb: 1 }}>
            Import
          </Typography>
          <ImportSnippet docs={api} />
        </>
      )}

      {Content && (
        <DemosContext.Provider value={demos}>
          <Content />
        </DemosContext.Provider>
      )}

      {auto && (
        <Alert severity="info" variant="outlined" sx={{ my: 3, width: 'auto' }}>
          This page is generated from the package exports. A hand-written guide with live demos has
          not been published for this component yet.
        </Alert>
      )}

      {api.length > 0 && (
        <>
          <Typography variant="h5" component="h2" id="api" sx={{ mt: 5 }}>
            API
          </Typography>
          {api.map((d) => (
            <ApiReference key={d.name} doc={d} />
          ))}
        </>
      )}
    </article>
  );
}
