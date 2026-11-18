#!/usr/bin/env node
// Manual dependency update workflow (SPEC §12.1). No bots; a developer chooses packages/versions.
//   pnpm deps:outdated                         report outdated deps + MUI family peer constraints
//   pnpm deps:update @mui/material@9.6.0 ...   pin exact versions in packages/ui, then validate
// After an update: review the inventory diff, run `pnpm docs:sync --packages <changed MUI pkgs>`,
// add a changeset and open a PR. Nothing is merged automatically.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MUI = /^@mui\//;
const run = (cmd, args, opts = {}) => {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd: repo, stdio: 'inherit', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed`);
};
const view = (spec, field) => {
  try {
    return JSON.parse(
      execFileSync('npm', ['view', spec, field, '--json'], { encoding: 'utf8' }) || 'null',
    );
  } catch {
    return null;
  }
};

function uiDependencies() {
  const pkg = JSON.parse(readFileSync(join(repo, 'packages/ui/package.json'), 'utf8'));
  return pkg.dependencies ?? {};
}

function report() {
  const deps = uiDependencies();
  console.log('Package                       pinned        latest        peer constraints');
  for (const [name, pinned] of Object.entries(deps)) {
    const latest = view(name, 'version');
    const peers = MUI.test(name) ? view(`${name}@${latest}`, 'peerDependencies') : null;
    const muiPeers = peers
      ? Object.entries(peers)
          .filter(([p]) => MUI.test(p))
          .map(([p, r]) => `${p} ${r}`)
          .join(', ')
      : '';
    const flag = latest && latest !== pinned ? '*' : ' ';
    console.log(
      `${flag} ${name.padEnd(28)} ${String(pinned).padEnd(13)} ${String(latest).padEnd(13)} ${muiPeers}`,
    );
  }
  console.log(
    '\n* = newer version available. MUI Core/Lab/X do not need identical patch versions (SPEC §3).',
  );
}

function checkPeers(specs) {
  const deps = { ...uiDependencies() };
  for (const spec of specs) {
    const at = spec.lastIndexOf('@');
    deps[spec.slice(0, at)] = spec.slice(at + 1);
  }
  const problems = [];
  for (const [name, version] of Object.entries(deps)) {
    if (!MUI.test(name)) continue;
    const peers = view(`${name}@${version}`, 'peerDependencies') ?? {};
    for (const [peer, range] of Object.entries(peers)) {
      if (!deps[peer]) continue;
      const ok = execFileSync(
        'node',
        [
          '-e',
          `process.stdout.write(String(require('semver').satisfies(${JSON.stringify(deps[peer])}, ${JSON.stringify(range)})))`,
        ],
        {
          cwd: join(repo, 'node_modules/.pnpm/node_modules'),
          encoding: 'utf8',
        },
      );
      if (ok !== 'true')
        problems.push(`${name}@${version} requires ${peer} ${range}, pinned ${deps[peer]}`);
    }
  }
  return problems;
}

const args = process.argv.slice(2);
if (args.includes('--report') || args.length === 0) {
  report();
  process.exit(0);
}
const specs = args.filter((a) => !a.startsWith('--'));
for (const spec of specs) {
  if (!/^@?[^@]+@\d+\.\d+\.\d+(-[\w.]+)?$/.test(spec))
    throw new Error(`Use exact versions: ${spec}`);
}
const problems = checkPeers(specs);
if (problems.length) {
  console.error('Peer dependency constraints are not satisfied:\n  ' + problems.join('\n  '));
  process.exit(1);
}
run('pnpm', ['--filter', '@tecton-mui/ui', 'add', '--save-exact', ...specs]);
run('pnpm', ['inventory']);
run('pnpm', ['tecton:check']);
run('pnpm', ['typecheck']);
run('pnpm', ['test']);
run('pnpm', ['test:bundle']);
const changedMui = specs.map((s) => s.slice(0, s.lastIndexOf('@'))).filter((n) => MUI.test(n));
console.log('\nUpdate validated. Next steps:');
console.log('  - review tooling/compatibility/export-inventory.json and the lockfile diff');
if (changedMui.length) console.log(`  - pnpm docs:sync --packages ${changedMui.join(',')}`);
console.log('  - pnpm test:e2e (visual/a11y), pnpm changeset, open a PR (no automatic merge)');
