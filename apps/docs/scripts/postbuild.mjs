#!/usr/bin/env node
// Static-site post-processing for GitHub Pages (runs after `vite build`):
//   1. builds the prerender bundle (`vite build --ssr src/entry-server.tsx` -> dist-server/)
//   2. renders every route to `dist/<route>/index.html` (+ `404.html` SPA fallback)
//   3. writes `.nojekyll`
//   4. indexes the prerendered pages with Pagefind (`dist/pagefind/`)
//   5. checks internal links (scripts/check-links.mjs)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import * as pagefind from 'pagefind';
import { checkLinks } from './check-links.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const serverOut = join(root, 'dist-server');
const started = Date.now();

// 1. Prerender bundle (same vite.config.ts; SSR-specific options live in its `ssr` block).
await build({
  root,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: serverOut, emptyOutDir: true },
});
const server = await import(pathToFileURL(join(serverOut, 'entry-server.js')).href);

// 2. Prerender.
const template = readFileSync(join(dist, 'index.html'), 'utf8').replace(
  /<title>[^<]*<\/title>\s*/,
  '',
);
const fill = ({ head, html }) =>
  template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);

const paths = server.getPrerenderPaths();
const pages = [];
for (const path of paths) {
  const result = await server.render(path);
  if (result.status !== 200) throw new Error(`Prerender of ${path} returned ${result.status}`);
  const file = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  const content = fill(result);
  writeFileSync(file, content);
  pages.push({ path, content });
}
// GitHub Pages serves 404.html for unknown URLs; the client router then renders the real route
// (or its not-found page). Asset URLs are absolute (base-prefixed), so it works at any depth.
const notFound = await server.render('/__not-found__');
writeFileSync(join(dist, '404.html'), fill(notFound));

// 3. Disable Jekyll processing so files and folders starting with `_` are served.
writeFileSync(join(dist, '.nojekyll'), '');

// 4. Search index. URLs are indexed without the base path; the client passes `baseUrl`.
const { index, errors } = await pagefind.createIndex({});
if (!index) throw new Error(`Pagefind: ${errors.join(', ')}`);
for (const { path, content } of pages) {
  const url = path === '/' ? '/' : `${path}/`;
  const res = await index.addHTMLFile({ url, content });
  if (res.errors.length) throw new Error(`Pagefind (${path}): ${res.errors.join(', ')}`);
}
const written = await index.writeFiles({ outputPath: join(dist, 'pagefind') });
if (written.errors.length) throw new Error(`Pagefind: ${written.errors.join(', ')}`);
await pagefind.close();

rmSync(serverOut, { recursive: true, force: true });
console.log(
  `[postbuild] prerendered ${pages.length} pages + 404.html, search index written ` +
    `(${((Date.now() - started) / 1000).toFixed(1)}s)`,
);

// 5. Fail the build on broken internal links.
const base = (process.env.DOCS_BASE ?? '/').replace(/^\/*|\/*$/g, '');
checkLinks({ dist, base: base ? `/${base}/` : '/' });
