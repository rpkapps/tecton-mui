#!/usr/bin/env node
// Consumer packaging checks against the built package (packages/ui/dist), resolved through the
// published `exports` map from a real workspace consumer (tooling/bundle-tests/fixture):
//   1. every exported subpath has a JS file and a declaration file
//   2. root and representative subpaths import in plain Node ESM and render on the server
//   3. tree shaking: bundling `@tecton-mui/ui/Button` (or `{ Button }` from the root) does not
//      pull in Data Grid, pickers, tree view, Base UI, date adapters or Tecton token data
//   4. the documented stylesheet entry points exist and component CSS contains no globals
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, 'fixture');
const ui = resolve(here, '../../packages/ui');
const out = join(here, '.out');
const pkg = JSON.parse(readFileSync(join(ui, 'package.json'), 'utf8'));
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`  ✗ ${msg}`);
};
const pass = (msg) => console.log(`  ✓ ${msg}`);

if (!existsSync(join(ui, 'dist/index.js'))) {
  console.log('Building @tecton-mui/ui ...');
  execFileSync('pnpm', ['--filter', '@tecton-mui/ui', 'build'], { stdio: 'inherit' });
}

console.log('1. exports map');
let missing = 0;
for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (typeof target === 'string') {
    if (!existsSync(join(ui, target))) {
      fail(`${subpath} -> ${target} missing`);
      missing++;
    }
    continue;
  }
  for (const key of ['default', 'types']) {
    if (!existsSync(join(ui, target[key]))) {
      fail(`${subpath} ${key} -> ${target[key]} missing`);
      missing++;
    }
  }
}
if (!missing) pass(`${Object.keys(pkg.exports).length} subpaths resolve to JS + declarations`);

console.log('2. Node ESM import + SSR');
const ssr = join(fixture, '.ssr-check.mjs');
writeFileSync(
  ssr,
  `import * as React from 'react';
import { renderToString } from 'react-dom/server';
import * as root from '@tecton-mui/ui';
import Button from '@tecton-mui/ui/Button';
import Toolbar, { toolbarClasses } from '@tecton-mui/ui/Toolbar';
import { gridClasses } from '@tecton-mui/ui/Grid';
import DataGrid from '@tecton-mui/ui/DataGrid';
import DateRangePicker from '@tecton-mui/ui/DateRangePicker';
import RichTreeView from '@tecton-mui/ui/RichTreeView';
import Icon from '@tecton-mui/ui/Icon';
import NumberField from '@tecton-mui/ui/NumberField';
import LocalizationProvider from '@tecton-mui/ui/LocalizationProvider';
import ChatBox from '@tecton-mui/ui/ChatBox';
import { createEchoAdapter } from '@tecton-mui/ui/ChatHeadless';
import { ThemeProvider, TectonModeScript } from '@tecton-mui/ui/styles';
if (root.Button !== Button) throw new Error('root Button differs from subpath Button');
// MUI Core names win at the root over same-named MUI X re-exports (e.g. Data Grid's Toolbar).
if (root.Toolbar !== Toolbar || root.toolbarClasses !== toolbarClasses) throw new Error('root Toolbar is not the Material Toolbar');
if (root.gridClasses !== gridClasses) throw new Error('root gridClasses is not the Material Grid classes');
const h = React.createElement;
const html = renderToString(h(ThemeProvider, null,
  h(TectonModeScript),
  h(Button, { variant: 'contained' }, 'Save'),
  h(Icon, { name: 'add' }),
  h(NumberField, { label: 'Depth', defaultValue: 1200, locale: 'en-US' }),
  h(LocalizationProvider, null, h(DateRangePicker, { label: 'Range' })),
  h(RichTreeView, { items: [{ id: 'a', label: 'A' }] }),
  h(ChatBox, { adapter: createEchoAdapter(), initialMessages: [{ id: 'm', role: 'user', parts: [{ type: 'text', text: 'Hello chat' }] }], sx: { height: 300 } }),
  h('div', { style: { height: 300 } }, h(DataGrid, { rows: [{ id: 1, a: 'x' }], columns: [{ field: 'a' }] }))));
// The MIT Community grid renders client-side only (useIsSSR), so it must merely not throw here.
for (const marker of ['Save', 'tecton-add-outline', 'MuiRichTreeView', 'Range', 'value="1,200"', 'Hello chat']) if (!html.includes(marker)) throw new Error('SSR output missing ' + marker);
console.log(Object.keys(root).length);
`,
);
try {
  const count = execFileSync(process.execPath, [ssr], {
    cwd: fixture,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
    .toString()
    .trim();
  pass(
    `root exports ${count} names; Button/NumberField/DataGrid/DateRangePicker/RichTreeView/ChatBox render on the server`,
  );
} catch (error) {
  fail(`SSR import check failed:\n${error.stderr?.toString() ?? error}`);
} finally {
  rmSync(ssr, { force: true });
}

console.log('3. tree shaking');
const { build } = await import(
  pathToFileURL(join(here, '../../node_modules/vite/dist/node/index.js')).href
);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const entries = {
  'button-subpath': `import Button from '@tecton-mui/ui/Button';
import Toolbar, { toolbarClasses } from '@tecton-mui/ui/Toolbar';
import { gridClasses } from '@tecton-mui/ui/Grid';\nexport default Button;\n`,
  'button-root': `import { Button } from '@tecton-mui/ui';\nexport default Button;\n`,
  'theme-provider': `import { ThemeProvider } from '@tecton-mui/ui/styles';\nexport default ThemeProvider;\n`,
};
// Implementation identifiers (class-name strings may legitimately appear in Tecton theme overrides).
const forbidden = {
  'Data Grid': /gridColumnDefinitionsSelector|GridRootStyles/,
  'Date pickers': /getPickerDayUtilityClass|usePickerAdapter/,
  'Tree view': /getTreeItemUtilityClass|useTreeViewApiRef/,
  'Base UI': /NumberFieldRootContext|useNumberFieldRootContext|@base-ui\//,
  'date-fns': /startOfWeek|differenceInCalendarDays/,
  'Tecton token CSS': /--tecton-color-text-primary:/,
  // The theme carries Chat corrections but must not import MUI X Chat itself.
  'MUI X Chat': /ChatComposerSendButton|createEchoAdapter|useChatStore/,
  'docs tooling': /@tanstack|pagefind|@mdx-js/,
};
for (const [name, source] of Object.entries(entries)) {
  const file = join(fixture, `.entry-${name}.js`);
  writeFileSync(file, source);
  try {
    const result = await build({
      root: fixture,
      logLevel: 'silent',
      configFile: false,
      build: {
        write: false,
        minify: false,
        lib: { entry: file, formats: ['es'], fileName: name },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
        },
      },
    });
    const code = (Array.isArray(result) ? result : [result])
      .flatMap((r) => r.output)
      .map((o) => o.code ?? '')
      .join('\n');
    writeFileSync(join(out, `${name}.js`), code);
    const leaks = Object.entries(forbidden).filter(([label, re]) =>
      name === 'theme-provider' && label === 'Tecton token CSS' ? false : re.test(code),
    );
    const kb = (Buffer.byteLength(code) / 1024).toFixed(0);
    if (leaks.length) fail(`${name} (${kb} KiB) pulls in: ${leaks.map(([l]) => l).join(', ')}`);
    else
      pass(
        `${name} bundle (${kb} KiB unminified) has no Data Grid / pickers / tree / Base UI / date-fns / tokens / docs code`,
      );
  } finally {
    rmSync(file, { force: true });
  }
}

console.log('4. stylesheets');
const global = readFileSync(join(ui, 'dist/styles/global.css'), 'utf8');
const components = readFileSync(join(ui, 'dist/styles/components.css'), 'utf8');
if (
  /@font-face/.test(global) &&
  /--tecton-icon-url/.test(global) &&
  /--tecton-space-100/.test(global)
)
  pass('global.css contains fonts, icons and tokens');
else fail('global.css is missing fonts, icons or tokens');
if (
  /--tecton-|:root|@font-face|\bhtml\b|\bbody\b/.test(components.replace(/\/\*[\s\S]*?\*\//g, ''))
)
  fail('components.css declares globals');
else pass('components.css declares no globals, resets or custom properties');
for (const font of [...global.matchAll(/url\("\.\/(assets\/fonts\/[^"]+)"\)/g)].map((m) => m[1])) {
  if (!existsSync(join(ui, 'dist/styles', font))) fail(`font ${font} missing from dist`);
}

if (failures) {
  console.error(`\n${failures} bundle check(s) failed.`);
  process.exit(1);
}
console.log('\nAll bundle checks passed.');
