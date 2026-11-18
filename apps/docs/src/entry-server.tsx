// Prerender entry (bundled by `vite build --ssr`, executed by scripts/postbuild.mjs in Node).
// Renders each route to static HTML with TanStack Router's memory history.
import { PassThrough } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router';
import { TectonModeScript, tectonPaletteDark } from '@tecton-mui/ui/styles';
import { createAppRouter, BASEPATH } from './router';
import { HeadContext, SITE_NAME, type HeadData } from './lib/head';
import { apiEntries, componentPages } from './data/catalog';
import { toSlug } from './lib/slug';

export interface RenderResult {
  html: string;
  head: string;
  status: number;
}

const STATIC_EXCLUDE = new Set(['/components/$slug', '/api/$slug']);

/** Every path to prerender (without the base path). */
export function getPrerenderPaths(): string[] {
  const router = createAppRouter(createMemoryHistory({ initialEntries: ['/'] }));
  const staticPaths = Object.keys(router.routesByPath)
    .filter((p) => !STATIC_EXCLUDE.has(p) && !p.includes('$'))
    .map((p) => (p.length > 1 ? p.replace(/\/$/, '') : p));
  return [
    ...new Set([
      ...staticPaths,
      ...componentPages.map((p) => `/components/${p.slug}`),
      ...apiEntries.map((e) => `/api/${toSlug(e.name)}`),
    ]),
  ].sort();
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  const pass = new PassThrough();
  stream.pipe(pass);
  for await (const chunk of pass) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Head tags shared by every page: Tecton's pre-paint mode script (sets `data-theme` from the stored
 * preference) and a style that keeps dark-mode visitors from seeing the light prerender before the
 * client render takes over.
 */
function sharedHead(): string {
  const dark = tectonPaletteDark.background.default;
  return (
    renderToStaticMarkup(<TectonModeScript />) +
    `<style>html[data-theme="dark"]:not([data-docs-ready]){background:${dark};color-scheme:dark}` +
    `html[data-theme="dark"]:not([data-docs-ready]) #root{visibility:hidden}</style>`
  );
}

export async function render(path: string): Promise<RenderResult> {
  const url = BASEPATH === '/' ? path : `${BASEPATH}${path === '/' ? '' : path}`;
  const router = createAppRouter(createMemoryHistory({ initialEntries: [url] }));
  await router.load();
  const head: HeadData = {};
  const collector = { set: (data: HeadData) => Object.assign(head, data) };
  const { prelude } = await prerenderToNodeStream(
    <HeadContext.Provider value={collector}>
      <RouterProvider router={router} />
    </HeadContext.Provider>,
    // Keep every completed Suspense boundary inline. By default React outlines large boundaries
    // into hidden segments revealed by script, which would hide content from crawlers/Pagefind.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );
  const html = await streamToString(prelude);
  const notFound = router.state.matches.some(
    (m) => m.status === 'notFound' || (m as { globalNotFound?: boolean }).globalNotFound,
  );
  const title = head.title ?? SITE_NAME;
  const headTags =
    `<title>${escapeHtml(title)}</title>` +
    (head.description
      ? `<meta name="description" content="${escapeHtml(head.description)}" />`
      : '') +
    sharedHead();
  return { html, head: headTags, status: notFound ? 404 : 200 };
}
