#!/usr/bin/env node
// Manual, reviewable documentation sync from upstream MUI docs (SPEC §8.5).
//   pnpm docs:sync --check                      validate the manifest (CI)
//   pnpm docs:sync --packages @mui/material     fetch included/modified pages for the *installed*
//                                               (pinned) version into apps/docs/src/content/upstream
// The result is a working-tree diff to review in a PR; nothing is merged automatically.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(readFileSync(join(repo, 'tooling/docs-sync/manifest.json'), 'utf8'));
const outDir = join(repo, 'apps/docs/src/content/upstream');
const STATUSES = new Set(['included', 'modified', 'excluded']);
const COMMERCIAL =
  /data-grid\/(row-grouping|aggregation|pivoting|tree-data|master-detail|clipboard|cell-selection|row-pinning|column-pinning|server-side-data)|date-range|time-range|date-time-range|rich-tree-view\/(ordering|lazy-loading)/;

function check() {
  const errors = [];
  for (const [i, page] of manifest.pages.entries()) {
    const where = `pages[${i}] (${page.source})`;
    if (!manifest.upstream[page.package]) errors.push(`${where}: unknown package ${page.package}`);
    if (!STATUSES.has(page.status)) errors.push(`${where}: invalid status ${page.status}`);
    if (page.status === 'excluded' && !page.reason)
      errors.push(`${where}: excluded pages need a reason`);
    if (page.status !== 'excluded') {
      if (!page.target) errors.push(`${where}: included/modified pages need a target`);
      if (COMMERCIAL.test(page.source))
        errors.push(`${where}: commercial MUI X documentation cannot be included`);
      if (page.status === 'modified' && !page.patch)
        errors.push(`${where}: modified pages need a patch file`);
    }
  }
  return errors;
}

async function sync(packages) {
  const require = createRequire(join(repo, 'packages/ui/package.json'));
  for (const name of packages) {
    const upstream = manifest.upstream[name];
    if (!upstream) throw new Error(`No upstream configured for ${name}`);
    const version = JSON.parse(
      readFileSync(require.resolve(`${name}/package.json`), 'utf8'),
    ).version;
    const pages = manifest.pages.filter((p) => p.package === name && p.status !== 'excluded');
    console.log(`${name}@${version}: ${pages.length} page(s) to sync`);
    for (const page of pages) {
      const url = `https://raw.githubusercontent.com/${upstream.repo}/${upstream.tagPrefix}${version}/${page.source}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
      let text = await res.text();
      text = text.replaceAll(
        /from '@mui\/(material|lab)(\/[\w-]+)?'/g,
        (_, __, sub) => `from '@tecton-mui/ui${sub ?? ''}'`,
      );
      const header = `{/* Synced from ${upstream.repo}@${upstream.tagPrefix}${version}:${page.source} (${upstream.license}). Copyright (c) Material-UI SAS and contributors. Status: ${page.status}. */}\n`;
      const target = join(outDir, page.target);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, header + text);
      if (page.status === 'modified' && existsSync(join(repo, page.patch))) {
        console.log(`  apply local modifications from ${page.patch} and review the diff`);
      }
      console.log(`  wrote ${page.target}`);
    }
  }
  console.log('Review `git diff`, build the docs, run link/license checks, and open a PR.');
}

const args = process.argv.slice(2);
const errors = check();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
if (args.includes('--check')) {
  console.log(`Docs sync manifest OK (${manifest.pages.length} pages).`);
} else {
  const i = args.indexOf('--packages');
  if (i < 0) {
    console.error('Usage: docs:sync --check | --packages @mui/material[,@mui/lab]');
    process.exit(2);
  }
  await sync(args[i + 1].split(','));
}
