#!/usr/bin/env node
// Manual, reviewable documentation sync from the MIT-licensed Material UI docs (SPEC §8.4–8.5).
// See repo-docs/documentation-sync.md.
//
//   pnpm docs:sync --check                          validate the manifest, the slug map and that the
//                                                   generated files match the lock (offline; CI)
//   pnpm docs:sync --packages @mui/material,@mui/lab
//                                                   fetch the pages for the *installed* versions,
//                                                   transform them and rewrite
//                                                   apps/docs/src/mui-docs/generated/
//   options: --offline  use only the local fetch cache   --refresh  ignore the cache
//
// The result is a working-tree diff to review in a PR; nothing is committed or merged automatically.
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Upstream, mapLimit } from './lib/upstream.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const toolDir = join(repo, 'tooling/docs-sync');
const docsDir = join(repo, 'apps/docs');
const genDir = join(docsDir, 'src/mui-docs/generated');
const lockPath = join(toolDir, 'sync-lock.json');
const cacheDir = join(repo, 'node_modules/.cache/tecton-docs-sync');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = readJson(join(toolDir, 'manifest.json'));
const slugMap = readJson(join(toolDir, 'slug-map.json'));
const iconMap = readJson(join(toolDir, 'icon-map.json'));
const rel = (p) => relative(repo, p).split(sep).join('/');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

const STATUSES = new Set(['included', 'modified', 'excluded']);
const COMMERCIAL =
  /data-grid\/(row-grouping|aggregation|pivoting|tree-data|master-detail|clipboard|cell-selection|row-pinning|column-pinning|server-side-data)|date-range|time-range|date-time-range|rich-tree-view\/(ordering|lazy-loading)/;
const RESERVED_IDENTS = new Set([
  'Attribution',
  'Callout',
  'CodeBlock',
  'Demo',
  'ExcludedDemo',
  'Heading',
  'M',
  'MuiDocs',
  'MuiDocsContent',
  'defineDemo',
  'demos',
]);
const MUI_COMPONENTS_DIR = 'docs/data/material/components/';
const pageIdOf = (source) => source.slice(MUI_COMPONENTS_DIR.length).split('/')[0];

// ---------------------------------------------------------------------------------------------
// Portal facts (offline): component slugs and authored heading anchors.

function toSlug(name) {
  return name
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function toAnchor(value) {
  return value
    .toLowerCase()
    .replace(/[`'"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Slugs of /components/<slug> pages: authored catalog pages plus one per exported component. */
function portalSlugs() {
  const catalog = readFileSync(join(docsDir, 'src/data/catalog.ts'), 'utf8');
  // Mirrors src/data/catalog.ts: authored pages, plus an "auto" page for every exported component
  // that no authored page lists in its `components`.
  const authoredBlock = catalog.slice(catalog.indexOf('export const authoredPages'));
  const authored = [
    ...authoredBlock.matchAll(/slug: '([\w-]+)',[\s\S]*?components: \[([\s\S]*?)\]/g),
  ];
  const authoredSlugs = authored.map((m) => m[1]);
  const covered = new Set(authored.flatMap((m) => [...m[2].matchAll(/'(\w+)'/g)].map((n) => n[1])));
  const inventory = readJson(join(repo, 'tooling/compatibility/export-inventory.json'));
  const components = inventory.subpaths.filter((s) => /^[A-Z]/.test(s));
  const auto = components.filter((c) => !covered.has(c)).map(toSlug);
  return { all: new Set([...authoredSlugs, ...auto]), api: new Set(components.map(toSlug)) };
}

function authoredAnchors(slug) {
  const file = join(docsDir, 'src/content/components', `${slug}.mdx`);
  if (!existsSync(file)) return [];
  return [...readFileSync(file, 'utf8').matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => toAnchor(m[1]));
}

// ---------------------------------------------------------------------------------------------
// --check

function checkManifest() {
  const errors = [];
  const slugs = portalSlugs().all;
  const seen = new Set();
  for (const [i, page] of manifest.pages.entries()) {
    const where = `pages[${i}] (${page.source})`;
    if (seen.has(page.source)) errors.push(`${where}: listed twice`);
    seen.add(page.source);
    if (!manifest.upstream[page.package]) errors.push(`${where}: unknown package ${page.package}`);
    if (!STATUSES.has(page.status)) errors.push(`${where}: invalid status ${page.status}`);
    if (page.status === 'excluded' && !page.reason)
      errors.push(`${where}: excluded pages need a reason`);
    if (page.status !== 'excluded') {
      if (!page.target) errors.push(`${where}: included/modified pages need a target`);
      if (COMMERCIAL.test(page.source))
        errors.push(`${where}: commercial MUI X documentation cannot be included`);
      if (manifest.upstream[page.package]?.repo !== 'mui/material-ui')
        errors.push(`${where}: only the MIT-licensed mui/material-ui documentation can be synced`);
      if (
        page.status === 'modified' &&
        !page.patch &&
        !page.edits?.length &&
        !Object.keys(page.droppedSections ?? {}).length
      )
        errors.push(
          `${where}: modified pages need a patch file, declarative edits or dropped sections`,
        );
      if (page.status === 'included' && (page.edits || page.droppedSections))
        errors.push(`${where}: pages with edits or dropped sections must be "modified"`);
      for (const edit of page.edits ?? [])
        if (!edit.find || edit.replace === undefined || !edit.reason)
          errors.push(`${where}: each edit needs find, replace and reason`);
      for (const [heading, reason] of Object.entries(page.droppedSections ?? {}))
        if (!reason) errors.push(`${where}: dropped section "${heading}" needs a reason`);
      if (page.target && !slugMap.pages[page.target])
        errors.push(`${where}: no entry for "${page.target}" in slug-map.json`);
      for (const [demo, reason] of Object.entries(page.excludedDemos ?? {}))
        if (!reason) errors.push(`${where}: excluded demo ${demo} needs a reason`);
      for (const [demo, edits] of Object.entries(page.demoEdits ?? {}))
        for (const edit of edits)
          if (!edit.find || edit.replace === undefined || !edit.reason)
            errors.push(`${where}: each edit of demo ${demo} needs find, replace and reason`);
    }
  }
  const targets = new Set(
    manifest.pages.filter((p) => p.status !== 'excluded').map((p) => p.target),
  );
  for (const [pageId, entries] of Object.entries(slugMap.pages)) {
    if (!targets.has(pageId)) errors.push(`slug-map.json: "${pageId}" is not an included page`);
    for (const entry of entries)
      if (!slugs.has(entry.slug))
        errors.push(`slug-map.json: "${pageId}" maps to unknown portal slug "${entry.slug}"`);
  }
  return [...errors, ...checkIconMap()];
}

/** icon-map.json: Tecton monochrome icons only; `filled` and `notes` name mapped icons. */
function checkIconMap() {
  const errors = [];
  const tectonIcons = readFileSync(
    join(repo, 'packages/ui/src/styles/tecton/generated/icons.ts'),
    'utf8',
  );
  const monochrome = new Set(
    [
      ...tectonIcons
        .slice(0, tectonIcons.indexOf('TectonMulticolorIconName'))
        .matchAll(/\| '([\w-]+)'/g),
    ].map((m) => m[1]),
  );
  for (const [name, tecton] of Object.entries(iconMap.icons))
    if (!monochrome.has(tecton))
      errors.push(`icon-map.json: ${name} -> "${tecton}" is not a Tecton monochrome icon`);
  for (const name of iconMap.filled)
    if (!iconMap.icons[name]) errors.push(`icon-map.json: filled icon ${name} has no mapping`);
  for (const [name, reason] of Object.entries(iconMap.notes)) {
    if (!iconMap.icons[name]) errors.push(`icon-map.json: note for ${name}, which has no mapping`);
    if (!reason) errors.push(`icon-map.json: the note for ${name} needs a reason`);
  }
  return errors;
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

function checkGenerated() {
  const errors = [];
  if (!existsSync(lockPath))
    return ['sync-lock.json is missing: run `pnpm docs:sync --packages ...`'];
  const lock = readJson(lockPath);
  const require = createRequire(join(repo, 'packages/ui/package.json'));
  for (const [name, version] of Object.entries(lock.versions)) {
    const installed = readJson(require.resolve(`${name}/package.json`)).version;
    if (installed !== version)
      errors.push(
        `${name} is ${installed} but the synced docs are for ${version}: run \`pnpm docs:sync --packages @mui/material,@mui/lab\``,
      );
  }
  const actual = new Set(listFiles(genDir).map(rel));
  for (const [file, hash] of Object.entries(lock.files)) {
    if (!actual.has(file)) errors.push(`${file}: missing (listed in sync-lock.json)`);
    else if (sha256(readFileSync(join(repo, file), 'utf8')) !== hash)
      errors.push(`${file}: changed by hand (generated files must only be written by docs:sync)`);
    actual.delete(file);
  }
  for (const file of actual)
    errors.push(`${file}: not produced by docs:sync (remove it or re-sync)`);
  const synced = new Set(lock.pages.map((p) => p.source));
  for (const page of manifest.pages) {
    if (page.status === 'excluded' || manifest.upstream[page.package]?.repo !== 'mui/material-ui')
      continue;
    if (!synced.has(page.source)) errors.push(`${page.source}: in the manifest but not synced`);
  }
  for (const page of lock.pages) {
    const entry = manifest.pages.find((p) => p.source === page.source);
    if (!entry || entry.status === 'excluded')
      errors.push(`${page.source}: synced but not included in the manifest`);
    for (const demo of Object.keys(entry?.excludedDemos ?? {}))
      if (!page.demos.some((d) => d.name === demo))
        errors.push(`${page.source}: excludedDemos lists unknown demo ${demo}`);
    for (const demo of Object.keys(entry?.demoEdits ?? {}))
      if (!page.demos.some((d) => d.name === demo && d.status === 'included'))
        errors.push(`${page.source}: demoEdits lists unknown or excluded demo ${demo}`);
  }
  return errors;
}

// ---------------------------------------------------------------------------------------------
// Sync

async function sync(packages) {
  const { loadParsers } = await import('./lib/deps.mjs');
  const { parsePage, mdText } = await import('./lib/markdown.mjs');
  const { createEmitter, upstreamHash, str } = await import('./lib/emit.mjs');
  const { readUiSurface, transformDemo } = await import('./lib/demos.mjs');
  const { tectonIcon } = await import('./lib/icons.mjs');
  const { tectonColors } = await import('./lib/colors.mjs');
  const parsers = await loadParsers(repo);
  const surface = readUiSurface(repo);
  const prettier = await import('prettier');
  const prettierConfig = (await prettier.resolveConfig(join(docsDir, 'src/index.tsx'))) ?? {};
  const args = process.argv.slice(2);

  // Versions: Material UI and Lab docs both live in mui/material-ui at the @mui/material tag.
  const require = createRequire(join(repo, 'packages/ui/package.json'));
  const versions = {};
  for (const name of packages) {
    const config = manifest.upstream[name];
    if (!config) throw new Error(`No upstream configured for ${name}`);
    if (config.repo !== 'mui/material-ui')
      throw new Error(`${name}: only mui/material-ui documentation (MIT) can be synced`);
    versions[name] = readJson(require.resolve(`${name}/package.json`)).version;
  }
  if (!versions['@mui/material'] || !versions['@mui/lab'])
    throw new Error(
      'Material UI and Lab pages share one upstream tag: pass --packages @mui/material,@mui/lab',
    );
  const version = versions['@mui/material'];
  const config = manifest.upstream['@mui/material'];
  const upstream = new Upstream({
    repo: config.repo,
    ref: `${config.tagPrefix}${version}`,
    cacheDir,
    offline: args.includes('--offline'),
    refresh: args.includes('--refresh'),
  });
  const tag = `${config.repo}@${upstream.ref}`;
  const blob = (path) => `https://github.com/${config.repo}/blob/${upstream.ref}/${path}`;
  console.log(`Syncing Material UI documentation from ${tag} (${config.license})`);

  // 1. Discover the component pages from the upstream navigation (docs/data/material/pages.ts).
  const pagesTs = await upstream.require('docs/data/material/pages.ts');
  const componentsGroup = pagesTs.slice(
    pagesTs.indexOf("title: 'Components'"),
    pagesTs.indexOf("title: 'Component API'"),
  );
  const pathnames = [...componentsGroup.matchAll(/pathname: '\/material-ui\/([\w-]+)'/g)]
    .map((m) => m[1])
    .filter((p) => !['all-components', 'components'].includes(p) && !p.startsWith('components/'));
  const pageIdByPath = new Map();
  const pathByPageId = new Map();
  await mapLimit(pathnames, 8, async (p) => {
    const mod = await upstream.read(`docs/pages/material-ui/${p}.js`);
    if (!mod) return;
    for (const m of mod.matchAll(
      /'(docs\/data\/material\/components\/[^?']+\.md)\?muiMarkdown'/g,
    )) {
      const id = pageIdOf(m[1]);
      pageIdByPath.set(p, id);
      pathByPageId.set(id, p);
    }
  });
  const upstreamSources = new Set(
    [...pathByPageId.keys()].map((id) => `${MUI_COMPONENTS_DIR}${id}/${id}.md`),
  );
  const manifestSources = new Set(manifest.pages.map((p) => p.source));
  const unlisted = [...upstreamSources].filter((s) => !manifestSources.has(s));
  if (unlisted.length)
    throw new Error(
      `Upstream component pages missing from manifest.json (add them as included or excluded):\n  ${unlisted.join('\n  ')}`,
    );
  for (const page of manifest.pages)
    if (page.source.startsWith(MUI_COMPONENTS_DIR) && !upstreamSources.has(page.source))
      console.warn(`  warning: ${page.source} is no longer listed upstream`);

  // Sections about third-party projects are not part of this library's documentation, and a page
  // can drop sections that do not apply to this library (manifest `droppedSections`, each heading
  // must match exactly once): each is removed with its heading and everything up to the next
  // heading of the same or a higher level.
  const DROPPED_SECTIONS = /^supplementary projects$/i;
  const dropSections = (markdown, entry) => {
    const named = new Map(Object.keys(entry.droppedSections ?? {}).map((h) => [h, 0]));
    const out = [];
    let skipLevel = 0;
    let inFence = false;
    for (const line of markdown.split('\n')) {
      if (/^\s*```/.test(line)) inFence = !inFence;
      const heading = inFence ? null : /^(#{1,6})\s+(.*?)\s*$/.exec(line);
      if (heading) {
        const level = heading[1].length;
        if (skipLevel && level <= skipLevel) skipLevel = 0;
        if (!skipLevel && (DROPPED_SECTIONS.test(heading[2]) || named.has(heading[2]))) {
          if (named.has(heading[2])) named.set(heading[2], named.get(heading[2]) + 1);
          skipLevel = level;
          continue;
        }
      }
      if (!skipLevel) out.push(line);
    }
    for (const [name, count] of named)
      if (count !== 1)
        throw new Error(
          `${entry.source}: dropped section "${name}" matched ${count} headings (must be exactly once)`,
        );
    return out.join('\n');
  };

  // 2. Parse the included pages and adapt their demos.
  const pages = manifest.pages.filter(
    (p) => p.status !== 'excluded' && manifest.upstream[p.package].repo === config.repo,
  );
  const icons = new Set();
  const unmappedIcons = new Map(); // @mui/icons-material name -> demos that use it
  const files = new Map(); // generated path (relative to genDir) -> content
  const parsed = await mapLimit(pages, 4, async (entry) => {
    const id = entry.target;
    let text = await upstream.require(entry.source);
    for (const edit of entry.edits ?? []) {
      const count = text.split(edit.find).length - 1;
      if (count !== 1)
        throw new Error(
          `${entry.source}: edit "${edit.find}" matched ${count} times (must be exactly once)`,
        );
      text = text.replace(edit.find, edit.replace);
    }
    text = dropSections(text, entry);
    const page = parsePage(text, parsers);
    const dir = entry.source.slice(0, entry.source.lastIndexOf('/'));
    const demoBlocks = [];
    const collect = (blocks) =>
      blocks.forEach((b) =>
        b.type === 'demo' ? demoBlocks.push(b) : b.blocks && collect(b.blocks),
      );
    collect(page.blocks);
    const demos = new Map();
    for (const block of demoBlocks) {
      if (demos.has(block.name)) continue;
      demos.set(block.name, await adaptDemo(block.name, dir, id, entry));
    }
    return { entry, id, page, demos };
  });
  // Every icon the demos use needs a reviewed Tecton icon: the rewritten code is what readers copy.
  if (unmappedIcons.size)
    throw new Error(
      `@mui/icons-material icons without a Tecton icon in tooling/docs-sync/icon-map.json (add them to "icons", with a reason in "notes" when the icon is only a stand-in):\n  ${[
        ...unmappedIcons,
      ]
        .map(([icon, demos]) => `${icon} (${demos.join(', ')})`)
        .join('\n  ')}`,
    );

  async function adaptDemo(name, dir, id, entry) {
    const manual = entry.excludedDemos?.[name];
    const tsx = await upstream.read(`${dir}/${name}.tsx`);
    if (tsx === null) {
      const js = await upstream.read(`${dir}/${name}.js`);
      if (js === null) throw new Error(`Demo not found upstream: ${dir}/${name}`);
      return { name, status: 'excluded', reason: 'upstream provides only a JavaScript source' };
    }
    const pending = new Map();
    const visit = async (fileName, source) => {
      const result = transformDemo(source, { ts: parsers.ts, surface, iconMap, fileName });
      if (result.status !== 'included') return result;
      pending.set(fileName, result);
      for (const dep of result.deps) {
        const base = join(dirname(fileName), dep).split(sep).join('/');
        if ([...pending.keys()].some((k) => k.replace(/\.tsx?$/, '') === base)) continue;
        let found = null;
        for (const ext of ['.ts', '.tsx']) {
          const text = await upstream.read(`${dir}/${base}${ext}`);
          if (text !== null) {
            found = await visit(`${base}${ext}`, text);
            break;
          }
        }
        if (found === null)
          return {
            status: 'excluded',
            reason: `imports \`${dep}\`, which has no TypeScript source upstream`,
          };
        if (found.status === 'excluded')
          return { status: 'excluded', reason: `${dep}: ${found.reason}` };
        if (found.status !== 'included') return found;
      }
      return result;
    };
    const result = await visit(`${name}.tsx`, tsx);
    if (result.status === 'excluded') return { name, ...result };
    if (manual) return { name, status: 'excluded', reason: manual, manual: true };
    if (result.status === 'unmapped') {
      for (const icon of result.icons)
        unmappedIcons.set(icon, [...(unmappedIcons.get(icon) ?? []), `${dir}/${name}`]);
      return { name, status: 'excluded', reason: 'unmapped icons' };
    }
    const notes = new Set();
    for (const [fileName, r] of pending) {
      r.icons.forEach((i) => icons.add(i));
      r.notes.forEach((n) => notes.add(n));
      const source = `${dir}/${fileName}`;
      // Declared code edits of the demo's main file (manifest `demoEdits`): each must match once.
      let code = r.code;
      if (fileName === `${name}.tsx`)
        for (const edit of entry.demoEdits?.[name] ?? []) {
          const count = code.split(edit.find).length - 1;
          if (count !== 1)
            throw new Error(`${source}: demo edit matched ${count} times: ${edit.find}`);
          code = code.replace(edit.find, edit.replace);
        }
      // Hard-coded colors left after the edits become Tecton color tokens (lib/colors.mjs).
      const colors = tectonColors(code, { overrides: entry.demoColors?.[name] ?? {} });
      code = colors.code;
      if (colors.count) notes.add('hard-coded colors mapped to Tecton color tokens');
      const header =
        `/* Synced from ${tag}:${source} (MIT License, © Call-Em-All / Material-UI SAS and contributors).\n` +
        ` * Generated by \`pnpm docs:sync\` (tooling/docs-sync): do not edit. */\n`;
      files.set(`demos/${id}/${fileName}`, header + code);
    }
    return { name, status: 'included', notes: [...notes], custom: /\bcreateTheme\(/.test(tsx) };
  }

  // 3. Lay out each portal slug: which pages and sections it renders, and the anchors it gets.
  const bySlug = new Map();
  for (const [pageId, entries] of Object.entries(slugMap.pages)) {
    for (const entry of entries) {
      const list = bySlug.get(entry.slug) ?? [];
      list.push({ pageId, sections: entry.sections ?? null });
      bySlug.set(entry.slug, list);
    }
  }
  const pageById = new Map(parsed.map((p) => [p.id, p]));
  const headingText = (b) => mdText({ children: b.children });

  /** Splits blocks into the intro (before the first h2) and h2 sections. */
  function splitSections(blocks) {
    const intro = [];
    const sections = [];
    for (const block of blocks) {
      if (block.type === 'heading' && block.depth === 2) {
        sections.push({ hash: upstreamHash(headingText(block)), heading: block, blocks: [] });
      } else (sections.at(-1)?.blocks ?? intro).push(block);
    }
    return { intro, sections };
  }

  const layouts = new Map(); // slug -> [{ pageId, title, ... parts }]
  const anchorIndex = new Map(); // `${pageId}#${upstreamHash}` -> [{ slug, id }]
  for (const [slug, list] of bySlug) {
    const used = new Set([...authoredAnchors(slug), 'import', 'api', 'examples']);
    const unique = (base, pageId) => {
      let id = base || 'section';
      if (used.has(id)) id = `${pageId}-${id}`;
      for (let n = 2; used.has(id); n += 1) id = `${pageId}-${base}-${n}`;
      used.add(id);
      return id;
    };
    const parts = [];
    list.forEach(({ pageId, sections }, index) => {
      const p = pageById.get(pageId);
      if (!p) throw new Error(`slug-map.json: page "${pageId}" is not synced`);
      const { intro, sections: all } = splitSections(p.page.blocks);
      let chosen = all;
      if (sections) {
        chosen = sections.map((hash) => {
          const s = all.find((x) => x.hash === hash);
          if (!s)
            throw new Error(
              `slug-map.json: ${pageId} has no section "${hash}" (${all.map((x) => x.hash).join(', ')})`,
            );
          return s;
        });
      }
      const secondary = index > 0 && !sections;
      const shift = secondary ? 2 : 1; // h2 -> h3 (h4 for a secondary page under its own h3)
      const ids = new Map();
      const register = (hash, id) => {
        const key = `${pageId}#${hash}`;
        anchorIndex.set(key, [...(anchorIndex.get(key) ?? []), { slug, id }]);
      };
      const titleId = secondary ? unique(toAnchor(p.page.title), pageId) : null;
      const blocksWithIds = (blocks) =>
        blocks.map((b) => {
          if (b.type !== 'heading') return b;
          const text = headingText(b);
          const id = unique(toAnchor(text), pageId);
          register(upstreamHash(text), id);
          return { ...b, id, level: Math.min(4, b.depth + shift) };
        });
      const out = {
        pageId,
        secondary,
        titleId,
        title: p.page.title,
        description: null,
        intro: [],
        sections: [],
      };
      if (!sections) {
        out.description = p.page.description;
        out.intro = blocksWithIds(intro);
      }
      for (const s of chosen) {
        const [heading, ...rest] = blocksWithIds([s.heading, ...s.blocks]);
        out.sections.push({ heading, blocks: rest });
        ids.set(s.hash, heading.id);
      }
      parts.push(out);
    });
    layouts.set(slug, parts);
  }

  // 4. Links: upstream routes -> portal routes when the target is synced, else mui.com.
  const { api: apiSlugs } = portalSlugs();
  const primarySlug = (pageId) => slugMap.pages[pageId]?.[0]?.slug;
  function resolveLink(href, pageId, slug) {
    if (!href || /^(https?:|mailto:)/.test(href)) return href;
    if (href.startsWith('/static/')) return `https://mui.com${href}`;
    if (href.startsWith('#'))
      return resolveRoute(`/material-ui/${pathByPageId.get(pageId)}/`, href.slice(1), slug);
    const [path, hash = ''] = href.split('#');
    return resolveRoute(path, hash, slug);
  }
  function resolveRoute(path, hash, fromSlug) {
    const external = `https://mui.com${path}${hash ? `#${hash}` : ''}`;
    for (const [prefix, route] of Object.entries(slugMap.externalRoutes ?? {}))
      if (path === prefix) return route;
    let m;
    if ((m = /^\/material-ui\/api\/([\w-]+)\/?$/.exec(path)))
      return apiSlugs.has(m[1]) ? `/api/${m[1]}` : external;
    if ((m = /^\/material-ui\/([\w-]+)\/?$/.exec(path))) {
      const pageId = pageIdByPath.get(m[1]);
      if (!pageId || !layouts.size || !primarySlug(pageId)) return external;
      if (hash) {
        const targets = anchorIndex.get(`${pageId}#${hash}`) ?? [];
        const target = targets.find((t) => t.slug === fromSlug) ?? targets[0];
        if (target) return `/components/${target.slug}#${target.id}`;
      }
      return `/components/${primarySlug(pageId)}`;
    }
    return external;
  }

  // 5. Emit one module per portal slug.
  const CUSTOMIZATION_NOTE =
    'These examples restyle the component beyond the Tecton defaults to show the customization APIs (sx, styled and theme overrides). Product UIs should keep the Tecton theme styling.';
  const lockPages = parsed.map(({ entry, id, demos }) => ({
    source: entry.source,
    status: entry.status,
    target: id,
    slugs: (slugMap.pages[id] ?? []).map(
      (e) => e.slug + (e.sections ? `#${e.sections.join(',')}` : ''),
    ),
    demos: [...demos.values()].map((d) =>
      d.status === 'included'
        ? {
            name: d.name,
            status: 'included',
            ...(d.notes.length ? { notes: d.notes } : {}),
            ...(d.custom ? { customTheme: true } : {}),
          }
        : { name: d.name, status: 'excluded', reason: d.reason },
    ),
  }));
  const header = (sources) =>
    `/* AUTO-GENERATED by tooling/docs-sync/sync.mjs from ${tag} (MIT License,\n` +
    ` * © Call-Em-All / Material-UI SAS and contributors): ${sources.join(', ')}.\n` +
    ' * Do not edit: change the manifest or the sync and run `pnpm docs:sync`. */\n';

  for (const [slug, parts] of layouts) {
    const warnings = [];
    const demoImports = [];
    const demoEntries = [];
    const demoKeys = new Map();
    const usedKeys = new Set();
    const sources = [];
    const body = [];
    for (const part of parts) {
      const p = pageById.get(part.pageId);
      sources.push(p.entry.source);
      const definitions = new Map();
      const walkDefs = (blocks) =>
        blocks.forEach((b) =>
          b.type === 'definition'
            ? definitions.set(b.node.identifier, b.node)
            : b.blocks && walkDefs(b.blocks),
        );
      walkDefs(p.page.blocks);
      const emitter = createEmitter({
        resolveLink: (href) => resolveLink(href, part.pageId, slug),
        parseHtmlFragment: parsers.parseHtmlFragment,
        definitions,
        warnings,
      });
      const demoKey = (name) => {
        const k = `${part.pageId}/${name}`;
        if (!demoKeys.has(k)) {
          const key = usedKeys.has(name) ? `${part.pageId}-${name}` : name;
          usedKeys.add(key);
          demoKeys.set(k, key);
          const demo = p.demos.get(name);
          if (demo.status === 'included') {
            const safe = key.replace(/[^\w]/g, '_');
            const ident = RESERVED_IDENTS.has(safe) ? `Demo_${safe}` : safe;
            demoImports.push(
              `import ${ident} from '../demos/${part.pageId}/${name}';`,
              `import ${ident}Source from '../demos/${part.pageId}/${name}.tsx?raw';`,
            );
            demoEntries.push({ key, ident, block: null });
          }
        }
        return demoKeys.get(k);
      };
      const blocks = (list) => list.map(block).join('\n');
      const block = (b) => {
        switch (b.type) {
          case 'heading': {
            const out = `<Heading level={${b.level}} id=${str(b.id)}>${emitter.inline(b.children)}</Heading>`;
            return /^customization$/i.test(mdText({ children: b.children })) && b.depth === 2
              ? `${out}\n<Callout severity="info">{${str(CUSTOMIZATION_NOTE)}}</Callout>`
              : out;
          }
          case 'node':
            return emitter.block(b.node);
          case 'definition':
            return '';
          case 'callout':
            return `<Callout severity=${str(b.severity)}>${blocks(b.blocks)}</Callout>`;
          case 'code':
            return b.codes.map((c) => emitter.codeBlock(c.value, c.lang)).join('\n');
          case 'demo': {
            const demo = p.demos.get(b.name);
            const key = demoKey(b.name);
            if (demo.status !== 'included')
              return `<ExcludedDemo name=${str(b.name)} reason=${str(demo.reason.replace(/`/g, ''))} />`;
            const entry = demoEntries.find((e) => e.key === key);
            entry.options ??= b.options;
            return `<Demo name=${str(key)}${b.options.defaultCodeOpen ? ' showCode' : ''} />`;
          }
          default:
            return '';
        }
      };
      if (part.secondary)
        body.push(`<Heading level={3} id=${str(part.titleId)}>{${str(part.title)}}</Heading>`);
      if (part.description?.length) body.push(`<M.p>${emitter.inline(part.description)}</M.p>`);
      body.push(blocks(part.intro));
      for (const s of part.sections) body.push(blocks([s.heading, ...s.blocks]));
    }
    const version = versions['@mui/material'];
    const attributions = sources.map(
      (s) => `{ label: ${str(s.slice(MUI_COMPONENTS_DIR.length))}, href: ${str(blob(s))} }`,
    );
    const demoDefs = demoEntries.map(({ key, ident, options = {} }) => {
      const opts = {};
      if (options.iframe) opts.iframe = true;
      if (options.bg) opts.bg = options.bg;
      if (options.maxWidth) opts.maxWidth = options.maxWidth;
      if (options.height) opts.height = options.height;
      const optText = Object.keys(opts).length ? `, ${JSON.stringify(opts)}` : '';
      return `  ${str(key)}: defineDemo(${str(key)}, ${ident}, { code: ${ident}Source }${optText}),`;
    });
    const code =
      header(sources) +
      [
        "import { Attribution, Callout, CodeBlock, Demo, ExcludedDemo, Heading, M, MuiDocsContent } from '../../runtime/elements';",
        "import { defineDemo } from '../../runtime/demo';",
        ...demoImports,
        '',
        `const demos = {\n${demoDefs.join('\n')}\n};`,
        '',
        `export default function MuiDocs() {`,
        `  return (<MuiDocsContent demos={demos}>`,
        body.filter(Boolean).join('\n'),
        `<Attribution version=${str(version)} sources={[${attributions.join(', ')}]} />`,
        `</MuiDocsContent>);`,
        '}',
        '',
      ].join('\n');
    const used = (name) =>
      new RegExp(`<${name}[\\s>/]|\\b${name}\\.`).test(code.slice(code.indexOf('const demos')));
    const runtimeNames = [
      'Attribution',
      'Callout',
      'CodeBlock',
      'Demo',
      'ExcludedDemo',
      'Heading',
      'M',
      'MuiDocsContent',
    ].filter(used);
    const finalCode = code
      .replace(
        /import \{ Attribution, [^}]+\} from '\.\.\/\.\.\/runtime\/elements';/,
        `import { ${runtimeNames.join(', ')} } from '../../runtime/elements';`,
      )
      .replace(
        "import { defineDemo } from '../../runtime/demo';\n",
        demoEntries.length ? "import { defineDemo } from '../../runtime/demo';\n" : '',
      );
    files.set(
      `pages/${slug}.tsx`,
      await prettier.format(finalCode, { ...prettierConfig, parser: 'typescript' }),
    );
    if (warnings.length) console.warn(`  ${slug}: ${[...new Set(warnings)].join('; ')}`);
  }

  // 6. Icons: the demos render `@mui/icons-material` icons with the Tecton `Icon` component
  // (lib/icons.mjs). Record the mapping used and make sure no Material icon import is left.
  const lockIcons = {};
  for (const name of [...icons].sort()) {
    const { name: tecton, variant } = tectonIcon(name, iconMap);
    lockIcons[name] = {
      tecton,
      ...(variant === 'filled' ? { variant } : {}),
      ...(iconMap.notes[name] ? { note: iconMap.notes[name] } : {}),
    };
  }
  for (const [path, content] of files)
    if (/from '@mui\/icons-material/.test(content))
      throw new Error(`${path}: still imports @mui/icons-material after the icon rewrite`);

  // 7. Write the generated tree and the lock.
  rmSync(genDir, { recursive: true, force: true });
  const lockFiles = {};
  for (const [path, content] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    const file = join(genDir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
    lockFiles[rel(file)] = sha256(content);
  }
  const demosAll = lockPages.flatMap((p) => p.demos);
  const excludedByReason = {};
  for (const d of demosAll.filter((d) => d.status === 'excluded')) {
    const key = d.reason
      .replace(/`[^`]+`/g, '`…`')
      .replace(/\(.*\)/, '')
      .trim();
    excludedByReason[key] = (excludedByReason[key] ?? 0) + 1;
  }
  const counts = {
    pagesConsidered: manifest.pages.filter((p) => p.source.startsWith(MUI_COMPONENTS_DIR)).length,
    pagesSynced: lockPages.length,
    portalSlugs: layouts.size,
    demosIncluded: demosAll.filter((d) => d.status === 'included').length,
    demosExcluded: demosAll.filter((d) => d.status === 'excluded').length,
    icons: Object.keys(lockIcons).length,
  };
  const lock = {
    $comment:
      'Generated by `pnpm docs:sync`. Records what was synced (pages, demos and why some are excluded, icon mapping) and the hash of every generated file; `pnpm docs:sync --check` fails when a generated file was edited by hand or the installed MUI versions changed.',
    upstream: { repo: config.repo, ref: upstream.ref, license: config.license },
    versions,
    counts,
    excludedDemosByReason: Object.fromEntries(
      Object.entries(excludedByReason).sort((a, b) => b[1] - a[1]),
    ),
    slugs: Object.fromEntries(
      [...layouts].map(([slug, parts]) => [slug, parts.map((p) => p.pageId)]),
    ),
    pages: lockPages,
    icons: lockIcons,
    files: lockFiles,
  };
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(JSON.stringify(counts));
  console.log(
    `Fetched ${upstream.fetched} file(s); wrote ${files.size} generated file(s) and ${rel(lockPath)}.`,
  );
  console.log(
    'Review `git diff`, then run the docs typecheck/build and the e2e sweep before opening a PR.',
  );
}

// ---------------------------------------------------------------------------------------------

const args = process.argv.slice(2);
const errors = checkManifest();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
if (args.includes('--check')) {
  const generated = checkGenerated();
  if (generated.length) {
    console.error(generated.join('\n'));
    process.exit(1);
  }
  const lock = readJson(lockPath);
  console.log(
    `Docs sync OK: manifest (${manifest.pages.length} pages), ${lock.counts.pagesSynced} synced pages, ` +
      `${Object.keys(lock.files).length} generated files match the lock.`,
  );
} else {
  const i = args.indexOf('--packages');
  if (i < 0 || !args[i + 1]) {
    console.error(
      'Usage: docs:sync --check | --packages @mui/material,@mui/lab [--offline] [--refresh]',
    );
    process.exit(2);
  }
  await sync(args[i + 1].split(','));
}
