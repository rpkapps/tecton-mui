#!/usr/bin/env node
// Crawls the built HTML in dist/ and fails on broken internal links: missing pages, missing assets
// and missing #fragment targets. External links are not fetched.
// Usage: node scripts/check-links.mjs [--base /repo/]   (defaults to DOCS_BASE or "/")
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === 'pagefind' ? [] : htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

/**
 * Removes live demo previews (`<div data-demo-preview>`): their links are illustrative sample
 * content (e.g. breadcrumb trails), not portal navigation.
 */
function stripDemoPreviews(html) {
  let out = html;
  for (;;) {
    const start = out.search(/<div[^>]*\sdata-demo-preview=""/);
    if (start === -1) return out;
    const tags = /<div\b|<\/div>/g;
    tags.lastIndex = start;
    let depth = 0;
    let end = out.length;
    for (let m = tags.exec(out); m; m = tags.exec(out)) {
      depth += m[0] === '</div>' ? -1 : 1;
      if (depth === 0) {
        end = m.index + m[0].length;
        break;
      }
    }
    out = out.slice(0, start) + out.slice(end);
  }
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

export function checkLinks({ dist, base = '/' }) {
  const files = htmlFiles(dist);
  const ids = new Map();
  const pageOf = (file) => {
    const rel = relative(dist, file).split(sep).join('/');
    return rel === 'index.html' ? '/' : `/${rel.replace(/(\/)?index\.html$/, '')}`;
  };
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    ids.set(pageOf(file), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => decode(m[1]))));
  }

  const broken = [];
  let checked = 0;
  for (const file of files) {
    if (file.endsWith('404.html')) continue;
    const html = stripDemoPreviews(readFileSync(file, 'utf8'));
    const from = pageOf(file);
    const refs = [
      ...[...html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)].map((m) => ({ kind: 'link', url: m[1] })),
      ...[...html.matchAll(/<(?:script|img)\s[^>]*?src="([^"]*)"/g)].map((m) => ({
        kind: 'asset',
        url: m[1],
      })),
      ...[...html.matchAll(/<link\s[^>]*?href="([^"]*)"/g)].map((m) => ({
        kind: 'asset',
        url: m[1],
      })),
    ];
    for (const { kind, url: rawUrl } of refs) {
      const url = decode(rawUrl);
      if (!url || /^(?:[a-z]+:|\/\/)/i.test(url)) continue; // external, mailto:, data:
      checked += 1;
      let [path, hash] = url.split('#');
      if (path === '')
        path = from; // same-page fragment
      else if (!path.startsWith('/')) path = new URL(path, `http://x${from}/`).pathname;
      else if (!path.startsWith(base) && `${path}/` !== base) {
        broken.push(`${from}: ${url} (outside base ${base})`);
        continue;
      }
      if (path.startsWith(base)) path = `/${path.slice(base.length)}`;
      path = path.replace(/\?.*$/, '');
      const normalized = path.length > 1 ? path.replace(/\/$/, '') : path;
      if (kind === 'asset') {
        if (!existsSync(join(dist, normalized))) broken.push(`${from}: missing asset ${url}`);
        continue;
      }
      const target = ids.get(normalized);
      if (!target && !existsSync(join(dist, normalized))) {
        broken.push(`${from}: ${url} (no page)`);
      } else if (hash && target && !target.has(decodeURIComponent(hash))) {
        broken.push(`${from}: ${url} (missing #${hash})`);
      }
    }
  }
  if (broken.length) {
    const unique = [...new Set(broken)];
    console.error(
      `[check-links] ${unique.length} broken internal link(s):\n  ${unique.slice(0, 50).join('\n  ')}`,
    );
    process.exitCode = 1;
    throw new Error('Broken internal links');
  }
  console.log(`[check-links] ${files.length} pages, ${checked} internal references OK`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const flag = process.argv.indexOf('--base');
  const raw = flag > -1 ? process.argv[flag + 1] : (process.env.DOCS_BASE ?? '/');
  const trimmed = raw.replace(/^\/*|\/*$/g, '');
  checkLinks({ dist: join(root, 'dist'), base: trimmed ? `/${trimmed}/` : '/' });
}
