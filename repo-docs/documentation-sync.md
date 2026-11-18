# Documentation sync

The consumer portal (`apps/docs`) may reuse eligible MUI documentation, adapted to our imports and
Tecton styling. Synchronization is **manual and tied to dependency upgrades** (SPEC §8.5). It runs
only when a developer upgrades the relevant MUI package, never on a schedule, and its output is
reviewed in a PR.

## What may be synced

- Only source documentation **verified to be reusable** under its license (MIT-licensed MUI Core
  and Community docs), with the required license and copyright notices kept.
- **Never** commercial MUI X documentation, demos, screenshots or prose. Pages for independently
  implemented Pro/Premium-equivalent features (`DataGrid` advanced features, range pickers,
  `RichTreeView` advanced features) are original content and are never synced.
- The MUI MCP relay is for reference only. It gives no right to republish documentation.
- API tables are generated from our TypeScript exports (`apps/docs/scripts/generate-api.mjs`), not
  copied from upstream.

A private portal does not waive copyright or contractual obligations (SPEC §8.4).

## The manifest

`tooling/docs-sync/manifest.json` lists the upstream repositories per package (`upstream`: repo,
tag prefix and license) and every upstream page considered for the portal (`pages`):

| Field     | Required for           | Meaning                                                              |
| --------- | ---------------------- | -------------------------------------------------------------------- |
| `package` | all                    | Upstream npm package, which must be a key of `upstream`              |
| `source`  | all                    | Path of the page in the upstream repository                          |
| `status`  | all                    | `included`, `modified` or `excluded`                                 |
| `reason`  | `excluded`             | Why the page is not synced                                           |
| `target`  | `included`, `modified` | Output path under `apps/docs/src/content/upstream/`                  |
| `patch`   | `modified`             | File with our local modifications, which are re-applied after a sync |

| Status       | Meaning                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **included** | Copied with mechanical adaptation (imports rewritten, license header added)                                   |
| **modified** | Adapted; our edits are kept in the `patch` file and re-applied after each sync                                |
| **excluded** | Never synced: commercial content, pages written originally for the portal, upsell or contributor-only content |

## Running it

```bash
pnpm docs:sync --check
```

Validates the manifest. CI runs this in the `docs` job. It fails when a package is unknown, a
status is invalid, an excluded page has no `reason`, an included or modified page has no `target`,
a modified page has no `patch`, or an included or modified `source` matches a known commercial MUI
X documentation path (Data Grid grouping, aggregation, pivoting, tree data, master/detail,
clipboard, cell selection, pinning and server-side data; range pickers; Rich Tree View ordering and
lazy loading).

```bash
pnpm docs:sync --packages @mui/material,@mui/lab
```

Run this after upgrading the listed packages. For each package, it reads the **installed** (pinned)
version and fetches the `included` and `modified` pages from `raw.githubusercontent.com` at the
matching tag (network required). It then:

- rewrites `@mui/material` and `@mui/lab` imports to `@tecton-mui/ui`. Other imports are left
  as they are and must be reviewed.
- prepends a header with the source repository, tag, path, license and copyright.
- writes the page to `apps/docs/src/content/upstream/<target>`.

For `modified` pages, the script only reminds you to apply the `patch` file. Re-apply the local
modifications yourself and review the diff. The result is a working-tree change. Nothing is
committed or merged automatically.

## Rules for the result

- Keep enterprise-specific text, Tecton styling, `@tecton-mui/ui` imports and the original
  advanced-feature content.
- Keep the information architecture and terminology familiar to MUI users, but use our branding.
  Do not copy MUI branding or trade dress.
- Version numbers do not need to match across MUI packages. Sync only the pages of the packages
  that were upgraded.

## Review checklist

Before approving a sync PR:

- [ ] Only pages of the upgraded packages changed, and every page is `included` or `modified` in
      the manifest
- [ ] License and copyright notices are present for reused content
- [ ] No commercial MUI X content was introduced
- [ ] `pnpm --filter @tecton-mui/docs build` passes (API generation, prerender, Pagefind, internal
      link check)
- [ ] Live examples use public `@tecton-mui/ui` imports and render correctly
- [ ] Visual and accessibility tests pass (`pnpm test:e2e`)
- [ ] No contributor-only content was added to the portal

The portal contains consumer content only. Contributor documentation stays in this repository
(`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `repo-docs/`).
