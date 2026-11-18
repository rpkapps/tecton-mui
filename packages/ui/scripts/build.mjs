#!/usr/bin/env node
// Builds @tecton-mui/ui: per-file ESM + declarations via tsc (preserves modules for tree shaking),
// then copies the Tecton CSS/font assets and composes the documented stylesheet entry points.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const assets = join(root, 'assets/tecton');
const require = createRequire(import.meta.url);

rmSync(dist, { recursive: true, force: true });
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), '-p', join(root, 'tsconfig.build.json')],
  {
    stdio: 'inherit',
  },
);

const stylesOut = join(dist, 'styles');
mkdirSync(stylesOut, { recursive: true });
for (const file of ['tokens.css', 'fonts.css', 'icons.css'])
  cpSync(join(assets, file), join(stylesOut, file));
cpSync(join(assets, 'assets'), join(stylesOut, 'assets'), { recursive: true });

const provenance = JSON.parse(readFileSync(join(assets, 'provenance.json'), 'utf8'));
const read = (f) => readFileSync(join(assets, f), 'utf8');
writeFileSync(
  join(stylesOut, 'global.css'),
  `/* @tecton-mui/ui global styles (Tecton ${provenance.version}): fonts, icons and design tokens.\n` +
    ` * Load ONCE per page, in the shell or standalone host. Hosted MFEs must not import this file. */\n` +
    [read('fonts.css'), read('icons.css'), read('tokens.css')].join('\n'),
);
writeFileSync(
  join(stylesOut, 'components.css'),
  `/* @tecton-mui/ui component styles for hosted MFEs.\n` +
    ` * Component styles are rendered by Emotion at runtime; Tecton ${provenance.version} ships no static\n` +
    ` * component CSS, so this entry point is intentionally empty and contains no globals, resets or\n` +
    ` * custom-property declarations. It is kept as a stable import for future static styles. */\n`,
);

const notices = join(root, 'THIRD_PARTY_NOTICES.md');
if (!existsSync(notices)) throw new Error('THIRD_PARTY_NOTICES.md missing');
console.log('Built @tecton-mui/ui');
