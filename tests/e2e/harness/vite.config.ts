import { defineConfig, defaultClientConditions, defaultServerConditions } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

const assets = fileURLToPath(new URL('../../../packages/ui/assets/tecton/', import.meta.url));
// MUI's CommonJS build under another name: a second, independent copy of MUI for the modal-layer
// scenario (its own ModalManager and FocusTrap, as a micro-frontend that bundles its own MUI).
const secondMuiCopy = realpathSync(
  fileURLToPath(new URL('../../../packages/ui/node_modules/@mui/material', import.meta.url)),
).replaceAll('\\', '/');
export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['@tecton-mui/source', ...defaultClientConditions],
    alias: [
      {
        find: /^@tecton-mui\/ui\/styles\/(tokens|fonts|icons)\.css$/,
        replacement: `${assets}$1.css`,
      },
      { find: /^mui-second-copy\/(.+)$/, replacement: `${secondMuiCopy}/$1/index.js` },
    ],
  },
  optimizeDeps: {
    include: ['mui-second-copy/Dialog', 'mui-second-copy/Button', 'mui-second-copy/styles'],
  },
  // /ssr renders on the server (server.mjs). Bundle @tecton-mui/ui through Vite there too, so the
  // source condition applies: left external, Node resolves it to dist/, which needs a UI build
  // (CI runs the browser tests without one, and the page then fails with a 500).
  ssr: {
    noExternal: ['@tecton-mui/ui'],
    resolve: { conditions: ['@tecton-mui/source', ...defaultServerConditions] },
  },
});
