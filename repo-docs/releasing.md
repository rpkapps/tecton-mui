# Releasing

## Published packages

| Package           | Contents                                       | Versioned     |
| ----------------- | ---------------------------------------------- | ------------- |
| `@tecton-mui/ui`  | `dist/`, `README.md`, `THIRD_PARTY_NOTICES.md` | Independently |
| `@tecton-mui/mcp` | `dist/` (bin `tecton-mui-mcp`), `README.md`    | Independently |

Both have `"license": "UNLICENSED"` and `publishConfig.access: "restricted"`. All other workspace
packages are private and never published: `@tecton-mui/tecton-adapter`, `@tecton-mui/docs`,
`@tecton-mui/e2e-harness` and `@tecton-mui/consumer-fixture`.

## Changesets

Configuration: `.changeset/config.json`.

- `baseBranch: "dev"`, `access: "restricted"`, `commit: false` (versioning never commits by
  itself).
- The private packages above are listed in `ignore`.
- The changelog uses the default `@changesets/cli/changelog` format and is written to `CHANGELOG.md`
  in each published package.

```bash
pnpm changeset          # describe a change (package, semver bump, consumer-facing summary)
pnpm version-packages   # changeset version: apply pending changesets to versions and CHANGELOG.md
```

Rules for bumps:

- **Major:** removing or renaming a public export or subpath, a breaking prop or type change, an
  upstream removal surfaced through the inventory, removed Tecton icon names, or raising the React
  peer range.
- **Minor:** new components, props or features, MUI or Tecton upgrades without breaking changes,
  and new `@mui/mcp` upstream versions (they can change the tools that clients see; see
  [packages/mcp/README.md](../packages/mcp/README.md#versioning-policy)).
- **Patch:** fixes that change no public API.

Write summaries for consumers. The `@tecton-mui/ui` changelog is shown on the docs portal's
Releases → Changelog page.

## Release procedure

1. Make sure `dev` is green in CI.
2. Run `pnpm version-packages` on a release branch. Review the version bumps and the generated
   `CHANGELOG.md` entries, edit the wording if needed, and open a PR.
3. After the PR is merged, build the packages (`pnpm --filter @tecton-mui/ui build`,
   `pnpm --filter @tecton-mui/mcp build`) and run `pnpm test:bundle` against the built UI package.
4. Publish (see below) and tag the release commit.

### Publishing (deferred)

The private registry is **not decided yet** (SPEC §15.3): host, credentials, release permissions
and consumer `.npmrc` setup are all open. Until then, no publish command or CI publish job is
configured, and packages are consumed from the workspace. When the registry is chosen, document
here:

- the registry URL and scope mapping for `.npmrc`
- the authentication mechanism for CI and maintainers
- the publish command (for example `pnpm changeset publish`) and who may run it
- the installation instructions in `packages/ui/README.md` and `packages/mcp/README.md`

### Docs deployment is separate

Publishing the npm packages and deploying the docs portal are separate steps (SPEC §12.3). The
portal builds to static files (`apps/docs/dist`) that are compatible with GitHub Pages. Set
`DOCS_BASE`. Private hosting and access control are **not decided yet**. Never deploy confidential
content to an unauthenticated Pages site.

## Traceability

Each release must be traceable to the versions it was tested with:

- MUI versions: `tooling/compatibility/export-inventory.json` (`versions`) and
  `packages/ui/package.json`.
- Tecton version and artifact sources: `packages/ui/assets/tecton/provenance.json`, the checksums
  in `packages/tecton-adapter/vendor/<version>/manifest.json`, and `TECTON_VERSION` exported from
  `@tecton-mui/ui/styles`.
- Upstream MCP version: the exact `@mui/mcp` pin in `packages/mcp/package.json`.

Mention MUI and Tecton version changes in the changeset summary.

## Renaming the packages

`@tecton-mui/ui`, `@tecton-mui/mcp` and the `__DOCS_URL__` placeholder are provisional (SPEC
§15.8). When the final names are decided, rename them in one dedicated PR:

1. **Package names:** `name` in `packages/ui/package.json` and `packages/mcp/package.json`. Also
   rename the private packages (`packages/tecton-adapter`, `apps/docs`, `tests/e2e/harness`,
   `tooling/bundle-tests/fixture`) if their scope changes.
2. **Workspace references:** the `workspace:*` dependencies in `apps/docs`, `tests/e2e/harness` and
   `tooling/bundle-tests/fixture`, and the `--filter` arguments in the root `package.json`
   scripts, `.github/workflows/ci.yml` and `tooling/scripts/deps-update.mjs`.
3. **Source export condition:** `@tecton-mui/source` is written by
   `tooling/compatibility/generate-exports.mjs` and read by `vitest.config.ts`,
   `apps/docs/vite.config.ts` and `tests/e2e/harness/vite.config.ts`. Rename it in all four places,
   or keep it (it is internal).
4. **Imports and strings:** search the whole repository for `@tecton-mui/`. This includes docs
   content and demos (`apps/docs/src`), harness scenarios, `tooling/bundle-tests/run.mjs`, the
   docs-sync import rewrite in `tooling/docs-sync/sync.mjs`, generator messages, banners in
   `packages/ui/scripts/build.mjs`, the Tecton adapter header (`normalize.mjs`, `scripts/tecton.mjs`),
   `.changeset/*.md` and all Markdown docs.
5. **Docs URL:** replace `__DOCS_URL__` in `packages/ui/README.md`.
6. **Regenerate and verify:** `pnpm install`, `pnpm inventory`,
   `pnpm --filter <adapter> emit`, then the full test suite (`pnpm test:coverage`,
   `pnpm test:bundle`, `pnpm test:e2e`, docs build).
7. Add a changeset that explains the rename to consumers (a major bump, because the import paths
   change).
