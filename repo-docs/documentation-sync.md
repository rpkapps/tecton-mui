# Documentation sync

The consumer portal (`apps/docs`) shows the Material UI documentation of each Core and Lab component
(sections, prose and **all live examples that can run on this library**) under "Examples" on the
matching component page, rendered with `@tecton-mui/ui` and the Tecton theme. The content is
generated from the upstream docs by `tooling/docs-sync`. Synchronization is **manual and tied to
dependency upgrades** (SPEC §8.5): it runs only when a developer upgrades `@mui/material` /
`@mui/lab`, never on a schedule, and its output is reviewed in a PR.

## What may be synced

- Only documentation **verified to be reusable** under its license: the `mui/material-ui`
  repository (Material UI and Lab docs and demos) is MIT licensed ("MIT License, Copyright (c) 2014
  Call-Em-All"). The license and copyright notices are kept (see [Attribution](#attribution)).
- **Never** MUI X documentation: the `mui/mui-x` docs folder has no verified license, so nothing
  from it is synced, and commercial MUI X documentation, demos, screenshots or prose are always
  excluded. Pages for independently implemented Pro/Premium-equivalent features (`DataGrid` advanced
  features, range pickers, `RichTreeView` advanced features) are original content.
- The MUI MCP relay is for reference only. It gives no right to republish documentation.
- API tables are generated from our TypeScript exports (`apps/docs/scripts/generate-api.mjs`), not
  copied from upstream.

A private portal does not waive copyright or contractual obligations (SPEC §8.4).

## Files

| Path                                  | Owner     | Content                                                                   |
| ------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `tooling/docs-sync/manifest.json`     | reviewed  | Every upstream page considered, with its status and reason                |
| `tooling/docs-sync/slug-map.json`     | reviewed  | Which synced page (or which of its sections) renders on which portal slug |
| `tooling/docs-sync/icon-map.json`     | reviewed  | `@mui/icons-material` name → Tecton icon name for the docs-only icon shim |
| `tooling/docs-sync/sync.mjs`, `lib/`  | reviewed  | The sync (fetch, transform, emit, check)                                  |
| `tooling/docs-sync/verify-pages.mjs`  | reviewed  | Browser sweep of every synced page in light and dark mode                 |
| `tooling/docs-sync/sync-lock.json`    | generated | What was synced: pages, every demo with status/reason, icons, file hashes |
| `apps/docs/src/mui-docs/generated/**` | generated | One page module per portal slug, the adapted demos, the icon shim modules |
| `apps/docs/src/mui-docs/index.ts`     | reviewed  | `hasMuiDocs(slug)`, `<MuiDocsSection slug>`, `preloadMuiDocs(slug)`       |
| `apps/docs/src/mui-docs/runtime/**`   | reviewed  | Prose elements, demo frame + error boundary, icon shim component          |

**Never edit generated files.** `pnpm docs:sync --check` fails when a file under
`apps/docs/src/mui-docs/generated/` differs from the hash recorded in `sync-lock.json`, when a file
is missing or unexpected, or when the installed MUI versions differ from the synced ones. Generated
files are excluded from Prettier (`.prettierignore`) and ESLint (`eslint.config.js`); run Prettier
from the repository root so the ignore file applies.

## The manifest

`manifest.json` lists the upstream repositories per package (`upstream`: repo, tag prefix, license;
`@mui/lab` uses the `@mui/material` tag because Lab docs live in the same repository) and every
upstream page considered for the portal (`pages`):

| Field           | Required for           | Meaning                                                                     |
| --------------- | ---------------------- | --------------------------------------------------------------------------- |
| `package`       | all                    | Upstream npm package, which must be a key of `upstream`                     |
| `source`        | all                    | Path of the page in the upstream repository                                 |
| `status`        | all                    | `included`, `modified` or `excluded`                                        |
| `reason`        | `excluded`             | Why the page is not synced                                                  |
| `target`        | `included`, `modified` | Page id: generated demo folder and key in `slug-map.json`                   |
| `edits`         | `modified`             | Declarative `{ find, replace, reason }` edits; each must match exactly once |
| `patch`         | `modified` (or edits)  | File with local modifications to re-apply after a sync                      |
| `excludedDemos` | optional               | `{ "DemoName": "reason" }`: examples left out by hand (e.g. type errors)    |

| Status       | Meaning                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **included** | Synced with the mechanical adaptation rules below                                                    |
| **modified** | As included, plus the page's own `edits` (or `patch`)                                                |
| **excluded** | Never synced: commercial or unlicensed content, no matching portal page, MUI process or tooling page |

The sync fails when upstream lists a component page that the manifest does not mention, so new
upstream pages are always reviewed.

## Running it

```bash
pnpm docs:sync --check
```

Offline; CI runs it in the `docs` job. It validates the manifest (statuses, reasons, targets, no
commercial MUI X paths, only `mui/material-ui` sources), the slug map (every slug must be a portal
component page: an authored page or the auto page of an export that no authored page lists) and the
generated files against `sync-lock.json` (hashes, no missing or extra files, installed versions).

```bash
pnpm docs:sync --packages @mui/material,@mui/lab [--offline] [--refresh]
```

Run this after upgrading the listed packages (pass both: they share one upstream tag). It reads the
**installed** `@mui/material` version and fetches from `raw.githubusercontent.com` at the matching
tag (`v<version>`) into `node_modules/.cache/tecton-docs-sync/` (`--offline` uses only that cache,
`--refresh` ignores it). It then:

1. discovers the component pages from `docs/data/material/pages.ts` and the page modules in
   `docs/pages/material-ui/*.js` (pathname → markdown file);
2. parses each included page (`docs/data/material/components/<page>/<page>.md`): GFM plus MUI's
   `{{"demo": ...}}`, `{{"component": ...}}` (dropped: site chrome), `:::info|warning|...`
   callouts, `<codeblock>` groups and the `<p class="description">` lead;
3. adapts every demo (`<Name>.tsx`; a demo without a TypeScript source is excluded) and its local
   modules (`./top100Films` and similar), see below;
4. writes one page module per portal slug, the demos, the icon shim modules and `sync-lock.json`.

The result is a working-tree change. Nothing is committed or merged automatically.

### Demo adaptation

The demo logic is not changed. The mechanical rules are:

- `@mui/material/<X>` and `@mui/lab/<X>` → `@tecton-mui/ui/<X>` when the module is exported
  (`tooling/compatibility/export-inventory.json`); `@mui/material/styles` → `@tecton-mui/ui/styles`
  (whose `createTheme` starts from the Tecton theme); `@mui/system`, `@mui/utils` and
  `@emotion/react` names → the `@tecton-mui/ui` entry that exports them.
- Imports used only as types get an inline `type` modifier (the portal compiles with
  `verbatimModuleSyntax`).
- `@mui/icons-material/<Name>` stays as written. A Vite alias in `apps/docs/vite.config.ts` points it
  to a generated shim that renders the closest Tecton icon through `@tecton-mui/ui/Icon`
  (`icon-map.json`; unmapped names render a neutral fallback, listed in the lock). It accepts the
  SvgIcon props demos pass (`fontSize`, `color`, `htmlColor`, `titleAccess`, `sx`).
- MUI-site-relative asset URLs (`/static/...`, `/broken-image.jpg`) become `https://mui.com/...`.
- A demo is **excluded** (with the reason in the lock, and a short note on the page) when it imports
  a module `@tecton-mui/ui` does not export (deprecated Lab stubs, `@mui/material/Icon`), MUI X,
  MUI docs-site helpers or third-party packages the portal does not depend on (`react-window`,
  `notistack`, ...), or loads remote data or scripts.
- Demos that fail the docs typecheck or the browser sweep are excluded by hand in the manifest
  (`excludedDemos`) with the reason. If the cause is a library defect, report it; do not patch the
  demo.

### Prose adaptation

- Markdown is converted to TSX at sync time (no runtime markdown parser). Text is emitted as string
  expressions; prose elements use the portal's MDX component mapping.
- Upstream h2 sections render as h3 under the template's "Examples" h2 (they feed the table of
  contents). Anchors are unique per page, including against the authored content.
- Links to synced pages are rewritten to `/components/<slug>[#anchor]`, links to API pages to
  `/api/<slug>`, the MUI X Data Grid/Pickers/Tree View roots to our pages
  (`slug-map.json#externalRoutes`); everything else points to `https://mui.com`.
- Imports in prose code snippets are rewritten like demo imports.
- A note is added under each "Customization" heading: those examples restyle components beyond the
  Tecton defaults and are shown for the customization APIs only.

### Attribution

Every generated file starts with a header naming the upstream repository, tag, path and the MIT
license with "© Call-Em-All / Material-UI SAS and contributors" (the header is stripped from the
code shown to readers). Every synced page ends with: "Examples and text adapted from the
MIT-licensed Material UI documentation (v<version>), © Call-Em-All / Material-UI SAS and
contributors", with links to the source files.

## Verifying a sync

```bash
pnpm docs:sync --check
pnpm --filter @tecton-mui/docs typecheck   # type-checks every generated demo
pnpm --filter @tecton-mui/docs build       # prerender, Pagefind, internal link check
pnpm --filter @tecton-mui/docs preview --port 4520 &
node tooling/docs-sync/verify-pages.mjs --url http://localhost:4520 [--slug button,tabs]
```

`verify-pages.mjs` visits every synced slug in light and dark mode and fails on page errors, demos
that render nothing or hit their error boundary, and pages that lost their demos. Exclude failing
demos in the manifest with a reason (or fix the sync), then re-run the sync.

## Rules for the result

- Keep enterprise-specific text, Tecton styling, `@tecton-mui/ui` imports and the original
  advanced-feature content.
- Keep the information architecture and terminology familiar to MUI users, but use our branding.
  Do not copy MUI branding or trade dress.
- Version numbers do not need to match across MUI packages.

## Review checklist

Before approving a sync PR:

- [ ] Only the upgraded packages' pages changed, and every synced page is `included` or `modified`
      in the manifest; new upstream pages have a reviewed status
- [ ] License and copyright notices are present for reused content
- [ ] No MUI X content was introduced
- [ ] The `sync-lock.json` diff (demos excluded, icon fallbacks) was reviewed
- [ ] `pnpm docs:sync --check`, the docs typecheck and `pnpm --filter @tecton-mui/docs build` pass
- [ ] `verify-pages.mjs` passes in both modes; visual and accessibility tests pass
      (`pnpm test:e2e`)
- [ ] No contributor-only content was added to the portal

The portal contains consumer content only. Contributor documentation stays in this repository
(`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `repo-docs/`).
