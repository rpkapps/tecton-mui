# Contributing

This guide covers the contributor workflow. The coding rules in [AGENTS.md](./AGENTS.md) apply to
everyone, human or AI. Setup details are in [repo-docs/development.md](./repo-docs/development.md).

## Prerequisites

- Node.js **22 or later** (`engines` in the root `package.json`; `@tecton-mui/mcp` needs 22.12+).
- pnpm **10.28.0**, the version pinned in `packageManager`. With Corepack: `corepack enable`.

```bash
pnpm install --frozen-lockfile
pnpm test
```

## Workflow

1. **Branch** from `dev` (the base branch for Changesets and CI). Use a short, descriptive branch
   name (for example
   `datagrid-row-pinning-keyboard` or `fix-picker-rtl-focus`). One topic per branch.
2. **Make the change** following [AGENTS.md](./AGENTS.md). Keep generated files generated: run
   `pnpm inventory` or the Tecton adapter instead of editing their output.
3. **Test** locally (see [Tests](#tests)).
4. **Add a changeset** if a published package changes (see [Changesets](#changesets)).
5. **Open a pull request.** Fill in the [checklist](#pull-request-checklist). CI must pass, and a
   reviewer must approve. Nothing merges automatically, including dependency and documentation
   synchronization PRs.

Keep PRs reviewable. Do not mix a dependency or MUI upgrade with feature work. Upgrades get their
own PR ([repo-docs/mui-upgrades.md](./repo-docs/mui-upgrades.md)).

### Commits

Write commit messages in the imperative mood ("Add row pinning keyboard support"), with a body
that explains _why_ when that is not obvious. Commits that only regenerate output (`pnpm
inventory`, Tecton `emit`) should say so.

## Changesets

The published packages are `@tecton-mui/ui` and `@tecton-mui/mcp`. They are versioned
independently. Every PR that changes what a published package ships (code, types, styles, README or
dependencies) needs a changeset:

```bash
pnpm changeset
```

Pick the package or packages, the semver bump, and write a consumer-facing summary. Internal-only
changes (tests, CI, repo docs, the private packages `@tecton-mui/tecton-adapter`,
`@tecton-mui/docs`, `@tecton-mui/e2e-harness` and the bundle-test fixture) do not need one.
Versioning and publishing are described in [repo-docs/releasing.md](./repo-docs/releasing.md).

## Tests

| Command                | What it runs                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm lint`            | ESLint (flat config), including the bans on commercial MUI X imports and MUI internals    |
| `pnpm format:check`    | Prettier                                                                                  |
| `pnpm typecheck`       | `tsc --noEmit` in every workspace package that defines `typecheck`                        |
| `pnpm inventory:check` | Generated exports, root barrel, `exports` map and inventory are up to date                |
| `pnpm tecton:check`    | Vendored Tecton checksums are valid, and the generated Tecton output matches the adapter  |
| `pnpm test`            | Vitest unit, component and API tests                                                      |
| `pnpm test:coverage`   | Vitest with v8 coverage; statements, branches, functions and lines must each reach 80%    |
| `pnpm test:bundle`     | Consumer fixture: exports map, Node ESM/SSR import, tree shaking, stylesheet entry points |
| `pnpm test:e2e`        | Playwright: interactions, SSR/hydration, multiple roots, RTL, axe accessibility, visuals  |

Details, including how to run Playwright with a preinstalled browser and how to update visual
baselines, are in [repo-docs/testing.md](./repo-docs/testing.md).

## Pull request checklist

Copy this into the PR description and tick what applies:

```markdown
- [ ] Follows AGENTS.md: passthrough-first, MUI-compatible API, Tecton only via adapter/theme
- [ ] No commercial MUI X code, docs or assets used, copied or imitated
- [ ] No generated file edited by hand; `pnpm inventory:check` and `pnpm tecton:check` pass
- [ ] Tests added/updated (including render-count tests for advanced-component interactions)
- [ ] `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test:coverage` pass
- [ ] `pnpm test:bundle` passes (if exports, entry points or dependencies changed)
- [ ] `pnpm test:e2e` passes (if rendering, interaction, theming or accessibility changed)
- [ ] Accessibility checked in light and dark mode and in RTL; exceptions documented below
- [ ] Consumer docs (apps/docs) and packages/ui/README.md updated for public API changes
- [ ] Support matrix updated (DataGrid public types, RichTreeView or range picker SUPPORT.md)
- [ ] THIRD_PARTY_NOTICES.md updated if a runtime dependency was added
- [ ] Changeset added (or not needed: internal-only change)
```

## Accessibility exceptions

The library targets **WCAG 2.2 AA**. Automated checks alone do not establish compliance.
Responsibilities are split (SPEC §11.3):

- **Tecton owners:** visual tokens, meaning color contrast, font and icon affordances and visual
  states.
- **Library owners:** semantics, keyboard behavior, ARIA, focus management, interaction and correct
  token use.

In the PR report, keep upstream Tecton token defects separate from implementation defects. An
**unapproved accessibility regression blocks the merge.**

A Tecton-related exception can be merged through a PR only if all of the following are true:

1. It is recorded in [`tests/e2e/a11y-exceptions.json`](./tests/e2e/a11y-exceptions.json) with
   every field filled in:

   ```json
   {
     "rule": "color-contrast",
     "scenario": "pickers",
     "owner": "Tecton design-token owners",
     "rationale": "Disabled-day text token is below 4.5:1 in dark mode; upstream defect.",
     "approvedBy": "<reviewer>",
     "followUp": "<link to the tracking issue>"
   }
   ```

   `rule` is the axe rule id. `scenario` is a harness scenario, or `*` for all of them.

2. The PR description explains the exception and links the follow-up issue.
3. A reviewer explicitly approves the exception in the PR review.
4. The follow-up issue stays open until the upstream fix lands, and the entry is removed then.

An approved exception only stops the axe test from failing for that rule. It is **not** reported
as compliant, and the docs portal's accessibility notes must list it as a known limitation.
Exceptions for implementation defects (semantics, keyboard, ARIA, focus) are not accepted; fix the
defect instead.

## Reporting problems

Open an issue with the package version, the pinned MUI and Tecton versions (`TECTON_VERSION` from
`@tecton-mui/ui/styles`), a minimal reproduction and the expected MUI behavior, with a link to the
version-pinned MUI documentation.
