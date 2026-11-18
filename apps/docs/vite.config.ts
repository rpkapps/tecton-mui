import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { defineConfig, defaultClientConditions, defaultServerConditions } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

/**
 * Public base path. GitHub Pages project sites are served from `/<repository>/`, so CI sets
 * `DOCS_BASE=/<repository>/`; local builds default to `/`.
 */
function normalizeBase(raw: string | undefined): string {
  const value = (raw ?? '/').trim() || '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
}

const base = normalizeBase(process.env.DOCS_BASE);
// Demos import date-fns locales exactly like consumer code does. date-fns is a dependency of
// @tecton-mui/ui (not of this app), so resolve it from the UI package to share one instance.
const dateFnsDir = dirname(
  createRequire(new URL('../../packages/ui/package.json', import.meta.url)).resolve(
    'date-fns/package.json',
  ),
);
// Resolve @tecton-mui/ui to its TypeScript sources (no UI package build needed for the docs).
const SOURCE_CONDITION = '@tecton-mui/source';

export default defineConfig(({ isSsrBuild }) => ({
  base,
  plugins: [
    tanstackRouter({
      target: 'react',
      // Split route chunks for the browser; the Node prerender bundle needs no lazy loading.
      autoCodeSplitting: !isSsrBuild,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      quoteStyle: 'single',
      semicolons: true,
    }),
    {
      enforce: 'pre',
      ...mdx({ remarkPlugins: [remarkGfm], providerImportSource: '@mdx-js/react' }),
    },
    react({ include: /\.(mdx|md|js|jsx|ts|tsx)$/ }),
  ],
  resolve: {
    conditions: [SOURCE_CONDITION, ...defaultClientConditions],
    // Markdown compiled from outside this app (e.g. the UI package CHANGELOG.md) must still use
    // the portal's React and MDX provider instances.
    dedupe: ['react', 'react-dom', '@mdx-js/react'],
    alias: [
      { find: /^date-fns$/, replacement: `${dateFnsDir}/index.js` },
      { find: /^date-fns\/locale\/([\w-]+)$/, replacement: `${dateFnsDir}/locale/$1.js` },
      {
        // `@tecton-mui/ui/styles/global.css` maps to the UI package's dist/ in its exports map.
        // The portal consumes the same Tecton fonts/icons/tokens straight from the package assets
        // (identical content, see src/styles/tecton-global.css) so it builds without the UI build.
        find: /^@tecton-mui\/ui\/styles\/global\.css$/,
        replacement: fileURLToPath(new URL('./src/styles/tecton-global.css', import.meta.url)),
      },
    ],
  },
  ssr: {
    // The prerender bundle inlines everything except React, which Node loads from this app.
    noExternal: true,
    external: ['react', 'react-dom'],
    resolve: {
      conditions: [SOURCE_CONDITION, ...defaultServerConditions],
      externalConditions: ['node'],
    },
  },
  build: isSsrBuild
    ? { outDir: 'dist-server', emptyOutDir: true, copyPublicDir: false, minify: false }
    : { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
}));
