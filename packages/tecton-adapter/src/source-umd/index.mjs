// UMD source adapter: obtains the pinned Tecton CDN artifacts (UMD + source map + CSS + font files),
// stores them under vendor/<version>/ with a sha256 manifest, and exposes them as a RawTectonSource
// (see ../normalized/contract.ts). Nothing here runs in consumer applications.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function artifactUrl(config, relPath) {
  return `${config.umd.baseUrl}/${relPath.replaceAll('{version}', config.version)}`;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tecton download failed (${res.status}) for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Font files are referenced relatively from fonts.css (e.g. ./assets/fonts/x.woff2). */
export function fontUrlsFromCss(css) {
  return [
    ...new Set([...css.matchAll(/url\("?(\.\/assets\/fonts\/[^")]+)"?\)/g)].map((m) => m[1])),
  ];
}

/** Downloads every pinned artifact and (re)writes vendor/<version>/manifest.json. */
export async function syncUmd({ config, vendorDir }) {
  const files = {};
  for (const [name, rel] of Object.entries(config.umd.artifacts)) {
    files[name] = await download(artifactUrl(config, rel));
  }
  const fontBase = artifactUrl(config, config.umd.relativeAssetBase['fonts.css']);
  for (const rel of fontUrlsFromCss(files['fonts.css'].toString('utf8'))) {
    files[rel.replace(/^\.\//, '')] = await download(new URL(rel, fontBase).href);
  }
  const manifest = { version: config.version, source: 'umd', files: {} };
  for (const [name, buf] of Object.entries(files)) {
    const target = join(vendorDir, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, buf);
    manifest.files[name] = { sha256: sha256(buf), bytes: buf.length };
  }
  await writeFile(join(vendorDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

/** Verifies vendor/<version>/ against its manifest; throws on any mismatch. */
export async function verifyVendor({ config, vendorDir }) {
  const manifestPath = join(vendorDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`No vendored Tecton ${config.version} artifacts. Run \`pnpm tecton:sync\`.`);
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.version !== config.version) {
    throw new Error(
      `Vendor manifest is for Tecton ${manifest.version}, config pins ${config.version}.`,
    );
  }
  for (const [name, meta] of Object.entries(manifest.files)) {
    const actual = sha256(await readFile(join(vendorDir, name)));
    if (actual !== meta.sha256) throw new Error(`Checksum mismatch for vendored ${name}`);
  }
  return manifest;
}

/** Reads the verified vendor directory into the RawTectonSource shape. */
export async function loadUmd({ config, vendorDir }) {
  const manifest = await verifyVendor({ config, vendorDir });
  const umd = await readFile(join(vendorDir, 'index.umd.js'), 'utf8');
  const map = JSON.parse(await readFile(join(vendorDir, 'index.umd.js.map'), 'utf8'));
  const banner = umd.match(/^\/\*! (@[\w/-]+) v([\d.]+)/);
  if (!banner || banner[2] !== config.version) {
    throw new Error(`UMD banner version ${banner?.[2]} does not match pinned ${config.version}`);
  }

  let coreModule;
  const muiSources = {};
  map.sources.forEach((source, i) => {
    if (source.includes('node_modules')) return; // bundled React/MUI copies are never used
    const content = map.sourcesContent?.[i];
    if (content == null) throw new Error(`Source map has no content for ${source}`);
    if (source.endsWith('core/dist/index.mjs')) coreModule = content;
    else if (source.startsWith('../src/')) muiSources[source.slice('../src/'.length)] = content;
  });
  if (!coreModule) throw new Error('tecton-core module not found in UMD source map');

  const fonts = {};
  for (const name of Object.keys(manifest.files)) {
    if (name.startsWith('assets/fonts/')) fonts[name] = await readFile(join(vendorDir, name));
  }
  return {
    version: config.version,
    origin: 'umd',
    coreModule,
    muiSources,
    fontsCss: await readFile(join(vendorDir, 'fonts.css'), 'utf8'),
    iconsCss: await readFile(join(vendorDir, 'icons.css'), 'utf8'),
    fonts,
    provenance: Object.fromEntries(
      Object.entries(config.umd.artifacts).map(([k, rel]) => [k, artifactUrl(config, rel)]),
    ),
  };
}
