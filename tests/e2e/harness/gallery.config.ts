// Single-file gallery build: every asset (JS, CSS, fonts) is inlined so the page can be shared as
// one HTML file. `node scripts/inline-gallery.mjs` produces dist-gallery/gallery.single.html.
import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.js';

export default mergeConfig(
  base,
  defineConfig({
    build: {
      outDir: 'dist-gallery',
      emptyOutDir: true,
      assetsInlineLimit: () => true,
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: { input: 'gallery.html', output: { inlineDynamicImports: true } },
    },
  }),
);
