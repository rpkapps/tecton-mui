#!/usr/bin/env node
// Generates the portal's API reference data from the actual TypeScript exports of @tecton-mui/ui.
//
// For every component subpath (`packages/ui/src/<Name>/index.ts`) it resolves the public component
// export (default export, or the named export matching the module name for MUI X modules), extracts
// its props with react-docgen-typescript (using the UI package tsconfig) and writes:
//   src/generated/api/<Name>.json  - props/events/slots of one component
//   src/generated/api-index.json   - list of documented modules with import metadata
// Props inherited from React DOM typings (aria-*, DOM event handlers, HTML attributes) are counted
// but filtered out of the tables by default.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const repo = resolve(docsRoot, '../..');
const ui = join(repo, 'packages/ui');
const require = createRequire(join(docsRoot, 'package.json'));
const ts = require('typescript');
const { Parser } = require('react-docgen-typescript');

const outDir = join(docsRoot, 'src/generated');
const apiDir = join(outDir, 'api');

/**
 * Modules to leave out of the generated reference (e.g. while a component is being integrated).
 * Add a RegExp here to exclude a module; its portal page then needs no API data.
 */
const PENDING = [];
/** Non-component subpaths that start with an uppercase letter. */
const NOT_COMPONENTS = [/^Adapter/];
/**
 * Modules that export a family of part components next to the main one (`Menubar` with
 * `MenubarItem`, `MenubarPopup` ...). Each matching named value export gets its own API entry; its
 * import is a named import from the module's subpath.
 */
const PART_EXPORTS = { Menubar: /^Menubar[A-Z]/, ActionBar: /^ActionBar[A-Z]/ };

const inventory = JSON.parse(
  readFileSync(join(repo, 'tooling/compatibility/export-inventory.json'), 'utf8'),
);
const pkg = JSON.parse(readFileSync(join(ui, 'package.json'), 'utf8'));
const sourcePackage = new Map(inventory.included.map((i) => [i.module, i.package]));
for (const m of inventory.customModules) sourcePackage.set(m, '@tecton-mui/ui');

// Root barrel: which names each module contributes to `import { X } from '@tecton-mui/ui'`.
const rootIndex = readFileSync(join(ui, 'src/index.ts'), 'utf8');
const rootExports = new Map();
for (const m of rootIndex.matchAll(
  /^export \{([^}]*)\} from '\.\/([A-Za-z0-9_]+)\/index\.js';/gm,
)) {
  const names = m[1].split(',').map((s) =>
    s
      .trim()
      .split(/\s+as\s+/)
      .pop(),
  );
  rootExports.set(m[2], [...(rootExports.get(m[2]) ?? []), ...names]);
}

const modules = inventory.subpaths.filter(
  (name) =>
    /^[A-Z]/.test(name) &&
    !PENDING.some((re) => re.test(name)) &&
    !NOT_COMPONENTS.some((re) => re.test(name)),
);

const tsconfigPath = join(ui, 'tsconfig.json');
const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ui);
const files = modules.map((m) => join(ui, 'src', m, 'index.ts'));
const program = ts.createProgram(files, { ...parsed.options, noEmit: true });
const checker = program.getTypeChecker();
const parser = new Parser(program, {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: () => true,
});

const isDomTyping = (fileName = '') =>
  /[\\/]@types[\\/]react[\\/]/.test(fileName) || /[\\/]typescript[\\/]lib[\\/]/.test(fileName);

/** Markdown links -> plain text (keeps prose independent of upstream sites). */
const plain = (text = '') =>
  text
    .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, '$1')
    .replace(/\r/g, '')
    .trim();

function describeComponent(symbol) {
  const doc = parser.findDocComment(symbol);
  const full = doc.fullComment ?? '';
  const inherits = /inherits \[([A-Za-z]+) API\]/.exec(full)?.[1] ?? null;
  // Drop upstream "Demos:" / "API:" link lists; keep any remaining summary text.
  const summary = plain(full.split(/\n\s*Demos:|\n\s*API:|^Demos:|^API:/m)[0] ?? '');
  return { summary, inherits };
}

function typeString(prop) {
  const t = prop.type ?? {};
  if (t.name === 'enum' && Array.isArray(t.value)) {
    const values = t.value.map((v) => v.value);
    const joined = values.join(' | ');
    return t.raw && joined.length > 160 ? t.raw : joined;
  }
  return t.raw ?? t.name ?? 'unknown';
}

function resolveComponentSymbol(sourceFile, moduleName) {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return null;
  const exports = checker.getExportsOfModule(moduleSymbol);
  const def = exports.find((e) => e.escapedName === 'default');
  if (def) return { exportSymbol: def, hasDefault: true, exportName: moduleName };
  // MUI X modules use named exports; some unstable ones carry an `Unstable_` prefix.
  const named = exports.find(
    (e) => e.escapedName === moduleName || e.escapedName === `Unstable_${moduleName}`,
  );
  return named ? { exportSymbol: named, hasDefault: false, exportName: named.escapedName } : null;
}

function propsOf(exportSymbol, sourceFile) {
  const info = parser.getComponentInfo(exportSymbol, sourceFile);
  if (info && Object.keys(info.props).length > 0) return info.props;
  // react-docgen-typescript cannot detect MUI's overloaded OverridableComponent signatures; read the
  // props of the last (non-generic `component`) call signature with the same docgen machinery.
  const target =
    exportSymbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(exportSymbol)
      : exportSymbol;
  const type = checker.getTypeOfSymbolAtLocation(target, sourceFile);
  // `React.JSXElementConstructor<P>` is a union of a function and a class constructor.
  const candidates = type.isUnion() ? [type, ...type.types] : [type];
  const signatures = candidates.flatMap((t) => [
    ...t.getCallSignatures(),
    ...t.getConstructSignatures(),
  ]);
  const param = signatures.at(-1)?.parameters[0];
  return param ? parser.getPropsInfo(param) : null;
}

rmSync(apiDir, { recursive: true, force: true });
mkdirSync(apiDir, { recursive: true });

const index = [];
const skipped = [];
/** The main component of each module, then its part components (see PART_EXPORTS). */
function* documentedExports() {
  for (const module of modules) {
    const sourceFile = program.getSourceFile(join(ui, 'src', module, 'index.ts'));
    const resolved = sourceFile && resolveComponentSymbol(sourceFile, module);
    if (!resolved) {
      skipped.push(`${module} (no component export)`);
      continue;
    }
    yield { name: module, module, sourceFile, resolved };
    const parts = PART_EXPORTS[module];
    if (!parts) continue;
    for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(sourceFile))) {
      const exportName = String(symbol.escapedName);
      const target =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (!parts.test(exportName) || !(target.flags & ts.SymbolFlags.Value)) continue;
      yield {
        name: exportName,
        module,
        sourceFile,
        resolved: { exportSymbol: symbol, hasDefault: false, exportName },
      };
    }
  }
}

for (const { name, module, sourceFile, resolved } of documentedExports()) {
  const props = propsOf(resolved.exportSymbol, sourceFile);
  if (!props) {
    skipped.push(`${name} (not a component)`);
    continue;
  }
  const target =
    resolved.exportSymbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(resolved.exportSymbol)
      : resolved.exportSymbol;
  const { summary, inherits } = describeComponent(target);

  const own = [];
  const inherited = new Set();
  let inheritedCount = 0;
  for (const prop of Object.values(props)) {
    const declFile = prop.parent?.fileName ?? prop.declarations?.[0]?.fileName;
    if (prop.name === 'key' || isDomTyping(declFile)) {
      inheritedCount += 1;
      if (prop.parent?.name) inherited.add(prop.parent.name);
      continue;
    }
    const tags = prop.tags ?? {};
    own.push({
      name: prop.name,
      kind: ['slots', 'slotProps', 'components', 'componentsProps'].includes(prop.name)
        ? 'slot'
        : /^on[A-Z]/.test(prop.name)
          ? 'event'
          : 'prop',
      type: typeString(prop).slice(0, 400),
      required: Boolean(prop.required),
      defaultValue: prop.defaultValue?.value != null ? String(prop.defaultValue.value) : null,
      description: plain(prop.description),
      deprecated: tags.deprecated != null ? plain(String(tags.deprecated)) || true : null,
      declaredBy: prop.parent?.name ?? null,
    });
  }
  own.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));

  const roots = rootExports.get(module) ?? [];
  const entry = {
    name,
    package: sourcePackage.get(module) ?? '@tecton-mui/ui',
    subpath: `${pkg.name}/${module}`,
    exportName: resolved.exportName,
    hasDefault: resolved.hasDefault,
    rootExport: roots.includes(resolved.exportName),
    summary,
    inherits,
    inheritedCount,
    inheritedFrom: [...inherited].sort(),
    props: own,
  };
  writeFileSync(join(apiDir, `${name}.json`), JSON.stringify(entry, null, 2) + '\n');
  index.push({
    name,
    package: entry.package,
    exportName: entry.exportName,
    hasDefault: entry.hasDefault,
    rootExport: entry.rootExport,
    propCount: own.length,
  });
}

writeFileSync(
  join(outDir, 'api-index.json'),
  JSON.stringify(
    {
      $comment: 'Generated by apps/docs/scripts/generate-api.mjs from @tecton-mui/ui types.',
      versions: inventory.versions,
      components: index,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `[generate-api] ${index.length} components documented` +
    (skipped.length ? `; skipped: ${skipped.join(', ')}` : ''),
);
