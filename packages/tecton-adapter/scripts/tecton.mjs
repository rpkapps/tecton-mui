#!/usr/bin/env node
// Tecton adapter CLI.
//   sync   download pinned artifacts into vendor/<version>/ (needs network), then emit
//   emit   normalize vendored artifacts and write them into packages/ui (offline)
//   check  verify vendor checksums and that packages/ui generated files are up to date (CI)
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncUmd, loadUmd } from '../src/source-umd/index.mjs';
import { loadNpm } from '../src/source-npm/index.mjs';
import { normalize } from '../src/normalized/normalize.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uiRoot = resolve(root, '../ui');
const generatedDir = join(uiRoot, 'src/styles/tecton/generated');
const assetsDir = join(uiRoot, 'assets/tecton');
const config = JSON.parse(await readFile(join(root, 'tecton.config.json'), 'utf8'));
const vendorDir = join(root, 'vendor', config.version);

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
// Path relative to packages/ui with `/` separators, so GENERATED.json is the same on every platform.
const uiPath = (file) => relative(uiRoot, file).split(sep).join('/');

async function loadSource() {
  if (config.source === 'umd') return loadUmd({ config, vendorDir });
  if (config.source === 'npm') return loadNpm({ config });
  throw new Error(`Unknown Tecton source "${config.source}"`);
}

function outputs(theme) {
  const out = new Map();
  for (const [p, c] of Object.entries(theme.modules)) out.set(join(generatedDir, p), c);
  for (const [p, c] of Object.entries(theme.assets)) out.set(join(assetsDir, p), c);
  const index = {};
  for (const [file, content] of out) index[uiPath(file)] = sha256(Buffer.from(content));
  out.set(
    join(generatedDir, 'GENERATED.json'),
    JSON.stringify({ version: theme.version, files: index }, null, 2) + '\n',
  );
  return out;
}

async function emit() {
  const theme = normalize(await loadSource());
  await rm(generatedDir, { recursive: true, force: true });
  await rm(assetsDir, { recursive: true, force: true });
  for (const [file, content] of outputs(theme)) {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  console.log(
    `Emitted Tecton ${theme.version}: ${Object.keys(theme.modules).length} modules, ` +
      `${theme.tokenNames.length} tokens, ${theme.icons.length} icons.`,
  );
}

async function check() {
  const theme = normalize(await loadSource());
  const stale = [];
  for (const [file, content] of outputs(theme)) {
    if (!existsSync(file) || !Buffer.from(content).equals(await readFile(file))) {
      stale.push(uiPath(file));
    }
  }
  if (stale.length) {
    console.error(`Generated Tecton output is stale or edited by hand:\n  ${stale.join('\n  ')}`);
    console.error('Run `pnpm --filter @tecton-mui/tecton-adapter emit` and commit the result.');
    process.exit(1);
  }
  console.log(`Tecton ${theme.version} vendor checksums and generated output verified.`);
}

const cmd = process.argv[2];
if (cmd === 'sync') {
  const manifest = await syncUmd({ config, vendorDir });
  console.log(
    `Downloaded ${Object.keys(manifest.files).length} Tecton ${config.version} artifacts.`,
  );
  await emit();
} else if (cmd === 'emit') {
  await emit();
} else if (cmd === 'check') {
  await check();
} else {
  console.error('Usage: tecton.mjs <sync|emit|check>');
  process.exit(2);
}
