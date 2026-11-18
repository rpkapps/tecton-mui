// Inlines the gallery build's script and stylesheet into one HTML file.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist-gallery');
let html = readFileSync(join(dist, 'gallery.html'), 'utf8');
html = html.replace(/<script type="module" crossorigin src="\/([^"]+)"><\/script>/g, (_, src) => {
  const code = readFileSync(join(dist, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${code}</script>`;
});
html = html.replace(
  /<link rel="stylesheet" crossorigin href="\/([^"]+)">/g,
  (_, href) => `<style>${readFileSync(join(dist, href), 'utf8')}</style>`,
);
if (/src="\/assets|href="\/assets/.test(html))
  throw new Error('Gallery still references external assets');
writeFileSync(join(dist, 'gallery.single.html'), html);
console.log(`gallery.single.html: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
