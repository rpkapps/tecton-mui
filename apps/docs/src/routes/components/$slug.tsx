import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { getApiEntryBySlug, getComponentPage, pageForComponent } from '../../data/catalog';
import { loadApi, loadComponentContent, loadDemos } from '../../lib/content';
import { toAnchor } from '../../lib/slug';
import { ComponentPage } from '../../components/ComponentPage';
import { preloadMuiDocs } from '../../mui-docs';

export const Route = createFileRoute('/components/$slug')({
  beforeLoad: ({ params }) => {
    if (getComponentPage(params.slug)) return;
    // An export documented on another page (e.g. `ButtonGroup` on Button, `DesktopDatePicker` on
    // Date Picker) has no page of its own: send its old URL to the section of the parent page.
    const entry = getApiEntryBySlug(params.slug);
    const parent = entry && pageForComponent(entry.name);
    if (!entry || !parent || parent.kind !== 'authored') return;
    throw redirect({
      to: '/components/$slug',
      params: { slug: parent.slug },
      hash: parent.anchors?.[entry.name] ?? toAnchor(`${entry.name} api`),
      replace: true,
    });
  },
  loader: async ({ params }) => {
    const page = getComponentPage(params.slug);
    if (!page) throw notFound();
    const [Content, demos, api] = await Promise.all([
      page.kind === 'authored' ? loadComponentContent(page.slug) : Promise.resolve(null),
      page.kind === 'authored' ? loadDemos(page.slug) : Promise.resolve({}),
      loadApi(page.components),
      // Load the synced examples with the route, so a `#section` hash (e.g. from a folded export's
      // old URL) points at rendered content when the router scrolls to it.
      preloadMuiDocs(page.slug),
    ]);
    return { page, Content, demos, api };
  },
  component: ComponentRoute,
});

function ComponentRoute() {
  const data = Route.useLoaderData();
  return <ComponentPage {...data} />;
}
