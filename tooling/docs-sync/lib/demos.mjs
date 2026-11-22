// Adapts an upstream MUI demo (TypeScript source) to the portal: rewrites imports to the public
// `@tecton-mui/ui` entry points, `@mui/icons-material` icons to the Tecton `Icon` component
// (lib/icons.mjs) and decides whether the demo can be included. The demo logic itself is never
// changed. The other content rewrites are MUI-site-relative asset URLs (`/static/...`), which are
// made absolute so they keep loading from mui.com, and the hard-coded placeholder colors of layout
// demos, which are removed so the Tecton surface shows.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rewriteIcons } from './icons.mjs';

/** Export surface of `@tecton-mui/ui`, read from the generated root barrel. */
export function readUiSurface(repo) {
  const inventory = JSON.parse(
    readFileSync(join(repo, 'tooling/compatibility/export-inventory.json'), 'utf8'),
  );
  const barrel = readFileSync(join(repo, 'packages/ui/src/index.ts'), 'utf8');
  const root = new Set();
  const byModule = new Map();
  for (const m of barrel.matchAll(
    /export (?:type )?\{([^}]*)\} from '\.\/([\w/-]+)\/index\.js'/g,
  )) {
    const names = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.split(/\s+as\s+/).at(-1));
    for (const name of names) root.add(name);
    const set = byModule.get(m[2]) ?? new Set();
    names.forEach((n) => set.add(n));
    byModule.set(m[2], set);
  }
  const excluded = new Map(inventory.excluded.map((e) => [`${e.package}/${e.module}`, e.reason]));
  return {
    subpaths: new Set(inventory.subpaths),
    included: new Set(inventory.included.map((e) => `${e.package}/${e.module}`)),
    excluded,
    root,
    styles: byModule.get('styles') ?? new Set(),
    utils: byModule.get('utils') ?? new Set(),
  };
}

const UI = '@tecton-mui/ui';

/**
 * Chooses the `@tecton-mui/ui` module for named imports taken from a package that the portal does
 * not depend on (`@mui/system`, `@mui/utils`, `@emotion/react`, ...). Returns `null` when a name
 * has no public equivalent.
 */
function moduleForNames(names, surface, preferUtils = false) {
  const targets = new Map();
  for (const { imported } of names) {
    let target = null;
    if (preferUtils && surface.utils.has(imported)) target = `${UI}/utils`;
    else if (surface.styles.has(imported)) target = `${UI}/styles`;
    else if (surface.root.has(imported)) target = UI;
    if (!target) return { missing: imported };
    const list = targets.get(target) ?? [];
    list.push(imported);
    targets.set(target, list);
  }
  return { targets };
}

function importClause(ts, decl, sf) {
  const clause = decl.importClause;
  const result = { typeOnly: !!clause?.isTypeOnly, default: null, namespace: null, named: [] };
  if (!clause) return result;
  if (clause.name) result.default = clause.name.text;
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings)) result.namespace = bindings.name.text;
  if (bindings && ts.isNamedImports(bindings)) {
    for (const el of bindings.elements) {
      result.named.push({
        imported: (el.propertyName ?? el.name).text,
        local: el.name.text,
        typeOnly: el.isTypeOnly,
        text: el.getText(sf),
      });
    }
  }
  return result;
}

function renderNamed(elements, typeOnly) {
  return `import ${typeOnly ? 'type ' : ''}{ ${elements.map((e) => e.text).join(', ')} }`;
}

/**
 * Local names of imports used only in type positions. Upstream demos import types without `type`
 * (e.g. `import Select, { SelectChangeEvent } from ...`); the portal compiles with
 * `verbatimModuleSyntax`, so those imports get an inline `type` modifier (no runtime change).
 */
function typeOnlyLocals(ts, sf, locals) {
  const usage = new Map([...locals].map((n) => [n, { type: 0, value: 0 }]));
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && usage.has(node.text)) {
      let kind = 'value';
      for (let p = node.parent; p && !ts.isSourceFile(p); p = p.parent) {
        if (ts.isTypeQueryNode(p)) break;
        if (ts.isTypeNode(p)) {
          kind = 'type';
          break;
        }
        if (ts.isStatement(p) || ts.isExpression(p)) break;
      }
      usage.get(node.text)[kind] += 1;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return new Set([...usage].filter(([, u]) => u.type > 0 && u.value === 0).map(([n]) => n));
}

/**
 * @param {string} source upstream TypeScript source of a demo or of one of its local modules
 * @param {{ ts: object, surface: object, iconMap: object, fileName: string }} options `iconMap` is
 *   tooling/docs-sync/icon-map.json
 * @returns {{ status: 'included', code: string, deps: string[], icons: string[], notes: string[] }
 *   | { status: 'excluded', reason: string }
 *   | { status: 'unmapped', icons: string[] }} `unmapped`: icons without an icon-map.json entry
 */
export function transformDemo(source, { ts, surface, iconMap, fileName }) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const namedLocals = new Set();
  for (const stmt of sf.statements) {
    const b =
      ts.isImportDeclaration(stmt) &&
      !stmt.importClause?.isTypeOnly &&
      stmt.importClause?.namedBindings;
    if (b && ts.isNamedImports(b))
      for (const el of b.elements) if (!el.isTypeOnly) namedLocals.add(el.name.text);
  }
  const typeOnly = typeOnlyLocals(ts, sf, namedLocals);
  const deps = [];
  const icons = [];
  const iconImports = [];
  const notes = [];
  const exclude = (reason) => ({ status: 'excluded', reason });

  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) && !ts.isExportDeclaration(stmt)) continue;
    if (!stmt.moduleSpecifier) continue;
    const spec = stmt.moduleSpecifier.text;
    if (ts.isExportDeclaration(stmt)) {
      if (!spec.startsWith('./')) return exclude(`re-exports \`${spec}\``);
      deps.push(spec);
      continue;
    }
    const clause = importClause(ts, stmt, sf);
    if (!clause.typeOnly) {
      for (const n of clause.named) {
        if (!n.typeOnly && typeOnly.has(n.local)) {
          n.text = `type ${n.text}`;
          const el = stmt.importClause.namedBindings.elements.find((e) => e.name.text === n.local);
          edits.push({ start: el.getStart(sf), end: el.getStart(sf), text: 'type ' });
        }
      }
    }
    const replaceSpecifier = (to) =>
      edits.push({
        start: stmt.moduleSpecifier.getStart(sf),
        end: stmt.moduleSpecifier.getEnd(),
        text: `'${to}'`,
      });
    const replaceStatement = (text) => {
      const [start, end] = [stmt.getStart(sf), stmt.getEnd()];
      for (let i = edits.length - 1; i >= 0; i -= 1)
        if (edits[i].start >= start && edits[i].end <= end) edits.splice(i, 1);
      edits.push({ start, end, text });
    };

    if (spec === 'react' || spec === 'react-dom' || spec === 'react-dom/client') continue;
    if (spec.startsWith('./')) {
      deps.push(spec);
      continue;
    }

    let m;
    if ((m = /^@mui\/icons-material(?:\/(\w+))?$/.exec(spec))) {
      // Rewritten to the Tecton `Icon` component once all imports are known (lib/icons.mjs).
      if (m[1] && clause.default && !clause.named.length && !clause.namespace) {
        iconImports.push({ stmt, local: clause.default, name: m[1] });
        continue;
      }
      if (m[1] || clause.default || clause.namespace)
        return exclude(`imports \`${spec}\` in a form the icon rewrite does not support`);
      for (const n of clause.named) iconImports.push({ stmt, local: n.local, name: n.imported });
      continue;
    }
    if (spec === '@mui/material/styles') {
      replaceSpecifier(`${UI}/styles`);
      continue;
    }
    if ((m = /^@mui\/(material|lab)(?:\/([\w-]+))?(\/.*)?$/.exec(spec))) {
      const [, pkg, sub, deep] = m;
      if (deep) return exclude(`imports the non-public path \`${spec}\``);
      if (!sub) {
        const missing = [...clause.named].find((n) => !surface.root.has(n.imported));
        if (missing || clause.default || clause.namespace)
          return exclude(`\`${missing?.imported ?? spec}\` is not exported by ${UI}`);
        replaceSpecifier(UI);
        continue;
      }
      const reason = surface.excluded.get(`@mui/${pkg}/${sub}`);
      if (reason) return exclude(`imports \`${spec}\`, which ${UI} does not export (${reason})`);
      if (
        surface.subpaths.has(sub) &&
        (pkg === 'material' || surface.included.has(`@mui/lab/${sub}`))
      ) {
        replaceSpecifier(`${UI}/${sub}`);
        continue;
      }
      // Type-only helper modules (e.g. `@mui/material/transitions`): use the root entry when every
      // imported name is exported there.
      const missing = clause.named.find((n) => !surface.root.has(n.imported));
      if (!clause.default && !clause.namespace && clause.named.length && !missing) {
        replaceSpecifier(UI);
        notes.push(`\`${spec}\` imports taken from the \`${UI}\` root entry`);
        continue;
      }
      return exclude(`imports \`${spec}\`, which ${UI} does not export`);
    }
    if (['@mui/system', '@mui/utils', '@emotion/react', '@emotion/styled'].includes(spec)) {
      if (clause.default || clause.namespace)
        return exclude(`imports the default export of \`${spec}\``);
      const resolved = moduleForNames(clause.named, surface, spec === '@mui/utils');
      if (resolved.missing)
        return exclude(
          `imports \`${resolved.missing}\` from \`${spec}\`, which ${UI} does not export`,
        );
      const statements = [...resolved.targets].map(([target, names]) => {
        const elements = clause.named.filter((n) => names.includes(n.imported));
        return `${renderNamed(elements, clause.typeOnly)} from '${target}';`;
      });
      replaceStatement(statements.join('\n'));
      notes.push(`\`${spec}\` imports taken from ${[...resolved.targets.keys()].join(', ')}`);
      continue;
    }
    if (/^@mui\/x-/.test(spec))
      return exclude(`imports \`${spec}\` (MUI X documentation is not synced)`);
    if (/^@mui\/(internal|docs)/.test(spec) || spec.startsWith('docs/'))
      return exclude(`uses the MUI documentation-site helper \`${spec}\``);
    const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
    return exclude(
      `requires the third-party package \`${pkg}\`, which the portal does not depend on`,
    );
  }

  if (/\bfetch\(/.test(source)) return exclude('loads remote data with fetch()');
  if (/googleapis|loadScript\(|document\.createElement\('script'\)/.test(source))
    return exclude('loads an external script');

  if (iconImports.length) {
    const result = rewriteIcons({ ts, sf, fileName, imports: iconImports, iconMap, edits });
    if (result.missing) return { status: 'unmapped', icons: result.missing };
    if (result.exclude) return exclude(result.exclude);
    icons.push(...result.icons);
    if (result.wrappers.length)
      notes.push(
        `icons passed as components use local \`Icon\` wrappers (${result.wrappers.join(', ')})`,
      );
  }

  let code = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  }
  const before = code;
  code = code
    .replace(/(['"`])\/static\//g, '$1https://mui.com/static/')
    .replace(/(['"`])\/([\w./-]+\.(?:jpe?g|png|gif|svg|webp|mp4))\1/g, '$1https://mui.com/$2$1');
  if (code !== before)
    notes.push('MUI-site-relative asset URLs made absolute (https://mui.com/...)');
  // Layout demos (Grid, Stack, Masonry, …) render placeholder `Item`s on a Paper with hard-coded
  // `#fff` and a dark `#1A2027` through MUI's `applyStyles('dark')`. Tecton's Paper already has the
  // surface color for both modes, so both values are removed.
  const itemDark =
    /\n[ \t]*\.\.\.theme\.applyStyles\('dark', \{\n[ \t]*backgroundColor: '#1A2027',\n[ \t]*\}\),/g;
  if (itemDark.test(code)) {
    code = code.replace(itemDark, '').replace(/\n[ \t]*backgroundColor: '#fff',/g, '');
    notes.push('placeholder colors removed (#fff / #1A2027): the Tecton Paper surface shows');
  }
  return { status: 'included', code, deps, icons, notes };
}
