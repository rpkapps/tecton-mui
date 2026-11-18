# Dependencies

Dependency updates are **manual** (SPEC §12.1). There is no Renovate or Dependabot. A developer
picks specific packages and versions, validates them, and opens a reviewed PR. Nothing merges
automatically.

## Policy

- **Exact pins.** `.npmrc` has `save-exact=true`. Runtime dependencies of `@tecton-mui/ui` are pinned
  exactly in `packages/ui/package.json`, and the lockfile pins everything else. CI installs with
  `pnpm install --frozen-lockfile`.
- **MUI families are pinned individually.** `@mui/material`, `@mui/system`, `@mui/utils` and
  `@mui/stylis-plugin-rtl` share one version, but `@mui/lab` and the `@mui/x-*` packages each have
  their own. Do not force matching patch numbers. Choose versions whose peer-dependency ranges are
  compatible and that pass the test suites.
- **Peer dependencies.** React and React DOM are peers of `@tecton-mui/ui` (`^19.0.0`). Because
  `strict-peer-dependencies=false`, pnpm reports peer conflicts as warnings. Treat every new warning
  as a blocker until it has been analysed.
- **No commercial or out-of-scope packages.** Never add `@mui/x-*-pro`, `@mui/x-*-premium`,
  `@mui/x-license`, `@mui/x-charts*` or `@mui/x-scheduler*` (ESLint also blocks the imports).
- **Keep the runtime graph small.** Documentation and test tools never become dependencies of
  `packages/ui`. Optional date libraries (`dayjs`, `luxon`, `moment`) stay out of the UI package's
  `dependencies`. `dayjs` is a dev dependency for tests only.
- **Notices.** A new runtime dependency of `@tecton-mui/ui` needs an entry in
  `packages/ui/THIRD_PARTY_NOTICES.md` with its license.

## Workflow

Both commands run `tooling/scripts/deps-update.mjs`. They query the registry with `npm view`, so
they need registry access.

```bash
pnpm deps:outdated
```

This prints a report: each runtime dependency of `@tecton-mui/ui` with its pinned version, the
latest version and, for `@mui/*` packages, the MUI peer constraints of that latest version. A `*`
marks a package with a newer version. Running the script with no arguments also prints the report.

```bash
pnpm deps:update @mui/material@9.6.0 @mui/system@9.6.0 @mui/utils@9.6.0
```

This updates the given packages. The script:

1. Accepts **exact versions only** (`name@x.y.z` or `name@x.y.z-pre`).
2. Checks the `@mui/*` peer constraints of the resulting set of pins and stops if one is not
   satisfied. Upgrade related packages together (for example `@mui/material`, `@mui/system`,
   `@mui/utils` and `@mui/stylis-plugin-rtl`).
3. Runs `pnpm --filter @tecton-mui/ui add --save-exact <specs>`, then `pnpm inventory`,
   `pnpm tecton:check`, `pnpm typecheck`, `pnpm test` and `pnpm test:bundle`, and stops at the
   first failure.
4. Prints the next steps.

The script changes only `packages/ui`. Other workspace pins, such as `@mui/x-data-grid` in
`tests/e2e/harness/package.json` and root tooling, are updated with plain pnpm, for example
`pnpm --filter @tecton-mui/e2e-harness add -E @mui/x-data-grid@<version>`.

After any update:

1. Review the lockfile diff and any peer-dependency warnings from `pnpm install`.
2. If an MUI package changed, follow [mui-upgrades.md](./mui-upgrades.md). In particular, review the
   diffs of the generated exports and `tooling/compatibility/export-inventory.json`.
3. Run what the script does not:

   ```bash
   pnpm lint && pnpm format:check
   pnpm test:coverage && pnpm test:e2e
   pnpm --filter @tecton-mui/docs build
   ```

4. If MUI packages changed, run the documentation sync for them:
   `pnpm docs:sync --packages <changed packages>` ([documentation-sync.md](./documentation-sync.md)).
5. Add a changeset when a published package's dependencies changed.
6. Open a PR that lists the old and new versions and the reason, and links the upstream
   changelogs.

## Special cases

- **Tecton** is not an npm dependency. Its version is pinned in
  `packages/tecton-adapter/tecton.config.json` and updated with the adapter
  ([tecton-integration.md](./tecton-integration.md#upgrading-tecton)).
- **`@mui/mcp`** is pinned exactly in `packages/mcp`. The relay refuses to start if the installed
  version differs. Upgrade steps are in [packages/mcp/README.md](../packages/mcp/README.md#versioning-policy).
- **Tooling** (TypeScript, Vite, Vitest, Playwright, ESLint, Prettier, Changesets) is pinned in the
  root `package.json` and in the app packages. After a Playwright upgrade, CI downloads the matching
  browser. Locally, run `pnpm exec playwright install chromium`, or point
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE` at a compatible browser.
- **pnpm** itself is pinned by `packageManager`. Change it in a separate PR.
