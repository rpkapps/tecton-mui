# tecton-mui

A pnpm monorepo for a private, enterprise React component library: MUI-compatible components and
APIs, preconfigured with the Tecton design system. Standard components are direct re-exports of
MIT-licensed MUI Core, Lab and MUI X Community packages. A unified Data Grid, range pickers and an
enhanced Rich Tree View are implemented independently, without commercial MUI X code.

The design decisions are recorded in [SPEC.md](./SPEC.md). This README is for contributors.
Consumers should read [packages/ui/README.md](./packages/ui/README.md) and the docs portal
(`__DOCS_URL__`, not deployed yet).

> **Provisional names.** `@tecton-mui/ui` and `@tecton-mui/mcp` are placeholders (SPEC §15.8).
> The docs URL (`__DOCS_URL__`) and the private registry are also undecided. See
> [repo-docs/releasing.md](./repo-docs/releasing.md#renaming-the-packages) for where to rename them.

## Workspace map

| Path                                                   | Package                        | Published | Purpose                                                                                                                         |
| ------------------------------------------------------ | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/ui`](./packages/ui/README.md)               | `@tecton-mui/ui`               | Yes       | The UI package: passthrough exports, Tecton `styles`, `Icon`, `LocalizationProvider`, `DataGrid`, range pickers, `RichTreeView` |
| [`packages/tecton-adapter`](./packages/tecton-adapter) | `@tecton-mui/tecton-adapter`   | No        | Build-time Tecton source adapter. Vendors the pinned Tecton artifacts and emits the normalized theme into `packages/ui`         |
| [`packages/mcp`](./packages/mcp/README.md)             | `@tecton-mui/mcp`              | Yes       | Transparent stdio relay to the pinned official MUI MCP server                                                                   |
| [`apps/docs`](./apps/docs)                             | `@tecton-mui/docs`             | No        | Consumer docs portal (TanStack Router + Vite + MDX, prerendered static output, Pagefind search)                                 |
| [`tests/e2e`](./tests/e2e)                             | `@tecton-mui/e2e-harness`      | No        | Playwright specs and the harness app they drive                                                                                 |
| [`tooling/compatibility`](./tooling/compatibility)     | (not a package)                | -         | `generate-exports.mjs` and the generated `export-inventory.json`                                                                |
| [`tooling/bundle-tests`](./tooling/bundle-tests)       | `@tecton-mui/consumer-fixture` | No        | Consumer fixture and packaging checks against the built package                                                                 |
| [`tooling/docs-sync`](./tooling/docs-sync)             | (not a package)                | -         | Manual MUI documentation synchronization (`pnpm docs:sync`)                                                                     |
| [`tooling/scripts`](./tooling/scripts)                 | (not a package)                | -         | Manual dependency update script (`pnpm deps:outdated`, `pnpm deps:update`)                                                      |
| [`repo-docs`](./repo-docs)                             | -                              | -         | Contributor documentation (below)                                                                                               |

There is no Turborepo. Root scripts call `pnpm --filter` or plain Node scripts.

## Quick start

Requirements: Node.js 22+, pnpm 10.28.0 (`corepack enable`).

```bash
pnpm install --frozen-lockfile
pnpm test               # Vitest
pnpm build              # UI package, MCP relay, docs portal
pnpm --filter @tecton-mui/docs dev   # docs portal dev server
```

## Commands

| Command                                           | Description                                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm build`                                      | Build `@tecton-mui/ui`, then `@tecton-mui/mcp`, then the docs portal                      |
| `pnpm typecheck`                                  | `tsc --noEmit` in every package that defines `typecheck`                                  |
| `pnpm lint` / `pnpm format` / `pnpm format:check` | ESLint / Prettier write / Prettier check                                                  |
| `pnpm test` / `pnpm test:coverage`                | Vitest, optionally with the 80% coverage thresholds                                       |
| `pnpm test:e2e`                                   | Playwright (harness on port 4310)                                                         |
| `pnpm test:bundle`                                | Consumer packaging, SSR import and tree-shaking checks (builds `packages/ui` if needed)   |
| `pnpm inventory` / `pnpm inventory:check`         | Regenerate or verify passthrough modules, root barrel, `exports` map and export inventory |
| `pnpm tecton:sync`                                | Download the pinned Tecton artifacts (network) and emit the generated output              |
| `pnpm tecton:check`                               | Verify vendored Tecton checksums and the generated output (offline)                       |
| `pnpm deps:outdated` / `pnpm deps:update`         | Manual dependency report / update                                                         |
| `pnpm docs:sync`                                  | Manual MUI documentation synchronization                                                  |
| `pnpm changeset` / `pnpm version-packages`        | Add a changeset / apply changesets to versions and changelogs                             |

## Documentation

- [AGENTS.md](./AGENTS.md): authoritative rules for AI coding agents (and everyone else)
- [CONTRIBUTING.md](./CONTRIBUTING.md): workflow, changesets, PR checklist, accessibility exceptions
- [repo-docs/architecture.md](./repo-docs/architecture.md): packages, layers and boundaries
- [repo-docs/development.md](./repo-docs/development.md): local setup and day-to-day commands
- [repo-docs/dependencies.md](./repo-docs/dependencies.md): manual dependency updates
- [repo-docs/testing.md](./repo-docs/testing.md): Vitest, Playwright, bundle tests, coverage, CI
- [repo-docs/tecton-integration.md](./repo-docs/tecton-integration.md): the Tecton adapter and theme
- [repo-docs/mui-upgrades.md](./repo-docs/mui-upgrades.md): upgrading MUI Core/Lab/X
- [repo-docs/documentation-sync.md](./repo-docs/documentation-sync.md): synchronizing MUI docs
- [repo-docs/releasing.md](./repo-docs/releasing.md): versioning, publishing, renaming
- [packages/ui/THIRD_PARTY_NOTICES.md](./packages/ui/THIRD_PARTY_NOTICES.md): licenses and
  attributions

## Legal guardrails

The UI package uses MIT-licensed MUI packages only. Commercial MUI X packages (`*-pro`,
`*-premium`, `@mui/x-license`), MUI X Charts and MUI X Scheduler must never be imported. ESLint
enforces this. Commercial MUI X documentation, code and assets are never copied or imitated. See
SPEC Appendix B.
