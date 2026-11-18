import { createFileRoute, notFound } from '@tanstack/react-router';
import { getComponentPage } from '../../data/catalog';
import { loadApi, loadComponentContent, loadDemos } from '../../lib/content';
import { ComponentPage } from '../../components/ComponentPage';

export const Route = createFileRoute('/components/$slug')({
  loader: async ({ params }) => {
    const page = getComponentPage(params.slug);
    if (!page) throw notFound();
    const [Content, demos, api] = await Promise.all([
      page.kind === 'authored' ? loadComponentContent(page.slug) : Promise.resolve(null),
      page.kind === 'authored' ? loadDemos(page.slug) : Promise.resolve({}),
      loadApi(page.components),
    ]);
    return { page, Content, demos, api };
  },
  component: ComponentRoute,
});

function ComponentRoute() {
  const data = Route.useLoaderData();
  return <ComponentPage {...data} />;
}
