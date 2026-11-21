# Development

## Setup

- Node.js **22+** (root `engines`). The MCP relay needs 22.12+.
- pnpm **10.28.0** (`packageManager`). With Corepack: `corepack enable`.

```bash
pnpm install --frozen-lockfile
```

`.npmrc` sets `save-exact=true` (new dependencies are pinned exactly),
`auto-install-peers=false` and `strict-peer-dependencies=false`. Peer-dependency warnings are
therefore not fatal. Read them, especially after dependency changes
([dependencies.md](./dependencies.md)).

The workspace packages are listed in `pnpm-workspace.yaml`: `packages/*`, `apps/*`,
`tooling/bundle-tests/fixture` and `tests/e2e/harness`.

### Line endings

`.gitattributes` keeps every text file LF in the working tree on every platform
(`* text=auto eol=lf`), whatever `core.autocrlf` is set to. Prettier and `pnpm inventory` write
LF, and `pnpm tecton:check` compares raw bytes, so a CRLF checkout fails `pnpm format:check` and
`pnpm tecton:check` and makes `pnpm inventory` rewrite every generated file. The vendored Tecton
artifacts and the checksummed generator output (Tecton `emit`, `docs:sync`) are `-text`, so git
never converts them, and fonts and images are `binary`. Add new byte-exact or binary paths there.

A clone made before `.gitattributes` existed keeps its CRLF files until they are checked out again.
Commit or stash your work first, because this discards uncommitted changes, then run once:

```bash
git rm -rq --cached . && git reset --hard
```

## Day-to-day commands

```bash
pnpm typecheck            # all packages
pnpm lint                 # ESLint
pnpm format               # Prettier --write (use format:check in CI)
pnpm test                 # Vitest, all packages
pnpm vitest packages/ui/src/DataGrid   # Vitest in watch mode for one folder
pnpm test:e2e             # Playwright (see testing.md)
```

You do not need to build `packages/ui` for tests, the docs portal or the Playwright harness. They
resolve `@tecton-mui/ui` to its TypeScript sources through the `@tecton-mui/source` export
condition (see [architecture.md](./architecture.md#source-condition)). Build only to check the
published output:

```bash
pnpm --filter @tecton-mui/ui build     # dist/ (ESM + .d.ts + styles)
pnpm test:bundle                       # checks dist/ through a consumer fixture
```

## Docs portal

```bash
pnpm --filter @tecton-mui/docs dev       # generate API data, then the Vite dev server
pnpm --filter @tecton-mui/docs build     # static site in apps/docs/dist (prerendered, Pagefind)
pnpm --filter @tecton-mui/docs preview
```

Set `DOCS_BASE=/<repository>/` when building for a GitHub Pages project site. Never publish
confidential content to an unauthenticated Pages endpoint; private hosting is not decided yet
(SPEC §8.1).

## Playwright harness

The harness (`tests/e2e/harness`) renders scenarios selected by query string, for example
`/?scenario=grid:all&mode=dark`, `/?scenario=showcase&dir=rtl`, `/?scenario=multi-root` and the
server-rendered `/ssr`. To run it by hand:

```bash
node tests/e2e/harness/server.mjs 4310
```

## Working on the export surface

- **New standard MUI component** (after an upgrade): run `pnpm inventory`. Never write a
  passthrough by hand.
- **New hand-written module**: create `packages/ui/src/<Name>/index.ts` without the
  `AUTO-GENERATED` marker, then run `pnpm inventory`. The script adds the subpath to the
  `exports` map and the names to the root barrel, and lists the module in the inventory. If a
  passthrough of the same name existed, the generator stops generating it.
- Commit the regenerated `packages/ui/src/index.ts`, `packages/ui/package.json` and
  `tooling/compatibility/export-inventory.json` together with your change.

## Working on Tecton output

`pnpm --filter @tecton-mui/tecton-adapter emit` regenerates
`packages/ui/src/styles/tecton/generated/**` and `packages/ui/assets/tecton/**` from the vendored
artifacts. It works offline. Change the adapter (`src/normalized/*`), never the generated files. See
[tecton-integration.md](./tecton-integration.md).

## Editor and AI tooling

- [AGENTS.md](../AGENTS.md) holds the rules for AI coding agents.
- For MUI documentation lookups, configure the MCP relay from
  [packages/mcp/README.md](../packages/mcp/README.md) (`pnpm exec tecton-mui-mcp`). Build it first
  with `pnpm --filter @tecton-mui/mcp build`.

## Generated and ignored paths

| Path                                                        | Produced by                 | Committed |
| ----------------------------------------------------------- | --------------------------- | --------- |
| `packages/ui/src/**/index.ts` with marker, `src/index.ts`   | `pnpm inventory`            | Yes       |
| `packages/ui/src/internal/passthrough/**`                   | `pnpm inventory`            | Yes       |
| `tooling/compatibility/export-inventory.json`               | `pnpm inventory`            | Yes       |
| `packages/ui/src/styles/tecton/generated/**`                | Tecton adapter `emit`       | Yes       |
| `packages/ui/assets/tecton/**`                              | Tecton adapter `emit`       | Yes       |
| `packages/tecton-adapter/vendor/<version>/**`               | `pnpm tecton:sync`          | Yes       |
| `apps/docs/src/generated/**`                                | docs `generate:api`         | No        |
| `apps/docs/src/routeTree.gen.ts`                            | TanStack Router Vite plugin | Yes       |
| `dist/`, `coverage/`, `playwright-report/`, `test-results/` | builds and test runs        | No        |

Prettier ignores the generated Tecton output, the assets, the vendored artifacts and
`apps/docs/src/generated` (see `.prettierignore`). ESLint ignores the generated Tecton output, the
passthroughs and the vendor directory.
