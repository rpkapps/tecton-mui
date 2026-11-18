# Tecton integration

Tecton is the design system the library applies by default. It reaches `@tecton-mui/ui` only
through the **build-time adapter** in `packages/tecton-adapter` and the internal runtime entry
`packages/ui/src/styles/tecton/index.ts`. Nothing fetches Tecton at application runtime.

## Pinned source

`packages/tecton-adapter/tecton.config.json`:

| Key                     | Value                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`               | `0.11.2`                                                                                                                                           |
| `source`                | `umd` (the only implemented source)                                                                                                                |
| `umd.baseUrl`           | `https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils`                                                                                     |
| `umd.artifacts`         | `tecton-core/{version}/fonts.css`, `tecton-core/{version}/icons.css`, `tecton-mui/{version}/index.umd.js`, `tecton-mui/{version}/index.umd.js.map` |
| `umd.relativeAssetBase` | font URLs in `fonts.css` resolve against `tecton-core/{version}/`                                                                                  |
| `npm`                   | `@webframework/tecton-core`, `@webframework/tecton-mui` (for the future npm source)                                                                |

Fonts and icons come from `tecton-core`, while the UMD comes from `tecton-mui`. Both use the same
version.

### Key finding: the UMD is not used at runtime

The UMD bundle contains its **own copies of React and MUI**. Loading it would duplicate React and
MUI and bypass our pinned versions, so it is never executed or shipped. Instead, the adapter reads
the **source map** (`index.umd.js.map`, `sourcesContent`):

- The compiled `tecton-core` ESM module (`…core/dist/index.mjs`) provides the tokens, token
  injection, the theme manager, palettes, scales and typography.
- The original `tecton-mui` TypeScript sources (`../src/**`) provide `createMuiTheme`, the
  component overrides and `useKeyboardFocusVisible`.
- Sources under `node_modules` (the bundled React/MUI) are ignored.

The UMD itself is still downloaded and checksummed, because its banner is checked against the
pinned version.

## Commands

| Command                                         | Network | What it does                                                                                                                                                       |
| ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm tecton:sync` (adapter `sync`)             | Yes     | Downloads all artifacts and the font files referenced by `fonts.css` into `vendor/<version>/`, writes `manifest.json` (sha256 and size per file), then runs `emit` |
| `pnpm --filter @tecton-mui/tecton-adapter emit` | No      | Verifies the vendor manifest, normalizes, and rewrites the generated output in `packages/ui`                                                                       |
| `pnpm tecton:check` (adapter `check`)           | No      | Verifies the vendor checksums and that the generated output in `packages/ui` is byte-identical to a fresh `emit`                                                   |

`vendor/<version>/` is committed, so `emit` and `check` (and CI) work offline.

**Behind a proxy:** `sync` uses Node's built-in `fetch`. Set `NODE_USE_ENV_PROXY=1` so that Node
uses `HTTPS_PROXY` / `HTTP_PROXY`:

```bash
NODE_USE_ENV_PROXY=1 pnpm tecton:sync
```

How CI would obtain private or CDN artifacts without vendoring is still undecided (SPEC §6.2).

## Adapter layout

```text
packages/tecton-adapter/
├── tecton.config.json
├── scripts/tecton.mjs            # CLI: sync | emit | check
├── src/
│   ├── source-umd/index.mjs      # download, verify manifest, read UMD/source map -> RawTectonSource
│   ├── source-npm/index.mjs      # future npm source (throws "not implemented")
│   └── normalized/
│       ├── contract.ts           # RawTectonSource, NormalizedTectonTheme (internal contract)
│       ├── normalize.mjs         # RawTectonSource -> NormalizedTectonTheme
│       ├── patches.mjs           # type-only patches + patch runner
│       └── runtime-patches.mjs   # minimal runtime patches
└── vendor/<version>/             # downloaded artifacts + manifest.json
```

### Contract

Each source adapter returns a `RawTectonSource`: version, origin, the `tecton-core` module, the
`tecton-mui` sources, `fontsCss`, `iconsCss`, font binaries and provenance URLs. The normalizer
turns it into a `NormalizedTectonTheme` (modes, tokens CSS and names, icons, TypeScript modules
and static assets). Applications never see these types. A future npm source only has to produce the
same `RawTectonSource`. Component imports and public theme APIs do not change.

### Normalization

Every transformation is an asserted string operation. An upstream change that breaks an assumption
fails the build instead of silently producing a wrong theme.

- **Export check:** the `tecton-core` export list must match the expected set exactly.
- **Region splitting:** the core module is split on its `//#region` markers into `core/tokens.ts`,
  `injectTokens.ts`, `ThemeManager.ts`, `palette-light.ts`, `palette-dark.ts`, `scales.ts` and
  `typography.ts`, with a typed facade in `core/index.ts`.
- **No import-time side effects:** upstream calls `injectTectonTokens()` in its index module and
  constructs the shared theme manager at import time. The normalizer drops the index side effect
  and removes the eager construction, so `sharedThemeManager()` creates the manager lazily on first
  call. It is still shared through `globalThis.__WEBFRAMEWORK_TECTON_THEME_MANAGER__`, so every root
  and bundle on the page uses one manager.
- **`tecton-mui` sources:** imports of `@webframework/tecton-core` are rewritten to the generated
  core. Relative imports get `.js` extensions. Any other import except `react` and `@mui/material`
  fails the build. The `createMuiTheme` signature is asserted.
- **Validation:**
  - The token CSS must contain the `:root, [data-theme="light"]` and `[data-theme="dark"]` blocks.
  - Every `cssVar('…')` the theme uses must exist as a token, or be a component-scoped variable
    the theme declares itself.
  - Every `tecton-*-outline` / `-filled` icon class the theme references must exist in `icons.css`.
  - The core icon `add` must exist.
- **Icons:** icon names and variants are parsed from `icons.css` into the `TectonIconName` types
  and `tectonIconVariants`, which the `Icon` component uses.

### Patches

`patches.mjs` and `runtime-patches.mjs` hold the corrections applied to the verbatim upstream
TypeScript. Every patch has a `reason`, and it **must match exactly once** or the build fails, so
an upstream change forces a review of the patch.

| Patch                                   | Kind    | Reason                                                                                            |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `createMuiTheme.ts` type imports        | Type    | `verbatimModuleSyntax` requires `type` modifiers                                                  |
| `components/pickers.ts` slot callback   | Type    | MUI X slot overrides are loosely typed; annotate `ownerState`                                     |
| `components/tables.ts` pagination slots | Type    | `@ts-expect-error` on the slot location MUI 9 ignores; the runtime fix is in `compat.ts`          |
| `components/shared.ts` slot icon props  | Runtime | Strip `ownerState` / `sortingOrder`, which MUI X passes to slot components, from the DOM `<span>` |

Type patches may only add type syntax. They must never change the emitted JavaScript.

## Generated output

Written by `emit` and listed with checksums in
`packages/ui/src/styles/tecton/generated/GENERATED.json`:

| Path (in `packages/ui`)                              | Contents                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/styles/tecton/generated/core/*`                 | tokens string, token injection, `ThemeManager`, palettes, scales, typography |
| `src/styles/tecton/generated/mui/*`                  | `createMuiTheme`, component overrides, `useKeyboardFocusVisible`             |
| `src/styles/tecton/generated/icons.ts`               | icon name types and variants                                                 |
| `src/styles/tecton/generated/meta.ts`                | `TECTON_VERSION`, `TECTON_SOURCE`, `TECTON_MODES`, `TECTON_TOKEN_COUNT`      |
| `assets/tecton/tokens.css`, `fonts.css`, `icons.css` | static CSS (with a "do not edit" header)                                     |
| `assets/tecton/assets/fonts/*.woff2`                 | Figtree and IBM Plex Mono font files                                         |
| `assets/tecton/provenance.json`                      | version, origin and the source URL of each artifact                          |

**Never edit these files.** `pnpm tecton:check` fails on any difference.

## Runtime layer (`packages/ui/src/styles`)

- `tecton/index.ts` is the entry the rest of the package uses. Only it, `tecton/compat.ts` and
  `ssr.tsx` (for the tokens string) import `generated/**`. `buildTectonTheme(mode, options)`
  deep-merges `muiCompatOverrides` and the caller's options into the Tecton
  `createMuiTheme({ mode, overrides })` result, then applies `applyThemeCompat`.
- `tecton/compat.ts` holds **documented corrections between Tecton 0.11.2 and the pinned MUI
  release**. Remove each one once Tecton catches up:
  - **TablePagination icon slots:** Tecton passes the previous/next icons through
    `slotProps.actions.slots`, which MUI 9 ignores. The correction sets them through
    `MuiTablePagination.defaultProps.slots.actions`.
  - **PickerDay state classes:** MUI X 9 renders `Mui-selected` / `Mui-disabled`, while Tecton
    styles `.MuiPickerDay-selected` / `.MuiPickerDay-disabled`. The correction copies the Tecton
    rules onto the classes MUI renders (including the `today:not(selected)` rule).
  - **RichTreeView defaults:** Tecton themes only `MuiSimpleTreeView`. The correction makes
    `MuiRichTreeView` share the same theme entry.
- `tecton/augmentations.ts` re-declares the Tecton prop augmentations (`activated`, `shape`,
  `emphasis`, `tier`, `productColor`, extra variants and sizes). Upstream declares them in its entry
  module, which is not part of the source map, so they are derived from the variant predicates in
  the generated theme.
- `modeStore.ts` bridges the shared theme manager to React with `useSyncExternalStore`. The manager
  is created on first browser use (`ThemeProvider`, `useTectonMode`, `initTecton()`). Before that,
  `markStaticTokens()` checks whether `--tecton-space-100` is already set on `<html>` (from
  `global.css`). If so, it adds a `<style data-tecton="tokens" data-tecton-static>` marker, and the
  manager's idempotent `injectTectonTokens()` does not inject a second copy. On the server there is
  no manager, and the mode is `light` or the `defaultMode` passed to `initTecton()`.
- `ssr.tsx`: `TectonModeScript` mirrors the manager's storage and `system` logic, and sets
  `data-theme` before paint. `TectonTokensStyle` server-renders the tokens with the
  `data-tecton="tokens"` marker.

The theme manager persists the preference in `localStorage` (`tecton-theme-mode`), follows
`prefers-color-scheme` for `system`, listens to `storage` events from other tabs, and sets
`data-theme` on `<html>`.

## Upgrading Tecton

1. In a dedicated branch, change `version` in `tecton.config.json`. Check that the artifact paths
   still apply.
2. Run `NODE_USE_ENV_PROXY=1 pnpm tecton:sync` (drop the variable when no proxy is used). The old
   `vendor/<old-version>/` directory can be deleted once the new one is committed.
3. If `emit` fails, read the assertion message. It names the assumption that changed: the export
   list, a region, a token or icon reference, or a patch that no longer matches exactly once.
   Update the normalizer or the patches deliberately. Remove patches and `compat.ts` entries that
   upstream has fixed.
4. Review the diff of the generated output, `provenance.json`, the icon list and the token count.
   Removed icon names are breaking changes for `Icon` consumers.
5. Run the full suite, including visual regression and axe in both modes. Update the visual
   baselines only for intended changes, and report token-related accessibility findings separately
   (see [CONTRIBUTING.md](../CONTRIBUTING.md#accessibility-exceptions)).
6. Update `packages/ui/THIRD_PARTY_NOTICES.md` if the fonts or licensing changed, add a changeset
   for `@tecton-mui/ui`, and open a PR.

### Switching to the npm source (future)

Implement `loadNpm()` in `src/source-npm/index.mjs` so that it returns the same `RawTectonSource`,
then set `"source": "npm"` in `tecton.config.json`. Component code and public APIs stay unchanged.
The npm package names and access are still unconfirmed (SPEC §15.2).
