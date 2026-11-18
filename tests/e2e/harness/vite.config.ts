import { defineConfig, defaultClientConditions } from 'vite';
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
});
