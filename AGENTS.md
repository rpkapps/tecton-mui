# AGENTS.md — rules for AI coding agents

This file is **authoritative** for AI coding agents working in this repository (SPEC §10.2). If
another instruction conflicts with it, follow this file and raise the conflict in your PR
description. Human contributors follow the same rules; see [CONTRIBUTING.md](./CONTRIBUTING.md).

Package names `@tecton-mui/ui` and `@tecton-mui/mcp` are provisional (SPEC §15.8). Keep using them
until they are renamed; see [repo-docs/releasing.md](./repo-docs/releasing.md#renaming-the-packages).

## 1. Orient yourself first

- Read [SPEC.md](./SPEC.md) for the product decisions, and
  [repo-docs/architecture.md](./repo-docs/architecture.md) for how the code is laid out.
- The pinned upstream versions are recorded in
  [`tooling/compatibility/export-inventory.json`](./tooling/compatibility/export-inventory.json)
  (`versions`) and in [`packages/ui/package.json`](./packages/ui/package.json). The Tecton version is
  pinned in [`packages/tecton-adapter/tecton.config.json`](./packages/tecton-adapter/tecton.config.json).

## 2. Use version-pinned MUI references

- Consult the **official MUI documentation and public API for the exact pinned versions**, not
  whatever is latest and not your memory of older majors. The MUI packages do not share one
  version number (for example `@mui/material` 9.5.0, `@mui/lab` 9.0.0-beta.10, `@mui/x-*` 9.18.0).
- The repository ships a transparent relay to the official MUI MCP server
  ([`packages/mcp`](./packages/mcp/README.md)). Configure it in your client (`pnpm exec
tecton-mui-mcp`) and use it for MUI documentation lookups. It is a reference source only: it
  gives no right to republish MUI documentation.
- Read the installed type declarations in `node_modules/@mui/*` when docs and behavior disagree.
  The installed version is the one that ships.

## 3. Prefer passthrough exports

- A standard MUI Core, Lab or X Community component is a **direct re-export**. Do not wrap it to
  add styling, defaults or behavior. Tecton styling comes from the theme.
- Passthrough modules are **generated** by `pnpm inventory`. Do not write them by hand.
- Write a hand-written module (a `packages/ui/src/<Name>/` directory without the `AUTO-GENERATED`
  marker) only for a specific requirement. Existing examples: `Icon`, `LocalizationProvider`,
  `DataGrid`, `RichTreeView` and the range pickers. When you add, remove or rename one, run
  `pnpm inventory` so the root barrel, the `exports` map and the inventory are regenerated.
- Never fork, patch or vendor upstream MUI source. Never depend on non-public MUI extension points
  (`@mui/material/*/*` deep paths, `@mui/x-*/internals`). ESLint enforces these import bans. If a
  capability cannot be built on public APIs, build an isolated, independent layer instead.

## 4. Preserve MUI import and prop patterns

- Keep MUI component names, default and named exports, prop names, value types, slots and
  `slotProps`, event signatures, refs, `muiName` and theme keys (`Mui<Component>` `defaultProps`,
  `styleOverrides`, `variants`).
- Both import styles must keep working: root named imports (`import { Button } from
'@tecton-mui/ui'`) and subpath default imports (`import Button from '@tecton-mui/ui/Button'`).
- Do not strip or block `sx`, `className`, `style`, `styled` or theme options, and do not add
  runtime warnings about overrides (SPEC §6.4).
- Advanced components keep MUI's prop names where an equivalent exists, so that consumers can
  migrate. Props that are not implemented must not be accepted by the TypeScript types.

## 5. Tecton only through the adapter and theme

- Tecton reaches the UI package **only** through `packages/tecton-adapter` (build time) and
  `packages/ui/src/styles/tecton/index.ts` (runtime entry). Components never import generated
  Tecton files directly and never hard-code Tecton values. Use the theme or `cssVar()`.
- **Never edit generated files.** They are overwritten and CI fails on any manual change:
  - `packages/ui/src/styles/tecton/generated/**` and `packages/ui/assets/tecton/**` (Tecton
    adapter: `pnpm --filter @tecton-mui/tecton-adapter emit`, checked by `pnpm tecton:check`)
  - every `packages/ui/src/**/index.ts` that starts with `// AUTO-GENERATED`,
    `packages/ui/src/index.ts`, `packages/ui/src/internal/passthrough/**`, the `exports`, `main`
    and `types` fields of `packages/ui/package.json` and
    `tooling/compatibility/export-inventory.json` (`pnpm inventory`, checked by
    `pnpm inventory:check`)
  - `packages/tecton-adapter/vendor/**` (downloaded artifacts with a checksum manifest)
- A Tecton defect against the pinned MUI release is fixed, in order of preference: as a theme-level
  correction in `packages/ui/src/styles/tecton/compat.ts`, as a type-only patch in
  `packages/tecton-adapter/src/normalized/patches.mjs`, or as a minimal runtime patch in
  `runtime-patches.mjs`. Each patch must match exactly once and must state its reason. See
  [repo-docs/tecton-integration.md](./repo-docs/tecton-integration.md).
- Light/dark mode state belongs to Tecton's shared theme manager. Do not add React state for the
  mode. Read it with `useTectonModeValue()` / `useTectonMode()`.

## 6. Commercial MUI X: never

- **Never import, install, copy, port, paraphrase or imitate** code, tests, assets or internals of
  `@mui/x-data-grid-pro`, `@mui/x-data-grid-premium`, `@mui/x-date-pickers-pro`,
  `@mui/x-tree-view-pro`, `@mui/x-license` or any other commercially licensed MUI package. Do not
  look at their source to "see how it is done". ESLint blocks the imports. The rule also covers
  copying from memory.
- **Never copy commercial MUI X documentation**, demos, screenshots or prose without verified
  permission. Write original documentation for independently implemented features.
- MUI X Charts and MUI X Scheduler are out of scope. Do not add them.
- MIT Community code may be used under its license. Keep the notices in
  [`packages/ui/THIRD_PARTY_NOTICES.md`](./packages/ui/THIRD_PARTY_NOTICES.md) up to date when you
  add a dependency.

## 7. Advanced features: modular, upgradeable, tested

- Put each advanced capability in its own module with an explicit upgrade boundary:
  - `packages/ui/src/DataGrid/features/<feature>/` (existing: `sorting-filtering`,
    `pinning-reordering`, `tree-data`, `grouping-aggregation`, `selection-clipboard`,
    `server-data`, `undo-redo`). Shared engine code goes in `core/`. Anything that touches the
    Community grid goes in `mui-community-adapter/`. Public types go in `public-types.ts`.
  - `packages/ui/src/RichTreeView/features/<feature>/` (`core`, `reordering`, `lazy-loading`,
    `virtualization`).
  - `packages/ui/src/internal/range-pickers/`, with thin per-component modules in
    `packages/ui/src/<Name>RangePicker/` and the range fields.
- With no advanced props, an advanced component must behave like its Community counterpart. Each
  feature turns on only through its own props. There are no tier flags and no license keys.
- Every feature needs its own API/behavior tests. Update the support matrix
  (`RichTreeView/SUPPORT.md`, `internal/range-pickers/SUPPORT.md`) or the DataGrid public types in
  the same PR. Do not claim a feature that no passing test covers.

## 8. Performance: avoid unnecessary re-renders

Advanced components (DataGrid, RichTreeView, range pickers) must not re-render more than needed:

- **Stable identities.** Slot components are module-level constants, never components created
  during render. Memoize objects passed as `slots` / `slotProps` / context values. Normalize
  consumer-supplied inline objects (shallow-compare `slots`) so they do not remount children.
  Callbacks given to children are stable (`useEventCallback` or refs to the latest props).
- **External stores with narrow selectors.** High-frequency interaction state (hover, drag
  targets, range highlight, expansion, detail panels) lives in a small external store read with
  `useSyncExternalStore`. Each consumer selects the smallest slice it renders, preferably a
  primitive. See `DataGrid/core/store.ts` and `internal/range-pickers/highlightStore.ts`.
- **Render-count tests.** A change to an interaction path needs a test that counts renders and
  asserts that only the affected cells, rows or items re-render (examples:
  `DataGrid/tests/DataGrid.test.tsx` "without re-rendering other rows", the range calendar
  "re-render budget" tests).
- Build costly derived objects (themes, column definitions, row trees) once and cache them. See
  `getDefaultTheme()` in `styles/createTheme.ts`.

## 9. Platform requirements

- **React 19+**, function components and hooks. React and React DOM stay peer dependencies.
- **ESM only.** Relative imports use the `.js` extension (NodeNext resolution). Keep modules
  side-effect free: importing a component must not touch the DOM, inject CSS or initialize Tecton.
  Interactive modules start with `'use client'`.
- **SSR and hydration safe.** No `window` / `document` access during render or at module
  evaluation. Server and client snapshots must match.
- **Tree shaking.** Do not import advanced components, date adapters or token data from modules
  that basic components depend on. `pnpm test:bundle` checks this.
- **WCAG 2.2 AA** target: semantics, keyboard support, ARIA and focus management are the library's
  responsibility. Test in both Tecton modes and in RTL. Never report an approved accessibility
  exception as compliant (see [CONTRIBUTING.md](./CONTRIBUTING.md#accessibility-exceptions)).
- **No Storybook.** Demos belong in the docs portal (`apps/docs`) and in the Playwright harness
  (`tests/e2e/harness`).
- Do not add consumer-facing lint requirements or MFE orchestration (Module Federation, share
  scopes, cross-MFE messaging).

## 10. Every change

1. Write or update tests (Vitest, plus Playwright for browser behavior) and documentation (the
   docs portal page and, where relevant, `packages/ui/README.md`) for every public API change.
2. Add a changeset (`pnpm changeset`) for any change to a published package.
3. Run the checks before you finish:

   ```bash
   pnpm lint && pnpm format:check && pnpm typecheck
   pnpm inventory:check && pnpm tecton:check
   pnpm test:coverage
   pnpm test:bundle   # when exports, entry points or dependencies change
   pnpm test:e2e      # when rendering, interaction, theming or a11y changes
   ```

4. Do not update dependencies as a side effect. Dependency and MUI upgrades are deliberate,
   separate changes ([repo-docs/dependencies.md](./repo-docs/dependencies.md),
   [repo-docs/mui-upgrades.md](./repo-docs/mui-upgrades.md)).
5. Do not merge automatically. Every change goes through a reviewed PR.
