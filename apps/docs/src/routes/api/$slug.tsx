import { createFileRoute, notFound } from '@tanstack/react-router';
import Typography from '@tecton-mui/ui/Typography';
import { getApiEntryBySlug, pageForComponent } from '../../data/catalog';
import { loadApi } from '../../lib/content';
import { PageHeader } from '../../components/PageHeader';
import { ApiReference, ImportSnippet } from '../../components/ApiReference';
import { RouterLink } from '../../components/links';

export const Route = createFileRoute('/api/$slug')({
  loader: async ({ params }) => {
    const entry = getApiEntryBySlug(params.slug);
    if (!entry) throw notFound();
    const [doc] = await loadApi([entry.name]);
    if (!doc) throw notFound();
    return { doc, page: pageForComponent(entry.name) ?? null };
  },
  component: ApiPage,
});

function ApiPage() {
  const { doc, page } = Route.useLoaderData();
  return (
    <article>
      <PageHeader
        title={`${doc.name} API`}
        description={`Generated API reference for ${doc.name}.`}
        crumbs={[{ title: 'API Reference', to: '/api' }]}
        searchWeight={3}
      />
      {page && (
        <Typography sx={{ mb: 2, lineHeight: 1.7 }}>
          Usage guidance and demos:{' '}
          <RouterLink to="/components/$slug" params={{ slug: page.slug }}>
            {page.title}
          </RouterLink>
        </Typography>
      )}
      <ImportSnippet docs={[doc]} />
      <ApiReference doc={doc} level={2} />
    </article>
  );
}
