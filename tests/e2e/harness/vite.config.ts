import { defineConfig, defaultClientConditions, defaultServerConditions } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const assets = fileURLToPath(new URL('../../../packages/ui/assets/tecton/', import.meta.url));
export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['@tecton-mui/source', ...defaultClientConditions],
    alias: [
      {
        find: /^@tecton-mui\/ui\/styles\/(tokens|fonts|icons)\.css$/,
        replacement: `${assets}$1.css`,
      },
    ],
  },
  // /ssr renders on the server (server.mjs). Bundle @tecton-mui/ui through Vite there too, so the
  // source condition applies: left external, Node resolves it to dist/, which needs a UI build
  // (CI runs the browser tests without one, and the page then fails with a 500).
  ssr: {
    noExternal: ['@tecton-mui/ui'],
    resolve: { conditions: ['@tecton-mui/source', ...defaultServerConditions] },
  },
});
