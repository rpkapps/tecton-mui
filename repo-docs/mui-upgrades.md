# MUI upgrades

Upgrading MUI Core, Lab or X Community is a manual, reviewed change (SPEC §12.1). Do it in a
dedicated PR, never as a side effect of feature work.

## Current pins

Recorded in `tooling/compatibility/export-inventory.json` (`versions`) and in
`packages/ui/package.json`:

| Package                                                                | Version       |
| ---------------------------------------------------------------------- | ------------- |
| `@mui/material`, `@mui/system`, `@mui/utils`, `@mui/stylis-plugin-rtl` | 9.5.0         |
| `@mui/lab`                                                             | 9.0.0-beta.10 |
| `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-tree-view`          | 9.18.0        |

The versions do not have to match across families. Pick each one for compatible peer ranges and
passing tests.

## Procedure

1. **Choose versions.** Read the upstream changelogs and migration notes for every version you
   skip. Check the peer-dependency ranges (`react`, `@mui/material`, `@mui/system`, Emotion) of
   every package you upgrade.
2. **Update the pins** with `pnpm deps:update <pkg>@<exact-version> ...`. The script checks the
   MUI peer constraints, pins the versions in `packages/ui/package.json`, and runs
   `pnpm inventory`, `pnpm tecton:check`, `pnpm typecheck`, `pnpm test` and `pnpm test:bundle`
   ([dependencies.md](./dependencies.md#workflow)). Keep `@mui/x-data-grid` in
   `tests/e2e/harness/package.json` in step by hand. Resolve every new peer-dependency warning.
3. **Review the regenerated export surface** (`pnpm deps:update` already ran `pnpm inventory`; run
   it again after any manual change):

   ```bash
   pnpm inventory
   git diff tooling/compatibility/export-inventory.json packages/ui/package.json packages/ui/src/index.ts
   ```

   Review the following:
   - **New modules:** a new stable component gets a passthrough automatically. Decide whether a new
     Lab module should be excluded: add it to `LAB_EXCLUDED_REASON` in `generate-exports.mjs` with
     a reason. Deprecated "moved to MUI X" stubs are excluded automatically.
   - **Removed modules:** these are breaking changes for consumers. Add a changeset with a major
     bump, or a migration note.
   - **`rootCollisions` and `declarationOnlyValues`:** confirm that the name kept at the root is
     still the intended one.
   - **`overriddenBy`:** hand-written modules shadow these upstream modules. Check their upstream
     changes by hand (see below).

4. **Hand-written modules.** For every module under `customModules`, read the upstream changes to
   the Community component it builds on:
   - `DataGrid`: Community props, slots, events and selectors that `mui-community-adapter/` and
     `DataGrid.tsx` use, and the Community types that `public-types.ts` extends.
   - Range pickers: the public picker APIs listed at the top of
     `src/internal/range-pickers/SUPPORT.md` (`DateCalendar` slots, `PickerDay`, fields,
     validators, `usePickerAdapter`, `usePickerTranslations`).
   - `RichTreeView`: the public items, `apiRef`, `TreeItem` slots and `useTreeItem` APIs it relies
     on.
   - `LocalizationProvider`, `Icon`: their MUI counterparts.

   Use only public APIs. If an upgrade removes a public extension point, implement an independent
   layer instead of reaching into internals.

5. **Tecton compatibility.** Check whether the corrections in
   `packages/ui/src/styles/tecton/compat.ts` and the adapter patches are still needed, or need
   changes: a class name, slot or default-prop location may have changed again. If a type patch no
   longer applies, `pnpm tecton:check` fails.
6. **Run the full suite:**

   ```bash
   pnpm lint && pnpm format:check && pnpm typecheck
   pnpm inventory:check && pnpm tecton:check
   pnpm test:coverage          # includes the advanced-feature suites
   pnpm test:bundle            # exports, SSR import, tree shaking
   pnpm test:e2e               # interactions, a11y, RTL, SSR, visual regression
   pnpm --filter @tecton-mui/docs build
   ```

   Review every visual diff. Update baselines only for intended changes. Report accessibility
   findings that come from Tecton tokens separately from implementation defects.

7. **Update the support matrices** (`RichTreeView/SUPPORT.md`, `internal/range-pickers/SUPPORT.md`,
   DataGrid public types) if behavior or supported props changed.
8. **Documentation sync.** Run `pnpm docs:sync --packages <upgraded packages>` and review the
   result
   ([documentation-sync.md](./documentation-sync.md)).
9. **Changeset.** Add a changeset for `@tecton-mui/ui` that names the new MUI versions and any
   consumer-visible change.
10. **PR.** List the old and new versions, link the upstream changelogs, and summarize the
    inventory diff and the visual diffs. A reviewer approves. Nothing merges automatically.

## Lab components

`@mui/lab` is a beta line. Its components are included as published (`Masonry`, `Timeline*`,
`TabContext`, `TabList`, `TabPanel` and others in the inventory). Their API can change in any
upstream release. Call out Lab changes in the changeset.

## React upgrades

React and React DOM are peers (`^19.0.0`). Support for a new React **major** version needs
compatibility testing across the full suite before the peer range is widened.
